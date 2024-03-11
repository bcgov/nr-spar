import React from 'react';
import {
  FlexGrid,
  Row
} from '@carbon/react';

import PageTitle from '../../../components/PageTitle';
import SeedlotActivities from '../../../components/SeedlotActivities';
import RecentSeedlots from './RecentSeedlots';

import './styles.scss';

const SeedlotDashboard = () => (
  <FlexGrid className="seedlot-page">
    <Row className="title-row">
      <PageTitle
        title="Seedlots"
        subtitle="Register and manage your seedlots"
        enableFavourite
        activity="seedlots"
      />
    </Row>
    <SeedlotActivities />
    <RecentSeedlots />
  </FlexGrid>
);

export default SeedlotDashboard;
