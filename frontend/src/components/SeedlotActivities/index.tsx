import React from 'react';

import { Row } from '@carbon/react';

import StandardCard from '../Card/StandardCard';

import SeedlotActivitiesCardItems from '../../mock-api/fixtures/SeedlotActivitiesCardItems';

import './styles.scss';

const SeedlotActivities = () => {
  const cards = SeedlotActivitiesCardItems;

  return (
    <div className="seedlot-activities">
      <Row className="seedlot-activities-cards">
        {cards.map((card) => (
          <StandardCard
            key={card.id}
            image={card.image}
            header={card.header}
            description={card.description}
            url="#"
          />
        ))}
      </Row>
    </div>
  );
};

export default SeedlotActivities;
