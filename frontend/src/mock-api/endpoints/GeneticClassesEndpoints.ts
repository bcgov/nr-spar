import { Server } from 'miragejs';
import AppSchema from '../schema';
import getUrl from '../../utils/ApiUtils';
import ApiAddresses from '../../utils/ApiAddresses';

const GeneticClassesEndpoints = (server: Server) => {
  server.get(getUrl(ApiAddresses.GeneticClassesRetrieveAll, true), (schema: AppSchema) => schema.all('geneticClasses'));
};

export default GeneticClassesEndpoints;
