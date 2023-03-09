import { Server } from 'miragejs';
import AppSchema from '../schema';

import KeycloakService from '../../service/KeycloakService';

import formatDate from '../../utils/DateUtils';
import getUrl from '../../utils/ApiUtils';
import ApiAddresses from '../../utils/ApiAddresses';

const SeedlotRegistrationEndpoints = (server: Server) => {
  server.post(getUrl(ApiAddresses.AClassSeedlotPost, true), (schema: AppSchema, request) => {
    const attrs = JSON.parse(request.requestBody);
    const { seedlotRegistrations } = schema.db;
    const { applicantInfos } = schema.db;
    const { seedlotData } = schema.db;

    const seedlotNumber = Math.floor(Math.random() * (60000 - 1 + 1) + 1);

    attrs.seedlotNumber = seedlotNumber;

    seedlotRegistrations.insert(attrs);
    applicantInfos.insert(attrs.applicant);

    const userData = KeycloakService.getUser();

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    const stringDate = yyyy + '-' + mm + '-' + dd;

    seedlotData.insert({
      number: seedlotNumber,
      class: "A Class",
      lot_species: attrs.species,
      form_step: "Collection",
      status: 4,
      participants: [`${userData.firstName} ${userData.lastName}`],
      created_at: formatDate(stringDate),
      last_modified: formatDate(stringDate),
      approved_at: formatDate('')
    });

    return {
      seedlotNumber: seedlotNumber,
    };
  });

  server.get(getUrl(ApiAddresses.SeedlotRetrieveOne, true), (schema: AppSchema, request) => {
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
};

export default SeedlotRegistrationEndpoints;
