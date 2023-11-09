import { Server } from 'miragejs';
import AppSchema from '../schema';

import formatDate from '../../utils/DateUtils';

import ApiConfig from '../../api-service/ApiConfig';
import mockServerConfig from '../config';

// TODO: refactor or remove: the way we keep data here is really messy and unnecessarily complicated
const SeedlotRegistrationEndpoints = (server: Server) => {
  const aClassUrl = ApiConfig.aClassSeedlot.replace(mockServerConfig.namespace, '');
  // TODO: fix the line below. 
  const user = { firstName: 'hi', lastName: 'hello' };

  server.post(aClassUrl, (schema: AppSchema, request) => {
    const attrs = JSON.parse(request.requestBody);
    const { seedlotRegistrations } = schema.db;
    const { applicantInfos } = schema.db;
    const { seedlotData } = schema.db;

    const seedlotNumber = Math.floor(Math.random() * (60000 - 1 + 1) + 1);

    attrs.seedlotNumber = seedlotNumber;

    seedlotRegistrations.insert(attrs);
    applicantInfos.insert(attrs.applicant);

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();

    const stringDate = `${yyyy}-${mm}-${dd}`;

    seedlotData.insert({
      number: seedlotNumber,
      class: 'A Class',
      lot_species: attrs.species,
      form_step: 'Collection',
      status: 4,
      participants: [`${user?.firstName} ${user?.lastName}`],
      created_at: formatDate(stringDate),
      last_modified: formatDate(stringDate),
      approved_at: formatDate('')
    });

    return {
      seedlotNumber
    };
  });

  const seedlotNumberUrl = `${ApiConfig.seedlot}/:seedlotnumber`.replace(mockServerConfig.namespace, '');
  server.get(seedlotNumberUrl, (schema: AppSchema, request) => {
    const { seedlotnumber } = request.params;
    const { seedlotData } = schema.db;
    const { seedlotRegistrations } = schema.db;
    const seedlot = seedlotData.findBy({ number: seedlotnumber });
    const seedlotApplicantInfo = seedlotRegistrations.findBy({ seedlotNumber: seedlotnumber });
    return {
      seedlot,
      seedlotApplicantInfo
    };
  });

  const seedlotUrl = ApiConfig.seedlot.replace(mockServerConfig.namespace, '');
  server.get(seedlotUrl, (schema: AppSchema) => schema.all('seedlotData'));

  const seedlotOrchardUrl = ApiConfig.seedlotOrchardStep.replace(mockServerConfig.namespace, '');
  server.post(seedlotOrchardUrl, (schema: AppSchema, request) => {
    const { seedlotnumber } = request.params;
    const attrs = JSON.parse(request.requestBody);
    const { seedlotOrchards } = schema.db;

    seedlotOrchards.insert({
      [seedlotnumber]: attrs
    });
    return {
      status: 201
    };
  });
};

export default SeedlotRegistrationEndpoints;
