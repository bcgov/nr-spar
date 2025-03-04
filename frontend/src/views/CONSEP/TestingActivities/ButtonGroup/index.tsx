import React from 'react';
import {
  Grid,
  Button,
  Column
} from '@carbon/react';

import './styles.scss';
import { ArrowRight } from '@carbon/icons-react';

const ButtonGroup = () => (
  <Grid narrow>
    <Column sm={4} md={3} lg={3} xlg={4}>
      <Button
        kind="secondary"
        size="lg"
        className="form-action-btn"
      >
        Calculate average
      </Button>
      <Button
        kind="secondary"
        size="lg"
        className="form-action-btn"
      >
        Complete test
      </Button>
      <Button
        kind="secondary"
        size="lg"
        className="form-action-btn"
        renderIcon={ArrowRight}
      >
        Accept test
      </Button>
      <Button
        kind="secondary"
        size="lg"
        className="form-action-btn"
      >
        Test history
      </Button>
      <Button
        kind="secondary"
        size="lg"
        className="form-action-btn"
      >
        Copy results
      </Button>
    </Column>
  </Grid>
);
export default ButtonGroup;
