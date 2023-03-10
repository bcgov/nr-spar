import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { env } from '../../env';
import { Tooltip, Row, Column, Loading } from '@carbon/react';
import { Information } from '@carbon/icons-react';

import Card from '../Card/FavouriteCard';
import EmptySection from '../EmptySection';
import Subtitle from '../Subtitle';

import CardType from '../../types/Card';

import './styles.scss';
import getUrl from '../../utils/ApiUtils';
import ApiAddresses from '../../utils/ApiAddresses';
import { useAuth } from '../../contexts/AuthContext';
import getActivityProps from '../../enums/ActivityType';

const FavouriteActivities = () => {
  const { token } = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getAxiosConfig = () => {
    const axiosConfig = {};
    if (token) {
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      Object.assign(axiosConfig, headers);
    }
    return axiosConfig;
  };

  const getCards = () => {
    axios.get(getUrl(ApiAddresses.FavouriteActiviteRetrieveAll), getAxiosConfig())
      .then((response) => {
        const newCards = response.data.favourites || response.data;
        newCards.forEach((item: CardType, i: number) => {
          let card = item;
          if (env.REACT_APP_ENABLE_MOCK_SERVER === 'false') {
            const activityProps = getActivityProps(item.activity);
            card.image = activityProps.icon;
            card.header = activityProps.header;
            card.description = activityProps.description;
            card.link = activityProps.link;
          }
          if (card.highlighted) {
            newCards.splice(i, 1);
            newCards.unshift(item);
          }
        });
        setCards(newCards);
        setLoading(false);
      })
      .catch((error) => {
        setCards([]);
        setLoading(false);
        // eslint-disable-next-line
        console.error(`Error: ${error}`);
      });
  };

  const updateCards = (index: string, card: CardType) => {
    const putUrl = getUrl(ApiAddresses.FavouriteActiviteSave).replace(':id', index);
    axios.put(putUrl, card, getAxiosConfig())
      .then(() => {
        getCards();
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(`Error: ${error}`);
      });
  };

  useEffect(() => {
    getCards();
    setInterval(() => {
      getCards();
    }, 3*60*1000);
  }, []);

  const highlightFunction = (index: number) => {
    const target = cards[index];

    if (target.highlighted === false) {
      // We need to remove the current highlighted card
      // if it exists, so we can submit new highlighted one
      cards.forEach((item: CardType) => {
        const card = item;
        if (card.highlighted && card.id !== target.id) {
          card.highlighted = false;
          updateCards(card.id, card);
        }
      });
      target.highlighted = true;
    } else {
      target.highlighted = false;
    }

    updateCards(target.id, target);
  };

  const deleteCard = (index:string) => {
    const deleteUrl = getUrl(ApiAddresses.FavouriteActiviteDelete).replace(':id', index);
    axios.delete(deleteUrl, getAxiosConfig())
      .then(() => {
        getCards();
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(`Error: ${error}`);
      });
  };

  return (
    <Row className="favourite-activities">
      <Column lg={4} className="favourite-activities-title">
        <h2>My favourite activities</h2>
        <Subtitle text="Quick access to your favourite activities." className="favourite-activities-subtitle" />
        <Tooltip
          className="favourite-activity-tooltip"
          align="top"
          label="You can add a shortcut to your favourite activity by clicking on the heart icon inside each page."
        >
          <button className="tooltip-button" type="button">
            <Information />
          </button>
        </Tooltip>
      </Column>
      <Column lg={12} className="favourite-activities-cards">
        <Row>
          {loading ? (
            <Loading withOverlay={false} />
          ) : (
            (cards.length === 0) ? (           
              <EmptySection
                icon="Application"
                title="You don't have any favourites to show yet!"
                description="You can favourite your most used activities by clicking on the heart icon
                inside each page"
              />
            ) : cards.map((card, index) => (
              <Card
                key={card.id}
                icon={card.image}
                header={card.header}
                description={card.description}
                highlighted={card.highlighted}
                highlightFunction={() => { highlightFunction(index); }}
                deleteFunction={() => { deleteCard(card.id); }}
                link={card.link}
              />
            ))
          )}
        </Row>
      </Column>
    </Row>
  );
};

export default FavouriteActivities;
