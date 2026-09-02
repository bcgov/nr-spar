import React from 'react';
import { MRT_ColumnDef } from 'material-react-table';
import { Checkbox } from '@mui/material';

import {
  GermCountSlotType,
  GermReplicateType
} from '../../../../types/consep/GerminationType';
import {
  calcGermPct, calcRepTotal, formatCountDateLines, REP_COUNT_KEYS
} from './utils';

export const SLOT_COUNT = 13;
export const REP_COUNT = 4;

export const DATE_FORMAT = 'Y/m/d';
export const DATE_PLACEHOLDER = 'yyyy/mm/dd';

/** Accessor key for a slot's count on a flattened replicate row. */
export const slotKey = (slotIndex: number) => `slot${slotIndex}`;

/**
 * One replicate, flattened so material-react-table can address each daily
 * count by `accessorKey`. Counts live per-slot in the API shape, but the table
 * renders one row per replicate.
 */
export type GermTableRow = {
  replicateNumber: number;
  totalNoSeeds?: number;
  repAcceptedInd?: number;
  repTotal: number;
  /** Daily counts, keyed `slot1`..`slot13`. */
  [key: string]: number | string | null | undefined;
};

export const buildTableRows = (
  slots: GermCountSlotType[],
  replicates: GermReplicateType[]
): GermTableRow[] => replicates.map((rep) => {
  const repNumber = rep.replicateNumber as 1 | 2 | 3 | 4;
  const row: GermTableRow = {
    replicateNumber: rep.replicateNumber,
    totalNoSeeds: rep.totalNoSeeds,
    repAcceptedInd: rep.repAcceptedInd,
    repTotal: calcRepTotal(slots, repNumber)
  };
  slots.forEach((slot) => {
    row[slotKey(slot.slotIndex)] = slot[REP_COUNT_KEYS[repNumber - 1]];
  });
  return row;
});

export type DailyGermHandlers = {
  onCountDateChange: (slotIndex: number, raw: string) => void;
  onCountDatePick: (slotIndex: number, date?: Date) => void;
  /** Opens the date-picker modal for a column; `null` closes it. */
  onEditDateSlot: (slotIndex: number | null) => void;
  /** Arriving at a date cell by pointer or by keyboard activation. */
  onDateCellActivate: (slotIndex: number) => void;
  /** Arriving at a date cell by Tab. */
  onDateCellFocus: (slotIndex: number) => void;
  /** The column the user is working in, for the AC6 highlight; `null` clears it. */
  onSlotFocus: (slotIndex: number | null) => void;
  onCountChange: (replicateNumber: number, slotIndex: number, raw: string) => void;
  onSeedsChange: (replicateNumber: number, raw: string) => void;
  onAcceptToggle: (replicateNumber: number, checked: boolean) => void;
};

// `size` is what actually pins a column: the table lays out with
// `table-layout: auto`, where the browser's column algorithm reads `width` and
// all but ignores `max-width`, and MRT writes `width` from `size` (defaulting
// to 180) over anything set through `sx`.
const fixedWidth = (
  size: number,
  alignment: 'left' | 'right' | 'center' = 'right',
  paddingX?: string
) => ({
  size,
  minSize: size,
  maxSize: size,
  muiTableHeadCellProps: {
    align: alignment,
    sx: {
      width: size,
      minWidth: size,
      maxWidth: size,
      ...(paddingX ? { paddingLeft: paddingX, paddingRight: paddingX } : {}),
      // Keep the header layout aligned with GenericTable's own head-cell
      // styles, which these per-column `sx` overrides would otherwise replace.
      '& .Mui-TableHeadCell-Content-Labels': {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '0.25rem',

        '& .Mui-TableHeadCell-Content-Wrapper': {
          order: 1,
          // MRT ellipsizes head labels on one line; the table is sized to its
          // columns, so a label that does not fit has to wrap, not disappear.
          whiteSpace: 'normal',
          overflow: 'visible',
          textOverflow: 'clip'
        },
        '& .MuiBadge-root': {
          order: 2
        }
      }
    }
  },
  muiTableBodyCellProps: {
    align: alignment,
    sx: {
      width: size,
      minWidth: size,
      maxWidth: size,
      paddingTop: 0,
      paddingBottom: 0,
      ...(paddingX ? { paddingLeft: paddingX, paddingRight: paddingX } : {})
    }
  }
});

/**
 * Thirteen count columns sit side by side, so every spare pixel is scroll
 * distance. The date is shown over two lines precisely so this can be sized to
 * the widest single line (`yyyy-`) rather than the whole date; editing happens
 * in a centred modal, so the picker never has to fit in the column.
 */
const SLOT_COLUMN_WIDTH = 56;
const SLOT_COLUMN_PADDING = '0.125rem';

const numberFieldSx = {
  // Without this the field keeps a text input's intrinsic 20-character width,
  // which is what the auto table layout sizes the column to.
  width: '100%',
  minWidth: 0,
  '& .MuiInputBase-root': {
    minWidth: 0
  },
  '& input': {
    width: '100%',
    minWidth: 0
  }
};

/**
 * A count column is a two-row header: the group header holds the count-date
 * trigger, its single leaf column holds the derived day number (AC1/AC2).
 */
const buildSlotColumn = (
  slot: GermCountSlotType,
  isEditable: boolean,
  validationErrors: Record<string, string>,
  handlers: DailyGermHandlers,
  highlightedSlot: number | null
): MRT_ColumnDef<GermTableRow> => {
  // AC6: the column being worked in is highlighted end to end — its date, its
  // day number and its four counts — so the date the counts belong to is never
  // in doubt thirteen narrow columns across.
  const isHighlighted = highlightedSlot === slot.slotIndex;
  const activeClass = isHighlighted ? 'germ-slot-active' : undefined;
  const slotWidth = fixedWidth(SLOT_COLUMN_WIDTH, 'right', SLOT_COLUMN_PADDING);

  return {
    id: `slot-group-${slot.slotIndex}`,
    header: `Count date ${slot.slotIndex}`,
    // Marks the only real cells in the first header row, so the placeholder
    // cells above the ungrouped columns can drop their divider and read as one
    // merged cell with the label below them.
    muiTableHeadCellProps: {
      className: isHighlighted ? 'germ-count-date-head germ-slot-active' : 'germ-count-date-head',
      sx: { paddingLeft: SLOT_COLUMN_PADDING, paddingRight: SLOT_COLUMN_PADDING }
    },
    // The date over two lines, which is what keeps the column narrow. Arriving
    // here fills today's date on an empty column and opens the picker on one
    // that already has a date.
    //
    // Three handlers because a mouse click fires focus AND click, and each
    // arrival must act exactly once: mousedown claims the pointer route, focus
    // covers Tab, and click covers Enter/Space (detail 0 — no pointer behind
    // it) on a trigger that already holds focus.
    Header: () => (
      <button
        type="button"
        className="germ-count-date-trigger"
        data-testid={`germ-date-trigger-${slot.slotIndex}`}
        disabled={!isEditable}
        aria-label={slot.countDt
          ? `Count date ${slot.slotIndex}: ${slot.countDt}`
          : `Set count date ${slot.slotIndex} to today`}
        onMouseDown={() => handlers.onDateCellActivate(slot.slotIndex)}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (e.detail === 0) {
            handlers.onDateCellActivate(slot.slotIndex);
          }
        }}
        onFocus={() => handlers.onDateCellFocus(slot.slotIndex)}
        onBlur={() => handlers.onSlotFocus(null)}
      >
        {slot.countDt
          ? formatCountDateLines(slot.countDt).map((line) => <span key={line}>{line}</span>)
          : <span className="germ-count-date-empty">--</span>}
      </button>
    ),
    columns: [
      {
        accessorKey: slotKey(slot.slotIndex),
        header: `Day ${slot.slotIndex}`,
        Header: () => (
          <span data-testid={`germ-day-${slot.slotIndex}`}>{slot.dayNoOfTest ?? ''}</span>
        ),
        muiEditTextFieldProps: ({ row }: { row: { original: GermTableRow } }) => ({
          // Deliberately not `type="number"`: its arrow-key and scroll-wheel
          // stepping changed counts by accident (#2682). `parseCountInput` is
          // what rejects non-integers, not the input type.
          type: 'text',
          value: row.original[slotKey(slot.slotIndex)] ?? '',
          // A count only makes sense once its column has a date, and clearing
          // the date wipes the counts server-side.
          disabled: !isEditable || !slot.countDt,
          error: !!validationErrors[`rep-${row.original.replicateNumber}`],
          placeholder: undefined,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => handlers.onCountChange(
            row.original.replicateNumber,
            slot.slotIndex,
            e.currentTarget.value
          ),
          onFocus: () => handlers.onSlotFocus(slot.slotIndex),
          onBlur: () => handlers.onSlotFocus(null),
          inputProps: {
            'data-testid': `germ-count-${row.original.replicateNumber}-${slot.slotIndex}`,
            'aria-label': `Replicate ${row.original.replicateNumber} count ${slot.slotIndex}`,
            inputMode: 'numeric',
            style: { textAlign: 'right' }
          },
          sx: numberFieldSx
        }),
        ...slotWidth,
        muiTableHeadCellProps: { ...slotWidth.muiTableHeadCellProps, className: activeClass },
        muiTableBodyCellProps: { ...slotWidth.muiTableBodyCellProps, className: activeClass }
      }
    ]
  };
};

export const getDailyGermColumns = (
  slots: GermCountSlotType[],
  isEditable: boolean,
  validationErrors: Record<string, string>,
  handlers: DailyGermHandlers,
  highlightedSlot: number | null
): MRT_ColumnDef<GermTableRow>[] => [
  {
    accessorKey: 'replicateNumber',
    header: 'Rep',
    enableEditing: false,
    ...fixedWidth(60, 'left')
  },
  ...slots.map((slot) => (
    buildSlotColumn(slot, isEditable, validationErrors, handlers, highlightedSlot)
  )),
  {
    accessorKey: 'repTotal',
    header: 'Rep total',
    enableEditing: false,
    Cell: ({ row }: { row: { original: GermTableRow } }) => (
      <span data-testid={`germ-rep-total-${row.original.replicateNumber}`}>
        {row.original.repTotal}
      </span>
    ),
    ...fixedWidth(110)
  },
  {
    accessorKey: 'totalNoSeeds',
    header: '# seeds',
    muiEditTextFieldProps: ({ row }: { row: { original: GermTableRow } }) => ({
      // See the count cells above: no spinner, so no accidental stepping.
      type: 'text',
      value: row.original.totalNoSeeds ?? '',
      disabled: !isEditable,
      error: !!validationErrors[`rep-${row.original.replicateNumber}`],
      placeholder: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handlers.onSeedsChange(
        row.original.replicateNumber,
        e.currentTarget.value
      ),
      inputProps: {
        'data-testid': `germ-seeds-${row.original.replicateNumber}`,
        'aria-label': `Replicate ${row.original.replicateNumber} number of seeds`,
        inputMode: 'numeric',
        style: { textAlign: 'right' }
      },
      sx: numberFieldSx
    }),
    ...fixedWidth(100)
  },
  {
    // The replicate's germination percentage, in the table rather than on tiles
    // below it (#2682): it is read against the row it belongs to.
    id: 'germPct',
    header: 'Germ %',
    enableEditing: false,
    Cell: ({ row }: { row: { original: GermTableRow } }) => (
      <span data-testid={`germ-pct-${row.original.replicateNumber}`}>
        {`${calcGermPct(row.original.repTotal, row.original.totalNoSeeds)}%`}
      </span>
    ),
    ...fixedWidth(90)
  },
  {
    accessorKey: 'repAcceptedInd',
    header: 'Acc',
    enableEditing: false,
    Cell: ({ row }: { row: { original: GermTableRow } }) => (
      <Checkbox
        size="small"
        checked={row.original.repAcceptedInd === 1}
        disabled={!isEditable || !!validationErrors[`rep-${row.original.replicateNumber}`]}
        inputProps={{
          'data-testid': `germ-acc-${row.original.replicateNumber}`,
          'aria-label': `Replicate ${row.original.replicateNumber} accepted`
        } as React.InputHTMLAttributes<HTMLInputElement>}
        onChange={(e) => handlers.onAcceptToggle(
          row.original.replicateNumber,
          e.target.checked
        )}
      />
    ),
    ...fixedWidth(80, 'center')
  }
];
