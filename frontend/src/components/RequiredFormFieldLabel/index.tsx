import React from 'react';
import './styles.scss';

const RequiredFormFieldLabel = ({ text }: { text: string }) => (
  <>
    <b className="required-asterisk">*</b>
    {text}
  </>
);

export default RequiredFormFieldLabel;
