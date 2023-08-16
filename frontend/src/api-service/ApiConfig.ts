import { env } from '../env';
import mockServerConfig from '../mock-server/config';

const serverHost = env.VITE_SERVER_URL || mockServerConfig.namespace;

const oracleServerHost = env.VITE_ORACLE_SERVER_URL || mockServerConfig.namespace;

const isProdEnv = env.VITE_NRSPARWEBAPP_VERSION?.startsWith('prod');

// The API host should never be mock server in PROD
const mockServerHost = isProdEnv ? env.VITE_SERVER_URL : mockServerConfig.namespace;

const ApiConfig = {
  /**
   * MOCK API
   */
  applicantInfo: `${mockServerHost}/api/applicant-info`,

  aClassSeedlot: `${mockServerHost}/api/register-a-class`,

  seedlot: `${mockServerHost}/api/seedlot`,

  seedlotOrchardStep: `${mockServerHost}/api/seedlot/orchard`,

  recentActivities: `${mockServerHost}/api/recent-activities`,

  filesAndDocs: `${mockServerHost}/api/recent-files`,

  applicantAgencies: `${mockServerHost}/api/applicant-agencies`,

  /**
   * Backend API
   */
  favouriteActivities: `${serverHost}/api/favourite-activities`,

  geneticClasses: `${serverHost}/api/genetic-classes`,

  methodsOfPayment: `${serverHost}/api/methods-of-payment`,

  orchards: `${serverHost}/api/orchards`,

  orchardsVegCode: `${serverHost}/api/orchards/vegetation-code`,

  coneCollectionMethod: `${serverHost}/api/cone-collection-methods`,

  uploadConeAndPollen: `${serverHost}/api/seedlots/parent-trees-contribution/cone-pollen-count-table/upload`,

  uploadSMPMix: `${serverHost}/api/seedlots/parent-trees-contribution/smp-calculation-table/upload`,

  gameticMethodology: `${serverHost}/api/gametic-methodologies`,

  /**
   * ORACLE API
   */
  vegetationCode: `${oracleServerHost}/api/vegetation-codes?page=0&perPage=500`,

  fundingSource: `${oracleServerHost}/api/funding-sources`,

  oracleOrchards: `${oracleServerHost}/api/orchards`
};

export default ApiConfig;
