import React from 'react';

import {
  FlexGrid,
  Row,
  Stack,
  Column
} from '@carbon/react';

import PageTitle from '../../components/PageTitle';
import FavouriteActivities from '../../components/FavouriteActivities';
import RecentActivities from '../../components/RecentActivities';

import './styles.scss';

const Dashboard = () => (
  <FlexGrid className="dashboard-page">
    <Stack gap={7}>
      <Row>
        <Column>
          <PageTitle
            title="Dashboard"
            subtitle="See your favourite and recent activities inside SPAR system"
          />
        </Column>
      </Row>
      <Row>
        <Column>
          <section title="Favourite activities">
            <FavouriteActivities />
          </section>
        </Column>
      </Row>
      <Row>
        <Column>
          <section title="Recent activities">
            <RecentActivities />
          </section>
        </Column>
      </Row>
    </Stack>
  </FlexGrid>
);

export default Dashboard;
