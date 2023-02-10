import React from 'react';

import {
  FlexGrid,
  Row,
  Stack
} from '@carbon/react';

import PageTitle from '../../components/PageTitle';
import FavouriteActivities from '../../components/FavouriteActivities';
import RecentActivities from '../../components/RecentActivities';

const Dashboard = () => (
  <FlexGrid className="dashboard-page">
    <Stack gap={7}>
      <Row>
        <PageTitle
          title="Dashboard"
          subtitle="See your favourite and recent activities inside SPAR system"
        />
      </Row>
      <section title="Favourite activities">
        <FavouriteActivities />
      </section>
      <section title="Recent activities">
        <RecentActivities />
      </section>
    </Stack>
  </FlexGrid>
);

export default Dashboard;
