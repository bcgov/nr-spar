import { Server } from 'miragejs';
import AppSchema from '../schema';
import getUrl from '../../utils/ApiUtils';
import ApiAddresses from '../../utils/ApiAddresses';

const OrchardsEndpoints = (server: Server) => {
  server.get(getUrl(ApiAddresses.OrchardRetriveOne, true), (schema: AppSchema, request) => {
    const { orchardnumber } = request.params;
    const { orchards } = schema.db;
    const orchard = orchards.findBy({ id: orchardnumber });
    return {
      orchard
    };
  });
};

export default OrchardsEndpoints;
