import { env } from '../env';
import mockServerConfig from '../mock-server/config';

const serverHost = env.REACT_APP_SERVER_URL || mockServerConfig.namespace;

const oracleServerHost = env.REACT_APP_ORACLE_SERVER_URL || mockServerConfig.namespace;

const isProdEnv = env.REACT_APP_NRSPARWEBAPP_VERSION?.startsWith('prod');

// The API host should never be mock server in PROD
const mockServerHost = isProdEnv ? env.REACT_APP_SERVER_URL : mockServerConfig.namespace;

const ApiConfig = {
  /**
   * MOCK API
   */
  applicantInfo: `${mockServerHost}/api/application-info`,

  aClassSeedlot: `${mockServerHost}/api/register-a-class`,

  seedlot: `${mockServerHost}/api/seedlot`,

  seedlotOrchardStep: `${mockServerHost}/api/seedlot/orchard`,

  orchard: `${mockServerHost}/api/orchard`,

  recentActivities: `${mockServerHost}/api/recent-activities`,

  /**
   * POSTGRES API
   */
  favouriteActivities: `${serverHost}/api/favourite-activities`,

  geneticClasses: `${serverHost}/api/genetic-classes`,

  paymentMethod: `${serverHost}/api/payment-methods`,

  /**
   * ORACLE API
   */
  vegetationCode: `${oracleServerHost}/api/vegetation-codes?page=0&perPage=500`,

  fundingSource: `${oracleServerHost}/api/funding-sources`
};

export default ApiConfig;
