import { Server } from 'miragejs';
import ApiConfig from '../../api-service/ApiConfig';
import mockServerConfig from '../config';

const RecentActivitiesEndpoints = (server: Server) => {
  const url = ApiConfig.recentActivities.replace(mockServerConfig.namespace, '');
  server.get(url, ({ db }) => db.recent);
};

export default RecentActivitiesEndpoints;
