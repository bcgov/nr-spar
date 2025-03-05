import React from 'react';
import {
  Row,
  Button
} from '@carbon/react';

import {
  Calculator,
  Checkmark,
  CheckmarkOutline,
  Time,
  CopyFile
} from '@carbon/icons-react';

import './styles.scss';

const ButtonGroup = () => (
  <Row className="consep-registration-button-row">
    <Button
      kind="primary"
      size="lg"
      className="form-action-btn"
      renderIcon={Calculator}
    >
      Calculate average
    </Button>
    <Button
      kind="tertiary"
      size="lg"
      className="form-action-btn"
      renderIcon={Checkmark}
    >
      Complete test
    </Button>
    <Button
      kind="tertiary"
      size="lg"
      className="form-action-btn"
      renderIcon={CheckmarkOutline}
    >
      Accept test
    </Button>
    <Button
      kind="tertiary"
      size="lg"
      className="form-action-btn"
      renderIcon={Time}
    >
      Test history
    </Button>
    <Button
      kind="tertiary"
      size="lg"
      className="form-action-btn"
      renderIcon={CopyFile}
    >
      Copy results
    </Button>
  </Row>
);
export default ButtonGroup;
