import { Server } from 'miragejs';
import AppSchema from '../schema';
import getUrl from '../../utils/ApiUtils';
import ApiAddresses from '../../utils/ApiAddresses';

const ApplicantInfoEndpoint = (server: Server) => {
  server.get(getUrl(ApiAddresses.ApplicantInfoRetrieveAll, true), (schema: AppSchema) => schema.all('applicantInfo'));
};

export default ApplicantInfoEndpoint;
