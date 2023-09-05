import ApiConfig from './ApiConfig';
import api from './api';
import { FavActivityType, FavActivityPostType } from '../types/FavActivityTypes';
import FavouriteActivityMap from '../config/FavouriteActivitiyMap';

export const getFavAct = () => {
  const url = ApiConfig.favouriteActivities;
  return api.get(url)
    .then((response) => {
      const data = [...response.data];
      const userList: FavActivityType[] = [];
      const activityList = Object.keys(FavouriteActivityMap);
      data.forEach((item) => {
        if (activityList.includes(item.activity)) {
          const activityToAdd = structuredClone(FavouriteActivityMap[item.activity]);
          activityToAdd.id = item.id;
          activityToAdd.highlighted = item.highlighted;
          if (activityToAdd.highlighted) {
            userList.unshift(activityToAdd);
          } else {
            userList.push(activityToAdd);
          }
        } else {
          const invalidActivity = structuredClone(FavouriteActivityMap.unkown);
          invalidActivity.id = item.id;
          invalidActivity.type = item.activity;
          invalidActivity.header += item.activity;
          userList.push(invalidActivity);
        }
      });
      return userList;
    })
    .catch((error) => {
      // eslint-disable-next-line
      console.error(`Failed to get favourite activity: ${error}`);
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
