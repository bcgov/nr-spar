import React from 'react';

import { Tooltip, Row, Column } from '@carbon/react';
import { Information } from '@carbon/icons-react';
import Card from '../Card';

import './styles.css';

import FavoriteActivitiesCardItems from '../../mock-data/FavoriteActivitiesCardItems';

const cards = FavoriteActivitiesCardItems;

const FavoriteActivities = () => (
  <Row className="main-content">
    <Column lg={4}>
      <h3>My favorite activities</h3>
      <h4>
        Quick access to your favorite activities.
        <Tooltip
          align="top"
          tabIndex={0}
          label="You can add a shortcut to your favorite activity by clicking on the hearth icon inside each page."
        >
          <Information />
        </Tooltip>
      </h4>
    </Column>
    <Column lg={12}>
      <Row>
        {cards.map((card) => (
          <Card
            key={card.header}
            icon={card.icon}
            header={card.header}
            description={card.description}
          />
        ))}
      </Row>
    </Column>
  </Row>
);

export default FavoriteActivities;
