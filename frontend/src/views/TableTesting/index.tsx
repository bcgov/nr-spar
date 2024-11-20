import React from 'react';

import {
  FlexGrid,
  Row,
  Column
} from '@carbon/react';

import PageTitle from '../../components/PageTitle';
import Table from './Table';

const Dashboard = () => (
  <FlexGrid className="dashboard-page">
    <Row className="dashboard-row">
      <Column>
        <PageTitle
          title="Table Testing"
        />
      </Column>
    </Row>
    <Row className="dashboard-row">
      <Column>
        <Table />

      </Column>
    </Row>

  </FlexGrid>
);

export default Dashboard;
