import React from 'react';

import { Tooltip, Row, Column } from '@carbon/react';
import { Information } from '@carbon/icons-react';

import Card from '../Card/FavoriteCard';
import EmptySection from '../EmptySection';
import Subtitle from '../Subtitle';

import CardType from '../../types/Card';
import FavoriteActivitiesCardItems from '../../mock-data/FavoriteActivitiesCardItems';

import './styles.scss';

const FavouriteActivities = () => {
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
    <Row className="favourite-activities">
      <Column lg={4} className="favourite-activities-title">
        <h2>My favourite activities</h2>
        <Subtitle text="Quick access to your favourite activities." className="favourite-activities-subtitle" />
        <Tooltip
          className="favourite-activity-tooltip"
          align="top"
          label="You can add a shortcut to your favourite activity by clicking on the hearth icon inside each page."
        >
          <button className="tooltip-button" type="button">
            <Information />
          </button>
        </Tooltip>
      </Column>
      <Column lg={12} className="favourite-activities-cards">
        <Row>
          {(cards.length === 0) && (
            <EmptySection
              icon="Application"
              title="You don't have any favourites to show yet!"
              description="You can favourite your most used activities by clicking on the heart icon
              inside each page"
            />
          )}
          {cards.map((card, index) => (
            <Card
              key={card.id}
              icon={card.image}
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

export default FavouriteActivities;
