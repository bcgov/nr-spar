import React from 'react';
import {
  FlexGrid,
  Row,
  Stack
} from '@carbon/react';

import PageTitle from '../../../components/PageTitle';
import SeedlotActivities from '../../../components/SeedlotActivities';
import RecentSeedlots from '../../../components/RecentSeedlots';

import './styles.css';

const SeedlotDashboard = () => (
  <FlexGrid className="seedlot-page">
    <Stack gap={7}>
      <Row>
        <PageTitle
          title="Seedlots"
          subtitle="Register and manage your seedlots"
          enableFavourite
          activity="SEEDLOT_DASHBOARD"
        />
      </Row>
      <SeedlotActivities />
      <RecentSeedlots />
    </Stack>
  </FlexGrid>
);

export default SeedlotDashboard;
