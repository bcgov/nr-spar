import { Server } from 'miragejs';
import AppSchema from '../schema';
import ApiConfig from '../../api-service/ApiConfig';
import mockServerConfig from '../config';

const GeneticClassesEndpoints = (server: Server) => {
  const url = ApiConfig.geneticClasses.replace(mockServerConfig.namespace, '');
  server.get(url, (schema: AppSchema) => schema.all('geneticClasses'));
};

export default GeneticClassesEndpoints;
