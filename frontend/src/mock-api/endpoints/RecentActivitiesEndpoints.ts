import { Server } from 'miragejs';
import ApiAddresses from '../../utils/ApiAddresses';
import getUrl from '../../utils/ApiUtils';

const RecentActivitiesEndpoints = (server: Server) => {
  server.get(getUrl(ApiAddresses.RecentActivitiesRetrieveAll, true), ({ db }) => db.recent);
};

export default RecentActivitiesEndpoints;
