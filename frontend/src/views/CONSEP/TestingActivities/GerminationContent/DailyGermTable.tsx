import React, { useMemo, useRef, useState } from 'react';
import { DatePicker, DatePickerInput, Modal } from '@carbon/react';

import {
  GermCountSlotType,
  GermReplicateType
} from '../../../../types/consep/GerminationType';
import GenericTable from '../../../../components/GenericTable';
import {
  calcDayNumber, calcRepTotal, calcGermPct, isoToJsDate, parseCountDateInput,
  resolveDayZero, toLocalIsoDate, REP_COUNT_KEYS
} from './utils';
import {
  buildTableRows, getDailyGermColumns, DailyGermHandlers, GermTableRow,
  DATE_FORMAT, DATE_PLACEHOLDER
} from './constants';

import './styles.scss';

type DailyGermTableProps = {
  slots: GermCountSlotType[];
  replicates: GermReplicateType[];
  germinatorEntry?: string;
  isEditable: boolean;
  validationErrors: Record<string, string>;
  onSlotsChange: (slots: GermCountSlotType[]) => void;
  onReplicatesChange: (replicates: GermReplicateType[]) => void;
};

const DailyGermTable = ({
  slots, replicates, germinatorEntry, isEditable,
  validationErrors, onSlotsChange, onReplicatesChange
}: DailyGermTableProps) => {
  // Which column's date the modal is editing, if any.
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  // A read-only screen has no picker to leave open.
  const activeSlot = isEditable ? editingSlot : null;
  const editingSlotData = slots.find((slot) => slot.slotIndex === activeSlot);
  // AC6: which column the user is working in. The date modal counts as working
  // in a column too, so the highlight survives picking a date.
  const [focusedSlot, setFocusedSlot] = useState<number | null>(null);
  const highlightedSlot = activeSlot ?? focusedSlot;

  const updateSlot = (slotIndex: number, patch: Partial<GermCountSlotType>) => {
    onSlotsChange(slots.map((slot) => (
      slot.slotIndex === slotIndex ? { ...slot, ...patch } : slot
    )));
  };

  const updateReplicate = (repNumber: number, patch: Partial<GermReplicateType>) => {
    onReplicatesChange(replicates.map((rep) => (
      rep.replicateNumber === repNumber ? { ...rep, ...patch } : rep
    )));
  };

  const setCountDate = (slotIndex: number, isoDate?: string) => {
    // Clearing the date (I4) must also clear that slot's rep counts: they are
    // dropped from the payload and wiped server-side, so keeping them in state
    // would show ghost values in the now-disabled inputs and inflate totals.
    const cleared = isoDate
      ? {}
      : {
        rep1NoSeedsGerm: undefined,
        rep2NoSeedsGerm: undefined,
        rep3NoSeedsGerm: undefined,
        rep4NoSeedsGerm: undefined
      };
    updateSlot(slotIndex, {
      countDt: isoDate,
      // Day zero is taken from the other slots when the header has no
      // germinator entry date, so editing one column does not blank a day
      // number the record already carries.
      dayNoOfTest: isoDate
        ? calcDayNumber(resolveDayZero(germinatorEntry, slots, slotIndex), isoDate)
        : undefined,
      ...cleared
    });
  };

  // Arriving at a date cell fills today's date on an empty column and opens the
  // calendar on one that already has a date.
  const fromPointer = useRef(false);
  // Carbon returns focus to the trigger when the modal closes, which would
  // otherwise read as a fresh arrival and reopen it.
  const skipNextFocus = useRef(false);

  const activateDateCell = (slotIndex: number) => {
    const slot = slots.find((s) => s.slotIndex === slotIndex);
    if (slot?.countDt) {
      setEditingSlot(slotIndex);
    } else {
      setCountDate(slotIndex, toLocalIsoDate(new Date()));
    }
  };

  const closeDateModal = () => {
    skipNextFocus.current = true;
    setEditingSlot(null);
  };

  const handlers: DailyGermHandlers = {
    // Free-text entry: only an empty field clears the date. Anything else that
    // does not parse is a date the user is still typing, so it is ignored
    // rather than treated as a clear.
    onCountDateChange: (slotIndex, raw) => {
      if (!raw.trim()) {
        setCountDate(slotIndex, undefined);
        return;
      }
      const isoDate = parseCountDateInput(raw);
      if (isoDate) {
        setCountDate(slotIndex, isoDate);
      }
    },
    onCountDatePick: (slotIndex, date) => {
      setCountDate(slotIndex, date ? toLocalIsoDate(date) : undefined);
      // Picking from the calendar is a complete edit, so close the modal.
      // Typing does not, or the field would vanish mid-entry.
      closeDateModal();
    },
    onEditDateSlot: setEditingSlot,
    onDateCellActivate: (slotIndex) => {
      fromPointer.current = true;
      skipNextFocus.current = false;
      setFocusedSlot(slotIndex);
      activateDateCell(slotIndex);
    },
    onDateCellFocus: (slotIndex) => {
      setFocusedSlot(slotIndex);
      // A pointer click focuses before it clicks; mousedown already acted.
      if (fromPointer.current || skipNextFocus.current) {
        fromPointer.current = false;
        skipNextFocus.current = false;
        return;
      }
      activateDateCell(slotIndex);
    },
    onSlotFocus: setFocusedSlot,
    onCountChange: (repNumber, slotIndex, raw) => {
      const parsed = raw === '' ? undefined : parseInt(raw, 10);
      updateSlot(slotIndex, {
        [REP_COUNT_KEYS[repNumber - 1]]: Number.isNaN(parsed) ? undefined : parsed
      });
    },
    onSeedsChange: (repNumber, raw) => {
      const parsed = raw === '' ? undefined : parseInt(raw, 10);
      updateReplicate(repNumber, {
        totalNoSeeds: Number.isNaN(parsed) ? undefined : parsed
      });
    },
    onOverrideToggle: (repNumber, checked) => {
      updateReplicate(repNumber, { tolrncOvrrdeDesc: checked ? 'ok' : null });
    },
    onAcceptToggle: (repNumber, checked) => {
      updateReplicate(repNumber, { repAcceptedInd: checked ? 1 : 0 });
    }
  };

  const rows = useMemo<GermTableRow[]>(
    () => buildTableRows(slots, replicates),
    [slots, replicates]
  );

  const columns = getDailyGermColumns(slots, isEditable, validationErrors, handlers, highlightedSlot);

  const errorMessages = Object.values(validationErrors).filter(Boolean);

  return (
    <div className="daily-germ-table-container">
      <h3>Daily germination</h3>
      {errorMessages.length > 0 && (
        <div className="daily-germ-errors" role="alert">
          {errorMessages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}
      <div className="daily-germ-table">
        <GenericTable
          columns={columns}
          data={rows}
          isCompacted
        />
      </div>
      {editingSlotData && (
        <Modal
          open
          passiveModal
          className="germ-count-date-modal"
          modalHeading={`Count date ${editingSlotData.slotIndex}`}
          onRequestClose={closeDateModal}
        >
          <DatePicker
            datePickerType="single"
            allowInput
            // The modal exists to be a calendar, so render it open and in flow
            // rather than as a dropdown the user has to summon.
            inline
            dateFormat={DATE_FORMAT}
            value={editingSlotData.countDt ? [isoToJsDate(editingSlotData.countDt)] : []}
            onChange={(dates: Array<Date>) => (
              handlers.onCountDatePick(editingSlotData.slotIndex, dates[0])
            )}
          >
            <DatePickerInput
              id={`germ-date-input-${editingSlotData.slotIndex}`}
              data-testid={`germ-date-${editingSlotData.slotIndex}`}
              labelText="Count date"
              hideLabel
              placeholder={DATE_PLACEHOLDER}
              autoComplete="off"
              // Carbon focuses this on open and flatpickr opens on focus, so
              // the calendar is already down when the modal appears.
              data-modal-primary-focus
              invalid={!!validationErrors[`slot-${editingSlotData.slotIndex}`]}
              invalidText={validationErrors[`slot-${editingSlotData.slotIndex}`]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (
                handlers.onCountDateChange(editingSlotData.slotIndex, e.target.value)
              )}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  closeDateModal();
                }
              }}
            />
          </DatePicker>
        </Modal>
      )}
      <div className="replicate-total">
        <p className="replicate-total-label">Replicate total</p>
        <div className="replicate-total-tiles">
          {replicates.map((rep) => (
            <span
              key={rep.replicateNumber}
              className="replicate-total-tile"
              data-testid={`germ-pct-${rep.replicateNumber}`}
            >
              {`${calcGermPct(calcRepTotal(slots, rep.replicateNumber as 1 | 2 | 3 | 4), rep.totalNoSeeds)}%`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyGermTable;
