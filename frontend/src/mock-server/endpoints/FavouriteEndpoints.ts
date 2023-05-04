import { Server } from 'miragejs';
import AppSchema from '../schema';
import ApiConfig from '../../api-service/ApiConfig';
import mockServerConfig from '../config';

const FavouriteEndpoints = (server: Server) => {
  const favouriteUrl = ApiConfig.favouriteActivities.replace(mockServerConfig.namespace, '');
  server.get(favouriteUrl, (schema: AppSchema) => schema.db.favourites);

  server.del(`${favouriteUrl}/:id`, (schema: AppSchema, request) => {
    const { id } = request.params;
    const card = schema.find('favourites', id);
    if (card !== null) {
      card.destroy();
    }
    return {
      status: 'OK'
    };
  });

  server.put(`${favouriteUrl}/:id`, (schema: AppSchema, request) => {
    const { id } = request.params;
    const attrs = JSON.parse(request.requestBody);
    const card = schema.find('favourites', id);
    if (card !== null) {
      card.update(attrs);
    }
    return {
      status: 'OK'
    };
  });
};

export default FavouriteEndpoints;
