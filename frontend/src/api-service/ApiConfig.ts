import { env } from '../env';

const serverHost = env.VITE_SERVER_URL;

const oracleServerHost = env.VITE_ORACLE_SERVER_URL;

const ApiConfig = {
  /**
   * Backend API
   */
  favouriteActivities: `${serverHost}/api/favourite-activities`,

  geneticClasses: `${serverHost}/api/genetic-classes`,

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

  tscAdmin: `${serverHost}/api/tsc-admin`,

  tscSeedlotEdit: `${serverHost}/api/tsc-admin/seedlots/{seedlotNumber}/edit`,

  tscSeedlotStatusUpdate: `${serverHost}/api/tsc-admin/seedlots/{seedlotNumber}/status/{status}`,

  /**
   * ORACLE API
   */
  vegetationCode: `${oracleServerHost}/api/vegetation-codes?page=0&perPage=500`,

  fundingSource: `${oracleServerHost}/api/funding-sources`,

  facilityTypes: `${oracleServerHost}/api/facility-types`,

  oracleOrchards: `${oracleServerHost}/api/orchards`,

  orchardsVegCode: `${oracleServerHost}/api/orchards/vegetation-code`,

  areaOfUseSpzList: `${oracleServerHost}/api/area-of-use/spz-list/vegetation-code`
};

export default ApiConfig;
