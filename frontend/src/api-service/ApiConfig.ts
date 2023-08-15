import mockServerConfig from '../mock-server/config';
import { EnvVars } from '../utils/EnvUtils';

const serverHost = import.meta.env.VITE_SERVER_URL || mockServerConfig.namespace;

const oracleServerHost = import.meta.env.VITE_ORACLE_SERVER_URL || mockServerConfig.namespace;

const isProdEnv = import.meta.env.MODE === 'production';

// The API host should never be mock server in PROD
const mockServerHost = isProdEnv ? import.meta.env.VITE_SERVER_URL : mockServerConfig.namespace;

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

  paymentMethod: `${serverHost}/api/payment-methods`,

  orchards: `${serverHost}/api/orchards`,

  orchardsVegCode: `${serverHost}/api/orchards/vegetation-code`,

  coneCollectionMethod: `${serverHost}/api/cone-collection-methods`,

  uploadConeAndPollen: `${serverHost}/api/seedlots/parent-trees-contribution/cone-pollen-count-table/upload`,

  uploadSMPMix: `${serverHost}/api/seedlots/parent-trees-contribution/smp-calculation-table/upload`,

  maleFemaleMethodology: `${serverHost}/api/male-female-methodologies`,

  /**
   * ORACLE API
   */
  vegetationCode: `${oracleServerHost}/api/vegetation-codes?page=0&perPage=500`,

  fundingSource: `${oracleServerHost}/api/funding-sources`,

  oracleOrchards: `${oracleServerHost}/api/orchards`
};

export default ApiConfig;
