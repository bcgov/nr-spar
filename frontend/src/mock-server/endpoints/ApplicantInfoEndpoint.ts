import { Server } from 'miragejs';
import AppSchema from '../schema';
import ApiConfig from '../../api-service/ApiConfig';
import mockServerConfig from '../config';

const ApplicantInfoEndpoint = (server: Server) => {
  const url = ApiConfig.applicantInfo.replace(mockServerConfig.namespace, '');
  server.get(url, (schema: AppSchema) => schema.all('applicantInfo'));
};

export default ApplicantInfoEndpoint;
