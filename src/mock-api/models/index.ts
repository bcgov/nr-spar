/* eslint-disable import/no-unresolved */
import { Model } from 'miragejs';
import { ModelDefinition } from 'miragejs/-types';

import CardType from '../../types/Card';

const FavoriteModel: ModelDefinition<CardType> = Model.extend({});

const models = {
  favorites: FavoriteModel
};

export default models;
