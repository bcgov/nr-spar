import React from 'react';

import { Tooltip, Row, Column } from '@carbon/react';
import { Information } from '@carbon/icons-react';

import Card from '../Card/FavoriteCard';
import EmptySection from '../EmptySection';
import Subtitle from '../Subtitle';

import CardType from '../../types/Card';
import FavoriteActivitiesCardItems from '../../mock-data/FavoriteActivitiesCardItems';

import './styles.scss';

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

  const deleteHighlight = (index:number) => {
    const newCards = [...cards];
    newCards.splice(index, 1);
    setCards(newCards);
  };

  return (
    <Row className="favorite-activities">
      <Column lg={4} className="favorite-activities-title">
        <h2>My favorite activities</h2>
        <Subtitle text="Quick access to your favorite activities." className="favorite-activities-subtitle" />
        <Tooltip
          className="favorite-activity-tooltip"
          align="top"
          label="You can add a shortcut to your favorite activity by clicking on the hearth icon inside each page."
        >
          <button className="tooltip-button" type="button">
            <Information />
          </button>
        </Tooltip>
      </Column>
      <Column lg={12} className="favorite-activities-cards">
        <Row>
          {(cards.length === 0) && (
            <EmptySection
              icon="Application"
              title="You don't have any favorites to show yet!"
              description="You can favorite your most used activities by clicking on the heart icon
              inside each page"
            />
          )}
          {cards.map((card, index) => (
            <Card
              key={card.id}
              icon={card.icon}
              header={card.header}
              description={card.description}
              highlighted={card.highlighted}
              highlightFunction={() => { highlightFunction(index); }}
              deleteFunction={() => { deleteHighlight(index); }}
            />
          ))}
        </Row>
      </Column>
    </Row>
  );
};

export default FavoriteActivities;
