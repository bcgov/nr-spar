import React from 'react';
import {
  FlexGrid,
  Row,
  Stack
} from '@carbon/react';

import PageTitle from '../../../components/PageTitle';
import SeedlotActivities from '../../../components/SeedlotActivities';
import MySeedlots from '../../../components/MySeedlots';

import './styles.css';

const SeedlotDashboard = () => (
  <FlexGrid className="seedlot-page">
    <Stack gap={7}>
      <Row>
        <PageTitle
          title="Seedlots"
          subtitle="Register and manage your seedlots"
          favourite
          activity="SEEDLING_REQUEST"
        />
      </Row>
      <SeedlotActivities />
      <MySeedlots />
    </Stack>
  </FlexGrid>
);

export default SeedlotDashboard;
