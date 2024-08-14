import { env } from './env';

// VITE_ZONE: One of dev | test | prod
const ZONE = env.VITE_ZONE ? env.VITE_ZONE.toLocaleLowerCase() : 'dev';
const retUrlEnv = ZONE !== 'prod' && ZONE !== 'test' ? 'dev' : ZONE;

// [https://logon7.gov.bc.ca] for PROD and [https://logontest7.gov.bc.ca] for everyting else
const logoutDomain = ZONE === 'prod' ? 'https://logon7.gov.bc.ca' : 'https://logontest7.gov.bc.ca';

const signOutUrl = [
  `${logoutDomain}/clp-cgi/logoff.cgi`,
  '?retnow=1',
  `&returl=https://${retUrlEnv}.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/logout`,
  `?redirect_uri=${window.location.origin}/`
].join('');

const awsconfig = {
  aws_cognito_region: env.VITE_COGNITO_REGION || 'ca-central-1',
  aws_user_pools_id: env.VITE_USER_POOLS_ID,
  aws_user_pools_web_client_id: env.VITE_USER_POOLS_WEB_CLIENT_ID,
  aws_mandatory_sign_in: 'enable',
  oauth: {
    domain: env.VITE_AWS_DOMAIN || 'prod-fam-user-pool-domain.auth.ca-central-1.amazoncognito.com',
    scope: ['openid'],
    redirectSignIn: `${window.location.origin}/`,
    redirectSignOut: signOutUrl,
    responseType: 'code'
  },
  federationTarget: 'COGNITO_USER_POOLS'
};

export default awsconfig;
