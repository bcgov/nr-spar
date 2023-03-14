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

  // seedlots and activity history cards are empty
  // TODO: detect empty seedlot or activity history using API calls for PR REVIEW, REMOVE AFTERWARDS
  // eslint-disable-next-line
  const empty_cards = [ 
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
      image: 'Magnify',
      header: 'My seedlots',
      description:
        'Consult and manage your own seedlots',
      link: '#',
      highlighted: false,
      isEmpty: true,
      emptyTitle: 'There is no seedlot to show yet!',
      emptyDescription: 'You will have access to your seedlots when generating or adding to one'
    },
    {
      id: '4',
      image: 'Meter',
      header: 'Activity history',
      description:
        'Get updates your latest seedlot related activities',
      link: '#',
      highlighted: false,
      isEmpty: true,
      emptyTitle: "You don't have an activity to show yet!",
      emptyDescription: 'Your recent activities will appear here once you have one'
    }
  ];

  return (
    <div className="seedlot-activities">
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
    </div>
  );
};

export default SeedlotActivities;
