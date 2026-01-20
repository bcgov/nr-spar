import React from 'react';
import './styles.scss';

const RequiredFormFieldLabel = ({ text }: { text: string }) => (
  <>
    <span className="required-asterisk">*</span>
    {text}
  </>
);

export default RequiredFormFieldLabel;
