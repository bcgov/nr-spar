import { Server } from 'miragejs';
import AppSchema from '../schema';
import ApiConfig from '../../api-service/ApiConfig';
import mockServerConfig from '../config';

const OrchardsEndpoints = (server: Server) => {
  const url = ApiConfig.orchards.replace(mockServerConfig.namespace, '');
  server.get(url, (schema: AppSchema, request) => {
    const { orchardnumber } = request.params;
    const { orchards } = schema.db;
    const orchard = orchards.findBy({ id: orchardnumber });
    return {
      orchard
    };
  });
};

export default OrchardsEndpoints;
