import React from 'react';

import {
  GermCountSlotType,
  GermReplicateType
} from '../../../../types/consep/GerminationType';
import { calcDayNumber, calcRepTotal, calcGermPct } from './utils';

import './styles.scss';

const SLOT_COUNT = 13;
const REP_COUNT_KEYS = [
  'rep1NoSeedsGerm', 'rep2NoSeedsGerm', 'rep3NoSeedsGerm', 'rep4NoSeedsGerm'
] as const;

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
  const updateSlot = (slotIndex: number, patch: Partial<GermCountSlotType>) => {
    onSlotsChange(slots.map((slot) => (
      slot.slotIndex === slotIndex ? { ...slot, ...patch } : slot
    )));
  };

  const handleDateChange = (slotIndex: number, value: string) => {
    // Clearing the date (I4) must also clear that slot's rep counts: they are
    // dropped from the payload and wiped server-side, so keeping them in state
    // would show ghost values in the now-disabled inputs and inflate totals.
    const cleared = value
      ? {}
      : {
        rep1NoSeedsGerm: undefined,
        rep2NoSeedsGerm: undefined,
        rep3NoSeedsGerm: undefined,
        rep4NoSeedsGerm: undefined
      };
    updateSlot(slotIndex, {
      countDt: value || undefined,
      dayNoOfTest: value ? calcDayNumber(germinatorEntry, value) : undefined,
      ...cleared
    });
  };

  const handleCountChange = (repNumber: number, slotIndex: number, raw: string) => {
    const parsed = raw === '' ? undefined : parseInt(raw, 10);
    updateSlot(slotIndex, {
      [REP_COUNT_KEYS[repNumber - 1]]: Number.isNaN(parsed) ? undefined : parsed
    });
  };

  const updateReplicate = (repNumber: number, patch: Partial<GermReplicateType>) => {
    onReplicatesChange(replicates.map((rep) => (
      rep.replicateNumber === repNumber ? { ...rep, ...patch } : rep
    )));
  };

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
      <div className="daily-germ-table-scroll">
        <table className="daily-germ-table">
          <thead>
            <tr>
              <th rowSpan={2}>Rep</th>
              {Array.from({ length: SLOT_COUNT }, (_, i) => {
                const slot = slots[i];
                return (
                  <th key={`date-${slot.slotIndex}`} className={validationErrors[`slot-${slot.slotIndex}`] ? 'cell-invalid' : ''}>
                    <input
                      type="date"
                      data-testid={`germ-date-${slot.slotIndex}`}
                      aria-label={`Count date ${slot.slotIndex}`}
                      value={slot.countDt ?? ''}
                      disabled={!isEditable}
                      onChange={(e) => handleDateChange(slot.slotIndex, e.target.value)}
                    />
                  </th>
                );
              })}
              <th rowSpan={2}>Rep total</th>
              <th rowSpan={2}># seeds</th>
              <th rowSpan={2}>Ovr</th>
              <th rowSpan={2}>Acc</th>
            </tr>
            <tr>
              {slots.map((slot) => (
                <th key={`day-${slot.slotIndex}`} data-testid={`germ-day-${slot.slotIndex}`}>
                  {slot.dayNoOfTest ?? ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {replicates.map((rep) => {
              const repNumber = rep.replicateNumber as 1 | 2 | 3 | 4;
              const repTotal = calcRepTotal(slots, repNumber);
              return (
                <tr key={repNumber} className={validationErrors[`rep-${repNumber}`] ? 'row-invalid' : ''}>
                  <td>{repNumber}</td>
                  {slots.map((slot) => (
                    <td key={`count-${repNumber}-${slot.slotIndex}`}>
                      <input
                        type="number"
                        min={0}
                        data-testid={`germ-count-${repNumber}-${slot.slotIndex}`}
                        aria-label={`Replicate ${repNumber} count ${slot.slotIndex}`}
                        value={slot[REP_COUNT_KEYS[repNumber - 1]] ?? ''}
                        disabled={!isEditable || !slot.countDt}
                        onChange={(e) => handleCountChange(repNumber, slot.slotIndex, e.target.value)}
                      />
                    </td>
                  ))}
                  <td data-testid={`germ-rep-total-${repNumber}`}>{repTotal}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      data-testid={`germ-seeds-${repNumber}`}
                      aria-label={`Replicate ${repNumber} number of seeds`}
                      value={rep.totalNoSeeds ?? ''}
                      disabled={!isEditable}
                      onChange={(e) => {
                        const parsed = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                        updateReplicate(repNumber, {
                          totalNoSeeds: Number.isNaN(parsed) ? undefined : parsed
                        });
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      data-testid={`germ-ovr-${repNumber}`}
                      aria-label={`Replicate ${repNumber} tolerance override`}
                      checked={rep.tolrncOvrrdeDesc === 'ok'}
                      disabled={!isEditable}
                      onChange={(e) => updateReplicate(repNumber, {
                        tolrncOvrrdeDesc: e.target.checked ? 'ok' : null
                      })}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      data-testid={`germ-acc-${repNumber}`}
                      aria-label={`Replicate ${repNumber} accepted`}
                      checked={rep.repAcceptedInd === 1}
                      disabled={!isEditable || !!validationErrors[`rep-${repNumber}`]}
                      onChange={(e) => updateReplicate(repNumber, {
                        repAcceptedInd: e.target.checked ? 1 : 0
                      })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Germ %</td>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <td colSpan={SLOT_COUNT} />
              <td colSpan={4} className="germ-pct-cells">
                {replicates.map((rep) => (
                  <span key={rep.replicateNumber} data-testid={`germ-pct-${rep.replicateNumber}`}>
                    {`${calcGermPct(calcRepTotal(slots, rep.replicateNumber as 1 | 2 | 3 | 4), rep.totalNoSeeds)}%`}
                  </span>
                ))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DailyGermTable;
