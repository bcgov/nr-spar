import React from 'react';
import { DatePicker, DatePickerInput } from '@carbon/react';

import { DATE_FORMAT, DATE_PLACEHOLDER } from './constants';
import { isoToJsDate, parseCountDateInput, toLocalIsoDate } from './utils';

type GermDatePickerProps = {
  id: string;
  label: string;
  hideLabel?: boolean;
  value?: string; // 'YYYY-MM-DD'
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  onChange: (isoDate: string | undefined) => void;
};

/** A calendar date picker that also takes a typed date; works in local calendar dates. */
const GermDatePicker = ({
  id, label, hideLabel, value, error, disabled, size = 'sm', onChange
}: GermDatePickerProps) => (
  <DatePicker
    datePickerType="single"
    allowInput
    dateFormat={DATE_FORMAT}
    value={value ? [isoToJsDate(value)] : []}
    onChange={(picked: Array<Date>) => onChange(picked[0] ? toLocalIsoDate(picked[0]) : undefined)}
  >
    <DatePickerInput
      id={id}
      labelText={label}
      hideLabel={hideLabel}
      placeholder={DATE_PLACEHOLDER}
      autoComplete="off"
      size={size}
      disabled={disabled}
      invalid={!!error}
      invalidText={error}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        // Picking fires the picker's onChange; this only catches a typed
        // date or a cleared field. A half-typed date is ignored.
        const raw = e.target.value;
        if (!raw.trim()) {
          onChange(undefined);
          return;
        }
        const isoDate = parseCountDateInput(raw);
        if (isoDate && isoDate !== value) {
          onChange(isoDate);
        }
      }}
    />
  </DatePicker>
);

export default GermDatePicker;
