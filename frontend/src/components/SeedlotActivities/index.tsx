import React from 'react';

import { Row, Column } from '@carbon/react';

import StandardCard from '../Card/StandardCard';
import { cards } from './constants';

import './styles.scss';

const SeedlotActivities = () => (
  <Row className="seedlot-activities-cards">
    {
      cards.map((card) => (
        <Column sm={4} md={4} lg={8} xlg={8} max={4} key={card.id}>
          <StandardCard
            type={card.id}
            image={card.image}
            header={card.header}
            description={card.description}
            url={card.link}
            isEmpty={card.isEmpty}
            emptyTitle={card.emptyTitle}
            emptyDescription={card.emptyDescription}
          />
        </Column>
      ))
    }
  </Row>
);

export default SeedlotActivities;
