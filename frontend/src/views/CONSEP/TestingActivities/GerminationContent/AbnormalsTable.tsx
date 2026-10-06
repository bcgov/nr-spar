import React, { useMemo } from 'react';
import { MRT_ColumnDef } from 'material-react-table';

import {
  GermCountSlotType,
  GermReplicateType,
  ReplicateAbnormalType
} from '../../../../types/consep/GerminationType';
import GenericTable from '../../../../components/GenericTable';
import { calcSlotAbnormalTotal, REP_ABNORMAL_KEYS } from './utils';
import { fixedWidth, numberFieldSx } from './constants';

import './styles.scss';

/**
 * The eleven abnormality categories, in the order and under the short labels
 * the CONSEP screen has always used. That order is not the order the API
 * declares them in (it puts the megametophyte collar before weak), so the two
 * are kept apart deliberately: `field` is the API contract, `code` is the
 * screen (the column header is just the code in caps).
 */
export const ABNORMAL_CATEGORIES = [
  { code: 're', field: 'abnormalNumReverseEmbryo', title: 'Reverse embryo' },
  { code: 'str', field: 'abnormalNumStuntedRadicle', title: 'Stunted radicle' },
  { code: 'sth', field: 'abnormalNumStuntedHypocotyl', title: 'Stunted hypocotyl' },
  { code: 'rot', field: 'abnormalNumRotten', title: 'Rotten' },
  { code: 'thh', field: 'abnormalNumThickenedHypocotyl', title: 'Thickened hypocotyl' },
  { code: 'thr', field: 'abnormalNumThickenedRadicle', title: 'Thickened radicle' },
  { code: 'tw', field: 'abnormalNumTwisted', title: 'Twisted' },
  { code: 'wk', field: 'abnormalNumWeak', title: 'Weak' },
  { code: 'cm', field: 'abnormalNumMegametophyteCollar', title: 'Megametophyte collar' },
  { code: 'oth', field: 'abnormalNumOther', title: 'Other' },
  { code: 'pre', field: 'abnormalNumPregermination', title: 'Pregermination' }
] as const;

type AbnormalField = typeof ABNORMAL_CATEGORIES[number]['field'];

type AbnormalTableRow = {
  replicateNumber: number;
  total: number;
  /** Category counts, keyed by the short codes above. */
  [key: string]: number | string | undefined;
};

type AbnormalsTableProps = {
  /** The count day selected in the germinants table, or undefined when none is. */
  slot?: GermCountSlotType;
  replicates: GermReplicateType[];
  isEditable: boolean;
  validationErrors: Record<string, string>;
  onAbnormalChange: (replicateNumber: number, field: AbnormalField, raw: string) => void;
};

const buildRows = (
  slot: GermCountSlotType | undefined,
  replicates: GermReplicateType[]
): AbnormalTableRow[] => replicates.map((rep) => {
  const repNumber = rep.replicateNumber as 1 | 2 | 3 | 4;
  const abnormal: ReplicateAbnormalType | undefined = slot?.[REP_ABNORMAL_KEYS[repNumber - 1]];
  const row: AbnormalTableRow = {
    replicateNumber: rep.replicateNumber,
    total: slot ? calcSlotAbnormalTotal(slot, repNumber) : 0
  };
  ABNORMAL_CATEGORIES.forEach(({ code, field }) => {
    row[code] = abnormal?.[field];
  });
  return row;
});

// Eleven categories side by side, so each is sized to its three-letter label
// rather than to the counts, which are at most three digits.
const CATEGORY_WIDTH = 58;
const CATEGORY_PADDING = '0.125rem';

const buildColumns = (
  isEditable: boolean,
  hasSlot: boolean,
  validationErrors: Record<string, string>,
  onAbnormalChange: AbnormalsTableProps['onAbnormalChange']
): MRT_ColumnDef<AbnormalTableRow>[] => [
  {
    accessorKey: 'replicateNumber',
    header: 'Rep',
    enableEditing: false,
    ...fixedWidth(60, 'left')
  },
  ...ABNORMAL_CATEGORIES.map(({ code, field, title }) => ({
    accessorKey: code,
    header: code.toUpperCase(),
    Header: () => <span title={title}>{code.toUpperCase()}</span>,
    muiEditTextFieldProps: ({ row }: { row: { original: AbnormalTableRow } }) => ({
      // Matches the germ count cells: no spinner, so arrow keys and the scroll
      // wheel cannot nudge a count by accident (#2682). parseCountInput is what
      // rejects non-integers and negatives, not the input type.
      type: 'text',
      value: row.original[code] ?? '',
      // Abnormals hang off a count day; without one selected there is nothing
      // for them to belong to.
      disabled: !isEditable || !hasSlot,
      error: !!validationErrors[`rep-${row.original.replicateNumber}`],
      placeholder: undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onAbnormalChange(
        row.original.replicateNumber,
        field,
        e.currentTarget.value
      ),
      slotProps: {
        htmlInput: {
          'data-testid': `abnormal-${row.original.replicateNumber}-${code}`,
          'aria-label': `Replicate ${row.original.replicateNumber} ${title}`,
          inputMode: 'numeric',
          style: { textAlign: 'right' }
        }
      },
      sx: numberFieldSx
    }),
    ...fixedWidth(CATEGORY_WIDTH, 'right', CATEGORY_PADDING)
  })),
  {
    accessorKey: 'total',
    header: 'Total',
    enableEditing: false,
    Cell: ({ row }: { row: { original: AbnormalTableRow } }) => (
      <span data-testid={`abnormal-total-${row.original.replicateNumber}`}>
        {row.original.total}
      </span>
    ),
    ...fixedWidth(80)
  }
];

/**
 * Abnormal seedling counts for one count day (#2606). The day comes from
 * whichever column the user is working in over in the germinants table, so the
 * counts are always read against a date rather than in the abstract.
 */
const AbnormalsTable = ({
  slot, replicates, isEditable, validationErrors, onAbnormalChange
}: AbnormalsTableProps) => {
  const rows = useMemo(() => buildRows(slot, replicates), [slot, replicates]);
  const columns = buildColumns(isEditable, !!slot, validationErrors, onAbnormalChange);

  return (
    <div className="abnormals-table-container">
      <h3>
        Abnormal seedlings
        {slot?.countDt && (
          <span className="abnormals-table-day">
            {` — ${slot.countDt}${slot.dayNoOfTest === undefined ? '' : ` (day ${slot.dayNoOfTest})`}`}
          </span>
        )}
      </h3>
      {!slot && (
        <p className="abnormals-table-empty">
          Set a count date to record abnormal seedlings against it.
        </p>
      )}
      <div className="abnormals-table">
        <GenericTable
          columns={columns}
          data={rows}
          isCompacted
        />
      </div>
    </div>
  );
};

export default AbnormalsTable;
