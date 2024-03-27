import React from 'react';

import { TextInput, TextInputSkeleton } from '@carbon/react';

import './styles.scss';

type props = {
  id: string,
  label: string,
  value: string,
  helperText?: string,
  hideLabel?: boolean
  showSkeleton?: boolean
}

/**
 * An input intended for read only, mostly to displaying form info.
 */
const ReadOnlyInput = (
  {
    id, label, value, helperText, hideLabel, showSkeleton
  }: props
) => (
  showSkeleton
    ? <TextInputSkeleton />
    : (
      <TextInput
        id={id}
        className="read-only-text-input"
        readOnly
        helperText={helperText}
        labelText={label}
        hideLabel={hideLabel}
        value={value}
      />
    )
);

export default ReadOnlyInput;
