import React from 'react';

import './styles.scss';
import { TextInput } from '@carbon/react';

type props = {
  id: string,
  label: string,
  value: string,
  helperText?: string,
  hideLabel?: boolean
}

/**
 * An input intended for read only, mostly to displaying form info.
 */
const ReadOnlyInput = (
  {
    id, label, value, helperText, hideLabel
  }: props
) => (
  <TextInput
    id={id}
    className="read-only-text-input"
    readOnly
    helperText={helperText}
    labelText={label}
    hideLabel={hideLabel}
    value={value}
  />
);

export default ReadOnlyInput;
