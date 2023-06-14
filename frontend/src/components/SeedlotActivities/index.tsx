import React from 'react';

import { Row } from '@carbon/react';

import StandardCard from '../Card/StandardCard';

import './styles.scss';

const SeedlotActivities = () => {
  const cards = [
    {
      id: '1',
      image: 'Agriculture',
      header: 'Register an A class seedlot',
      description:
        'Register a seedlot which has been collected in an orchard from parent trees',
      link: '/seedlot/register-a-class',
      highlighted: false,
      isEmpty: false,
      emptyTitle: '',
      emptyDescription: ''
    },
    {
      id: '2',
      image: 'Farm_01',
      header: 'Register a B class seedlot',
      description:
        'Register a seedlot which has been collected from a natural stand',
      link: '#',
      highlighted: false,
      isEmpty: false,
      emptyTitle: '',
      emptyDescription: ''
    },
    {
      id: '3',
      image: 'Sprout',
      header: 'My seedlots',
      description:
        'Consult and manage your own seedlots',
      link: '/seedlot/my-seedlots',
      highlighted: false,
      isEmpty: false,
      emptyTitle: '',
      emptyDescription: ''
    },
    {
      id: '4',
      image: '',
      header: 'Activity history',
      description:
        'Get updates your latest seedlot related activities',
      link: '#',
      highlighted: false,
      isEmpty: false,
      emptyTitle: '',
      emptyDescription: ''
    }
  ];

  return (
    <Row className="seedlot-activities-cards">
      {cards.map((card) => (
        <StandardCard
          key={card.id}
          type={card.id}
          image={card.image}
          header={card.header}
          description={card.description}
          url={card.link}
          isEmpty={card.isEmpty}
          emptyTitle={card.emptyTitle}
          emptyDescription={card.emptyDescription}
        />
      ))}
    </Row>
  );
};

export default SeedlotActivities;
