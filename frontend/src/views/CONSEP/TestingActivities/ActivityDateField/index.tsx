import React from 'react';
import { DatePicker, DatePickerInput } from '@carbon/react';

import { localDateToUtcDateTime, utcToIsoSlashStyle } from '../../../../utils/DateUtils';

type ActivityDateFieldProps = {
  id: string;
  config: { name: string; labelText: string; invalidText: string; placeholder?: string };
  value?: string;
  invalid: boolean;
  disabled?: boolean;
  onChange: (value: string | undefined) => void;
};

/**
 * Start/end date of a testing activity. Shows and saves the day in Vancouver time.
 */
const ActivityDateField = ({
  id, config, value, invalid, disabled, onChange
}: ActivityDateFieldProps) => (
  <DatePicker
    datePickerType="single"
    allowInput
    dateFormat="Y/m/d"
    value={utcToIsoSlashStyle(value)}
    // flatpickr only calls this with a fully parsed date, so typing partial text saves
    // nothing; clearing the field passes '' (saved as null).
    onChange={(_dates: Array<Date>, picked: string) => onChange(localDateToUtcDateTime(picked))}
  >
    <DatePickerInput
      id={id}
      name={config.name}
      placeholder={config.placeholder ?? 'yyyy/mm/dd'}
      labelText={config.labelText}
      invalidText={config.invalidText}
      invalid={invalid}
      size="md"
      autoComplete="off"
      disabled={disabled}
    />
  </DatePicker>
);

export default ActivityDateField;
