import React from 'react';
import {
  FlexGrid,
  Row,
  Column,
  Stack
} from '@carbon/react';

import PageTitle from '../../components/PageTitle';

import './styles.css';

const SeedlotDashboard = () => (
  <FlexGrid className="seedlot-page">
    <Stack gap={7}>
      <Row>
        <PageTitle
          title="Seedlots"
          subtitle="Register and manage your seedlots"
          favorite
        />
      </Row>
      <Row className="seedlot-dashboard-content">
        <Column sm={4} md={4} lg={4}>
          <span>
            Card Placeholder
          </span>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <span>
            Card Placeholder
          </span>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <span>
            Card Placeholder
          </span>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <span>
            Card Placeholder
          </span>
        </Column>
      </Row>
      <Row className="seedlot-dashboard-content">
        <Column>
          Exisisting Seedlot Placeholder
        </Column>
      </Row>
    </Stack>
  </FlexGrid>
);

export default SeedlotDashboard;
