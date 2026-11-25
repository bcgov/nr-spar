import React from 'react';
import {
  Column, DatePicker, DatePickerInput, Row
} from '@carbon/react';

import { GerminationTestHeaderType } from '../../../../types/consep/GerminationType';
import { DATE_FORMAT, DATE_PLACEHOLDER } from './constants';
import {
  ActivityDatesType, isoToJsDate, parseCountDateInput, toLocalIsoDate
} from './utils';

type EditableField = keyof ActivityDatesType;

type ActivityDatesProps = {
  header: GerminationTestHeaderType;
  dates: ActivityDatesType;
  errors: Partial<Record<EditableField, string>>;
  isEditable: boolean;
  onChange: (field: EditableField, isoDate: string | undefined) => void;
};

const DERIVED: Array<{ key: keyof GerminationTestHeaderType; label: string }> = [
  { key: 'soakEndDate', label: 'Soak end' },
  { key: 'drybackStartDate', label: 'Dryback' },
  { key: 'warmStratStartDate', label: 'Warm strat' },
  { key: 'stratStartDt', label: 'Cold strat' },
  { key: 'germinatorEntry', label: 'Into germinator' }
];

const COLUMNS = ['Begin date', ...DERIVED.map((d) => d.label), 'Test end'];

/**
 * The legacy "Activities" grid, laid out as the Figma design has it: a
 * Withdrawal row and a row for the test itself, under one set of date columns.
 * Withdrawal, begin and test end are entered here; soak end through
 * into-germinator are set by the germinator tray workflow and only shown.
 * Each field keeps its own (visually hidden) label for screen readers.
 */
const ActivityDates = ({
  header, dates, errors, isEditable, onChange
}: ActivityDatesProps) => {
  const renderPicker = (field: EditableField, label: string) => (
    <DatePicker
      datePickerType="single"
      allowInput
      dateFormat={DATE_FORMAT}
      value={dates[field] ? [isoToJsDate(dates[field] as string)] : []}
      onChange={(picked: Array<Date>) => (
        onChange(field, picked[0] ? toLocalIsoDate(picked[0]) : undefined)
      )}
    >
      <DatePickerInput
        id={`germ-activity-${field}`}
        labelText={label}
        hideLabel
        placeholder={DATE_PLACEHOLDER}
        autoComplete="off"
        size="sm"
        disabled={!isEditable}
        invalid={!!errors[field]}
        invalidText={errors[field]}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          // Picking fires the picker's onChange; this only catches a typed
          // date or a cleared field. A half-typed date is ignored.
          const raw = e.target.value;
          if (!raw.trim()) {
            onChange(field, undefined);
            return;
          }
          const isoDate = parseCountDateInput(raw);
          if (isoDate && isoDate !== dates[field]) {
            onChange(field, isoDate);
          }
        }}
      />
    </DatePicker>
  );

  return (
    <Row className="consep-germination-content-activity-dates">
      <Column>
        <table className="germ-activity-table">
          <thead>
            <tr>
              <th scope="col">Activities</th>
              {COLUMNS.map((label) => <th key={label} scope="col">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Withdrawal</th>
              {/* The withdrawal row only has a date; it sits in the first column. */}
              <td>{renderPicker('seedWithdrawalDate', 'Withdrawal')}</td>
            </tr>
            <tr>
              <th scope="row">{`${header.activityTypeCd ?? ''} germination test`.trim()}</th>
              <td>{renderPicker('beginDate', 'Begin date')}</td>
              {DERIVED.map(({ key, label }) => {
                const iso = (header[key] as string | undefined)?.slice(0, 10);
                return (
                  <td key={key}>
                    {/* Derived per the spec: a date picker in look only, never editable here. */}
                    <DatePicker
                      datePickerType="single"
                      dateFormat={DATE_FORMAT}
                      readOnly
                      value={iso ? [isoToJsDate(iso)] : []}
                    >
                      <DatePickerInput
                        id={`germ-activity-${key}`}
                        labelText={label}
                        hideLabel
                        placeholder=""
                        size="sm"
                      />
                    </DatePicker>
                  </td>
                );
              })}
              <td>{renderPicker('endDate', 'Test end')}</td>
            </tr>
          </tbody>
        </table>
      </Column>
    </Row>
  );
};

export default ActivityDates;
