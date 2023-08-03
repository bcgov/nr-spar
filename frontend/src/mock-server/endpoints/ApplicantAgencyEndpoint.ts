import { Server } from 'miragejs';
import ApiConfig from '../../api-service/ApiConfig';
import mockServerConfig from '../config';

const ApplicantAgencyEndpoint = (server: Server) => {
  const url = ApiConfig.applicantAgencies.replace(mockServerConfig.namespace, '');
  server.get(url, ({ db }) => db.applicantAgencies);
};

export default ApplicantAgencyEndpoint;
