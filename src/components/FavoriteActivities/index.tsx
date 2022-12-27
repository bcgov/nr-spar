import React from 'react';

import { Tooltip, Row, Column } from '@carbon/react';
import { Information } from '@carbon/icons-react';
import Card from '../Card';

import CardType from '../../types/Card';
import './styles.css';
import FavoriteActivitiesCardItems from '../../mock-data/FavoriteActivitiesCardItems';

const FavoriteActivities = () => {
  const [cards, setCards] = React.useState<CardType[]>(FavoriteActivitiesCardItems);

  const highlightFunction = (index:number) => {
    const target = cards[index];
    const newCards = [...cards];
    if (target.highlighted === false) {
      newCards.forEach((item, i) => {
        const card = item;
        if (card.id !== target.id) {
          card.highlighted = false;
        } else {
          newCards.splice(i, 1);
          newCards.unshift(item);
          newCards[0].highlighted = true;
        }
      });
    } else {
      newCards[0].highlighted = false;
    }
    setCards(newCards);
  };

  return (
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
          {cards.map((card, index) => (
            <Card
              key={card.id}
              icon={card.icon}
              header={card.header}
              description={card.description}
              highlighted={card.highlighted}
              highlightFunction={() => {
                highlightFunction(index);
              }}
            />
          ))}
        </Row>
      </Column>
    </Row>
  );
};

export default FavoriteActivities;
