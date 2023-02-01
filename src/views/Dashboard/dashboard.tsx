import React from 'react';

import {
  FlexGrid,
  Row,
  Stack
} from '@carbon/react';

import PageTitle from '../../components/PageTitle';
import FavoriteActivities from '../../components/FavoriteActivities';
import RecentActivities from '../../components/RecentActivities';

const Dashboard = () => (
  <FlexGrid className="dashboard-page">
    <Stack gap={7}>
      <Row>
        <PageTitle
          title="Dashboard"
          subtitle="See your favorite and recent activities inside SPAR system"
        />
      </Row>
      <section title="Favorite activities">
        <FavoriteActivities />
      </section>
      <section title="Recent activities">
        <RecentActivities />
      </section>
    </Stack>
  </FlexGrid>
);

export default Dashboard;
