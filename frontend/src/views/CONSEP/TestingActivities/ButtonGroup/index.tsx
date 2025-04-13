import React from 'react';
import {
  Row,
  Button
} from '@carbon/react';

import './styles.scss';
import { ButtonObjType } from './definitions';

interface ButtonGroupProps {
  buttons: ButtonObjType[];
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ buttons }) => (
  <Row className="consep-registration-button-row">
    {
      buttons.map((button: ButtonObjType) => (
        <Button
          key={button.id}
          kind={button.kind}
          size={button.size}
          className="form-action-btn"
          renderIcon={button.icon}
          disabled={button.disabled}
        >
          {button.text}
        </Button>
      ))
    }
  </Row>
);
export default ButtonGroup;
