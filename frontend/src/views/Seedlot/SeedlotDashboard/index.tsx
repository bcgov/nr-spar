import React from 'react';
import {
  FlexGrid,
  Row,
  Stack
} from '@carbon/react';

import PageTitle from '../../../components/PageTitle';
import SeedlotActivities from '../../../components/SeedlotActivities';
import RecentSeedlots from './RecentSeedlots';

import './styles.scss';

const SeedlotDashboard = () => (
  <FlexGrid className="seedlot-page">
    <Stack gap={7}>
      <Row>
        <PageTitle
          title="Seedlots"
          subtitle="Register and manage your seedlots"
          enableFavourite
          activity="seedlots"
        />
      </Row>
      <SeedlotActivities />
      <RecentSeedlots />
    </Stack>
  </FlexGrid>
);

export default SeedlotDashboard;
