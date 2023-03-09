import React, { useState } from 'react';
import axios from 'axios';

import {
  Column,
  IconButton
} from '@carbon/react';
import { Favorite, FavoriteFilled } from '@carbon/icons-react';

import Subtitle from '../Subtitle';

import CardType from '../../types/Card';

import getUrl from '../../utils/ApiUtils';
import ApiAddresses from '../../utils/ApiAddresses';

import { useAuth } from '../../contexts/AuthContext';

import './styles.scss';

interface PageTitleProps {
  title: string;
  subtitle: string;
  favourite?: boolean;
  activity?: string;
}

const PageTitle = ({
  title,
  subtitle,
  favourite,
  activity
}: PageTitleProps) => {
  const { token } = useAuth();
  const [isFavouriteButtonPressed, setFavouriteButton] = useState(false);
  const [favouriteActivityId, setFavouriteActivityId] = useState('0');

  /**
   * Get Axios Config Headers
   */
  async function getAxiosConfig() {
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
  }

  /**
   * Get FavouriteActivities (TODO: change to local storage)
   */
  async function getFavouriteActivities() {
    try {
      await axios.get(getUrl(ApiAddresses.FavouriteActiviteRetrieveAll), await getAxiosConfig())
        .then((response) => {
          const newCards = response.data.favourites || response.data;
          newCards.forEach((item: CardType) => {
            const card = item;
            if (card.activity === activity) {
              setFavouriteActivityId(card.id);
              setFavouriteButton(true);
            }
          });
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(`Error: ${error}`);
        });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Favourite Activities error:', e);
    }
  }

  getFavouriteActivities();

  const favoritePage = async (pageActivity: string) => {
    const postUrl = getUrl(ApiAddresses.FavouriteActiviteCreate);
    axios.post(postUrl, { activity: pageActivity }, await getAxiosConfig())
      .then(() => {
        setFavouriteButton(true);
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(`Error: ${error}`);
      });
  };

  const unfavoritePage = async (index:string) => {
    const deleteUrl = getUrl(ApiAddresses.FavouriteActiviteDelete).replace(':id', index);
    axios.delete(deleteUrl, await getAxiosConfig())
      .then(() => {
        setFavouriteButton(false);
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(`Error: ${error}`);
      });
  };

  return (
    <Column sm={4} md={4} className="title-section">
      <div className={favourite ? 'title-favourite' : 'title-no-favourite'}>
        <h1>{title}</h1>
        {favourite && (
          <IconButton
            kind="ghost"
            label={isFavouriteButtonPressed ? 'Unfavourite' : 'Favourite'}
            align="right"
            onClick={isFavouriteButtonPressed
              ? () => { unfavoritePage(favouriteActivityId); }
              : () => {
                if (activity) {
                  favoritePage(activity);
                }
              }}
          >
            {isFavouriteButtonPressed ? (<FavoriteFilled size={28} />) : (<Favorite size={28} />)}
          </IconButton>
        )}
      </div>
      <Subtitle text={subtitle} />
    </Column>
  );
};

export default PageTitle;
