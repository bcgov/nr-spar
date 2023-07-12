import React from 'react';

import {
  FlexGrid,
  Row,
  Column
} from '@carbon/react';

import PageTitle from '../../components/PageTitle';
import FavouriteActivities from '../../components/FavouriteActivities';
import RecentActivities from '../../components/RecentActivities';

import './styles.scss';

const Dashboard = () => (
  <FlexGrid className="dashboard-page">
    <Row className="dashboard-row">
      <Column>
        <PageTitle
          title="Dashboard"
          subtitle="See your favourite and recent activities inside SPAR system"
        />
      </Column>
    </Row>
    <Row className="dashboard-row">
      <Column>
        <section title="Favourite activities">
          <FavouriteActivities />
        </section>
      </Column>
    </Row>
    <Row className="dashboard-row">
      <Column>
        <section title="Recent activities">
          <RecentActivities />
        </section>
      </Column>
    </Row>
  </FlexGrid>
);

export default Dashboard;
