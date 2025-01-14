import React from 'react';

import {
  FlexGrid,
  Row,
  Column
} from '@carbon/react';

import PageTitle from '../../../components/PageTitle';
import FavouriteActivities from '../../../components/FavouriteActivities';

import './styles.scss';

const FavouriteActivity = () => (
  <FlexGrid className="dashboard-page">
    <Row className="dashboard-row">
      <Column>
        <PageTitle
          title="My favourite activities"
        />
      </Column>
    </Row>
    <Row className="dashboard-row">
      <Column>
        <section title="Favourite activities">
          <FavouriteActivities isConsep />
        </section>
      </Column>
    </Row>
  </FlexGrid>
);

export default FavouriteActivity;
