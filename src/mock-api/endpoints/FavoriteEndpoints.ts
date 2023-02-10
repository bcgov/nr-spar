import { Server } from 'miragejs';
import AppSchema from '../schema';
import getUrl from '../../utils/ApiUtils';
import ApiAddresses from '../../utils/ApiAddresses';

const FavoriteEndpoints = (server: Server) => {
  server.get(getUrl(ApiAddresses.FavouriteActiviteRetrieveAll, true), (schema: AppSchema) => schema.all('favorites'));

  server.del(getUrl(ApiAddresses.FavouriteActiviteDelete, true), (schema: AppSchema, request) => {
    const { id } = request.params;
    const card = schema.find('favorites', id);
    if (card !== null) {
      card.destroy();
    }
    return {
      status: 'OK'
    };
  });

  server.put(getUrl(ApiAddresses.FavouriteActiviteSave, true), (schema: AppSchema, request) => {
    const { id } = request.params;
    const attrs = JSON.parse(request.requestBody);
    const card = schema.find('favorites', id);
    if (card !== null) {
      card.update(attrs);
    }
    return {
      status: 'OK'
    };
  });
};

export default FavoriteEndpoints;
