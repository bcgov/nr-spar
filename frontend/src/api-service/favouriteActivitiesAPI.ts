import ApiConfig from './ApiConfig';
import api from './api';
import getActivityProps from '../enums/ActivityType';
import { FavActivityType, FavActivityPostType } from '../types/FavActivityTypes';

export const getFavAct = () => {
  const url = ApiConfig.favouriteActivities;
  return api.get(url)
    .then((response) => {
      const data = [...response.data];
      data.forEach((item, i: number) => {
        const card = item;
        const activityProps = getActivityProps(item.activity);
        card.image = activityProps.icon;
        card.header = activityProps.header;
        card.description = activityProps.description;
        card.link = activityProps.link;

        if (card.highlighted) {
          data.splice(i, 1);
          data.unshift(item);
        }
      });
      return data;
    })
    .catch((error) => {
      // eslint-disable-next-line
      console.error(`Failed to get favourite activity: ${error}`);
      return [];
    });
};

export const postFavAct = (newAct: FavActivityPostType) => {
  const url = ApiConfig.favouriteActivities;
  return api.post(url, newAct);
};

export const putFavAct = (field: string, activity: FavActivityType) => {
  const url = `${ApiConfig.favouriteActivities}/${activity.id}`;
  const modifiedAct = { ...activity };
  if (field === 'highlighted') {
    modifiedAct.highlighted = !modifiedAct.highlighted;
  }
  return api.put(url, modifiedAct);
};

export const deleteFavAct = (id: number) => {
  const url = `${ApiConfig.favouriteActivities}/${id}`;
  return api.delete(url);
};
