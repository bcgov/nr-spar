import React, {
  useEffect, useMemo, useRef, useState
} from 'react';
import { DatePicker, DatePickerInput, Modal } from '@carbon/react';

import {
  GermCountSlotType,
  GermReplicateType
} from '../../../../types/consep/GerminationType';
import GenericTable from '../../../../components/GenericTable';
import {
  calcDayNumber, getSlotDateBounds, isoToJsDate, parseCountDateInput,
  parseCountInput, resolveDayZero, toLocalIsoDate, REP_COUNT_KEYS
} from './utils';
import {
  abnormalInputId, buildTableRows, countInputId, dateTriggerId, focusLater,
  getDailyGermColumns, DailyGermHandlers, GermTableRow,
  DATE_FORMAT, DATE_PLACEHOLDER, REP_COUNT
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
  /**
   * The count day the user has moved into (#2606). Unlike the AC6 highlight
   * this is sticky -- it never goes back to "none" on blur, because the
   * abnormals table below has to keep showing a day while it is being typed in.
   */
  onSlotSelect: (slotIndex: number) => void;
  /** Saved data has loaded, so the next empty date column can take focus (#2681). */
  isHydrated?: boolean;
  /** Where Enter goes after replicate 4: the abnormals table's first cell. */
  firstAbnormalCode?: string;
};

const DailyGermTable = ({
  slots, replicates, germinatorEntry, isEditable,
  validationErrors, onSlotsChange, onReplicatesChange, onSlotSelect,
  isHydrated = false, firstAbnormalCode
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

  const enterSlot = (slotIndex: number | null) => {
    setFocusedSlot(slotIndex);
    if (slotIndex !== null) {
      onSlotSelect(slotIndex);
    }
  };

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
        rep4NoSeedsGerm: undefined,
        rep1Abnormal: undefined,
        rep2Abnormal: undefined,
        rep3Abnormal: undefined,
        rep4Abnormal: undefined
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

  // Keyboard entry runs down a date column -- one date, then its four
  // replicates -- across the grain of a table whose rows are replicates (#2681).
  const focusCount = (repNumber: number, slotIndex: number) => {
    focusLater(countInputId(repNumber, slotIndex));
  };
  // Enter holds focus on a count whose edit put its replicate over the limit,
  // but a replicate that was already invalid on arrival (say # seeds was
  // lowered on an old record) must not trap the user in the cell.
  const invalidOnArrival = useRef(false);

  // #2681: open on the next empty date column, ready for Enter. Dates must
  // increase, so that is the one after the last dated column. Being focused by
  // the page is not the user arriving: it must not fill today's date, or merely
  // opening a test would write a count date and autosave it.
  const autoFocused = useRef(false);
  useEffect(() => {
    if (!isHydrated || !isEditable || autoFocused.current) {
      return;
    }
    autoFocused.current = true;
    const lastDated = slots.reduce((last, slot) => (slot.countDt ? slot.slotIndex : last), 0);
    const trigger = document.getElementById(dateTriggerId(lastDated + 1));
    if (trigger) {
      skipNextFocus.current = true;
      trigger.focus();
    }
    // Once per screen: only the hydration gate decides when, not later edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, isEditable]);

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
      enterSlot(slotIndex);
      activateDateCell(slotIndex);
    },
    onDateCellFocus: (slotIndex) => {
      enterSlot(slotIndex);
      // A pointer click focuses before it clicks; mousedown already acted.
      if (fromPointer.current || skipNextFocus.current) {
        fromPointer.current = false;
        skipNextFocus.current = false;
        return;
      }
      activateDateCell(slotIndex);
    },
    onSlotFocus: enterSlot,
    onDateCellEnter: (slotIndex) => {
      // An empty column takes today's date -- the page's own focus on load
      // deliberately did not fill it -- and its counts open up for entry.
      if (!slots.find((s) => s.slotIndex === slotIndex)?.countDt) {
        setCountDate(slotIndex, toLocalIsoDate(new Date()));
      }
      focusCount(1, slotIndex);
    },
    onCountFocus: (repNumber, slotIndex) => {
      invalidOnArrival.current = !!validationErrors[`rep-${repNumber}`];
      enterSlot(slotIndex);
    },
    onCountEnter: (repNumber, slotIndex) => {
      if (validationErrors[`rep-${repNumber}`] && !invalidOnArrival.current) {
        // Staying put is a refocus too: MRT's blur may have just taken it away.
        focusCount(repNumber, slotIndex);
        return;
      }
      // Entering through an empty count records it as counted zero (#2681).
      const countKey = REP_COUNT_KEYS[repNumber - 1];
      if (slots.find((s) => s.slotIndex === slotIndex)?.[countKey] === undefined) {
        updateSlot(slotIndex, { [countKey]: 0 });
      }
      if (repNumber < REP_COUNT) {
        focusCount(repNumber + 1, slotIndex);
      } else if (firstAbnormalCode) {
        // The abnormals table is already showing this column's day: focusing
        // the count selected it.
        focusLater(abnormalInputId(1, firstAbnormalCode));
      }
    },
    onCountChange: (repNumber, slotIndex, raw) => {
      const parsed = parseCountInput(raw);
      if (parsed === null) {
        return;
      }
      updateSlot(slotIndex, { [REP_COUNT_KEYS[repNumber - 1]]: parsed });
    },
    onSeedsChange: (repNumber, raw) => {
      const parsed = parseCountInput(raw);
      if (parsed === null) {
        return;
      }
      updateReplicate(repNumber, { totalNoSeeds: parsed });
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

  const errorEntries = Object.entries(validationErrors).filter(([, message]) => Boolean(message));

  return (
    <div className="daily-germ-table-container">
      <h3>Daily germination</h3>
      {errorEntries.length > 0 && (
        <div className="daily-germ-errors" role="alert">
          {errorEntries.map(([errorKey, message]) => (
            <p key={errorKey}>{message}</p>
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
            // Chronological order enforced in the calendar itself: the days
            // before the previous column's date, and after the next one's, are
            // not selectable rather than merely flagged after the fact.
            {...getSlotDateBounds(slots, editingSlotData.slotIndex)}
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
    </div>
  );
};

export default DailyGermTable;
