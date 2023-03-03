import { Server } from 'miragejs';
import AppSchema from '../schema';
import getUrl from '../../utils/ApiUtils';
import ApiAddresses from '../../utils/ApiAddresses';

const SeedlotRegistrationEndpoint = (server: Server) => {
  server.post(getUrl(ApiAddresses.AClassSeedlotPost, true), (schema: AppSchema, request) => {
    const attrs = JSON.parse(request.requestBody);
    const { seedlotRegistrations } = schema.db;
    const { applicantInfos } = schema.db;

    seedlotRegistrations.insert(attrs);
    applicantInfos.insert(attrs.applicant);

    return {
      status: 'OK'
    };
  });

  server.get(getUrl(ApiAddresses.SeedlotInfoRetrieveAll, true), (schema: AppSchema) => schema.all('seedlotInfos'));
};

export default SeedlotRegistrationEndpoint;
