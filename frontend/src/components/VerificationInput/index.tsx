import React from 'react';
import {
  TextInput,
  Tooltip,
  InlineLoading
} from '@carbon/react';

import './styles.scss';

interface VerificationInputProps {
  inputLabel: string;
  helperText: string;
}

const VerificationInput = (
  {
    inputLabel, helperText
  }: VerificationInputProps
) => {
  console.log('test');

  return (
    <div className="test_wrapper">
      <TextInput
        id="test"
        labelText={inputLabel}
        helperText={helperText}
        invalidText="invalid"
      />
      <Tooltip className="tooltip_class" label="Loading">
        {
          // eslint-disable-next-line jsx-a11y/control-has-associated-label
          <button className="tooltip-trigger" type="button">
            <InlineLoading />
          </button>
        }
      </Tooltip>
    </div>
  );
};

export default VerificationInput;
