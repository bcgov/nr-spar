import { env } from '../env';

const configuredUrl = (value: unknown, fallback: string) => {
  const url = typeof value === 'string' ? value.trim() : '';
  return url.length > 0 ? url.replace(/\/+$/, '') : fallback;
};

const serverHost = configuredUrl(env.VITE_SERVER_URL, 'http://localhost:8090');

const oracleServerHost = configuredUrl(
  env.VITE_ORACLE_SERVER_URL,
  'https://nr-spar-test-oracle-api.apps.silver.devops.gov.bc.ca'
);

const ApiConfig = {
  /**
   * Backend API
   */
  favouriteActivities: `${serverHost}/api/favourite-activities`,

  geneticClasses: `${serverHost}/api/genetic-classes`,

  geneticWothList: `${serverHost}/api/genetic-worth`,

  methodsOfPayment: `${serverHost}/api/methods-of-payment`,

  orchards: `${serverHost}/api/orchards`,

  coneCollectionMethod: `${serverHost}/api/cone-collection-methods`,

  uploadConeAndPollen: `${serverHost}/api/seedlots/parent-trees-contribution/cone-pollen-count-table/upload`,

  uploadSMPMix: `${serverHost}/api/seedlots/parent-trees-contribution/smp-calculation-table/upload`,

  gameticMethodology: `${serverHost}/api/gametic-methodologies`,

  forestClient: `${serverHost}/api/forest-clients`,

  parentTreeValsCalc: `${serverHost}/api/parent-trees/calculate`,

  seedlotSources: `${serverHost}/api/seedlot-sources`,

  seedlots: `${serverHost}/api/seedlots`,

  orchardsVegCode: `${serverHost}/api/orchards/vegetation-codes`,

  tscAdmin: `${serverHost}/api/tsc-admin`,

  tscSeedlotEdit: `${serverHost}/api/tsc-admin/seedlots/{seedlotNumber}/edit`,

  tscSeedlotStatusUpdate: `${serverHost}/api/tsc-admin/seedlots/{seedlotNumber}/status/{status}`,

  /**
   * SPAR Map AOI save endpoint.
   *
   * Backed by `POST /api/seedlots/{seedlotNumber}/aoi` (Phase 1 of Risk #1
   * resolution, 2026-04-07). The backend Flyway migration (V48), Seedlot
   * entity column (`collection_geom`), DTOs, service method, and controller
   * are all in place. This path mirrors the base mapping of
   * `SeedlotEndpoint` (`/api/seedlots`) — the React POC no longer uses a
   * `/v1/` prefix since the rest of the FDS API is unversioned. See
   * `sparMapApi.ts` for the request/response contract.
   */
  sparMapAoi: `${serverHost}/api/seedlots/{seedlotNumber}/aoi`,

  /**
   * ORACLE API
   */
  vegetationCode: `${oracleServerHost}/api/vegetation-codes?page=0&perPage=500`,

  fundingSource: `${oracleServerHost}/api/funding-sources`,

  facilityTypes: `${oracleServerHost}/api/facility-types`,

  oracleOrchards: `${oracleServerHost}/api/orchards`,

  areaOfUseSpzList: `${oracleServerHost}/api/area-of-use/spz-list/vegetation-code`,

  parentTreeByVegCode: `${oracleServerHost}/api/parent-trees/vegetation-codes/{vegCode}`,

  seedlotFromOracleDbBySeedlotNumber: `${oracleServerHost}/api/seedlot/{seedlotNumber}`,

  moistureContent: `${oracleServerHost}/api/moisture-content-cone`,

  purityTest: `${oracleServerHost}/api/purity-tests`,

  searchTestActivities: `${oracleServerHost}/api/testing-activities`,

  testCodes: `${oracleServerHost}/api/test-codes`,

  activities: `${oracleServerHost}/api/activities`,

  requestSeedLotAndVegLot: `${oracleServerHost}/api/request-seedlot-and-veglot`,

  germinatorTrays: `${oracleServerHost}/api/germinator-trays`
};

export default ApiConfig;
