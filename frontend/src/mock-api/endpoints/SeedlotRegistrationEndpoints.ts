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
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();

    const stringDate = `${yyyy}-${mm}-${dd}`;

    seedlotData.insert({
      number: seedlotNumber,
      class: 'A Class',
      lot_species: attrs.species,
      form_step: 'Collection',
      status: 4,
      participants: [`${userData.firstName} ${userData.lastName}`],
      created_at: formatDate(stringDate),
      last_modified: formatDate(stringDate),
      approved_at: formatDate('')
    });

    return {
      seedlotNumber
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

  server.get(getUrl(ApiAddresses.SeedlotRetrieveAll, true), (schema: AppSchema) => schema.all('seedlotData'));

  server.post(getUrl(ApiAddresses.CollectionStepPost, true), (schema: AppSchema, request) => {
    const attrs = JSON.parse(request.requestBody);

    const { collectionInformation } = schema.db;
    const { collectorAgency } = schema.db;

    collectorAgency.insert(attrs.collectorAgency);
    collectionInformation.insert(attrs);

    return {
      status: 'OK'
    };
  });

  server.post(getUrl(ApiAddresses.SeedlotOrchardPost, true), (schema: AppSchema, request) => {
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

  server.post(getUrl(ApiAddresses.InterimStoragePost, true), (schema: AppSchema, request) => {
    const attrs = JSON.parse(request.requestBody);

    const { interimStorageRegistrations } = schema.db;
    const { interimAgencyInfos } = schema.db;
    const { storageInfos } = schema.db;

    interimStorageRegistrations.insert(attrs);
    interimAgencyInfos.insert(attrs.applicant);
    storageInfos.insert(attrs.storageInformation);
    return {
      status: 'OK'
    };
  });

  // Get post request for ownership registration step
  server.post(getUrl(ApiAddresses.SeedlotOwnerRegister, true), (schema: AppSchema, request) => {
    const attrs = JSON.parse(request.requestBody);
    const { seedlotnumber } = request.params;
    const { registerOwnerData } = schema.db;

    registerOwnerData.insert({
      [seedlotnumber]: attrs
    });
    return {
      status: 201
    };
  });
};

export default SeedlotRegistrationEndpoints;
