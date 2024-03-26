import React, { useState } from 'react';
import { Tooltip, Button } from '@carbon/react';

import prefix from '../../styles/classPrefix';
import './styles.scss';

type props = {
  value: string
  label?: string
  helperText?: string
}

/**
 * Display an email addr and can be copied.
 */
const EmailDisplay = (
  { value, label, helperText }: props
) => {
  const initLabel = 'Click to copy email';
  const [toolTipLabel, setToolTipLabel] = useState(initLabel);

  const copyEmail = () => {
    navigator.clipboard.writeText(value);
    setToolTipLabel('Copied!');

    setTimeout(() => {
      setToolTipLabel(initLabel);
    }, 2000);
  };

  return (
    <div className={`${prefix}--form-item`}>
      {
        label
          ? (
            <div className={`${prefix}--text-input__label-wrapper`}>
              <label className={`${prefix}--label`}>
                {label}
              </label>
            </div>
          )
          : null
      }
      <Tooltip label={toolTipLabel} align="bottom">
        <Button
          kind="ghost"
          className="email-display-value"
          onClick={copyEmail}
        >
          {value}
        </Button>
      </Tooltip>
      {
        helperText
          ? (
            <div className={`${prefix}--form__helper-text`}>
              {helperText}
            </div>
          )
          : null
      }
    </div>
  );
};

export default EmailDisplay;
