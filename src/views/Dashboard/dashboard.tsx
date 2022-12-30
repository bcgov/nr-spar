import React from 'react';

import {
  FlexGrid,
  Column,
  Row,
  Stack
} from '@carbon/react';

import FavoriteActivities from '../../components/FavoriteActivities';
import RecentActivities from '../../components/RecentActivities';

import './styles.scss';

const Dashboard = () => (
  <FlexGrid className="dashboard-page">
    <Stack gap={7}>
      <Row>
        <Column sm={4} md={4} className="dashboard-title">
          <h1 data-testid="home-title">Dashboard</h1>
          <h4>
            See your favorite and recent activities inside SPAR system
          </h4>
        </Column>
      </Row>
      <FavoriteActivities />
      <RecentActivities />
    </Stack>
  </FlexGrid>
);

export default Dashboard;
