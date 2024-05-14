import React from 'react';
import { ErrorOutline } from '@carbon/icons-react';
import './styles.scss';

interface InputErrorProps {
  description: string
}

const InputErrorText = ({
  description
}: InputErrorProps) => (
  <div className="input-error-text-component">
    <ErrorOutline />
    <p>{description}</p>
  </div>
);

export default InputErrorText;
