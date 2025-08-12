import { env } from './env';

// VITE_ZONE: One of dev | test | prod
const ZONE = env.VITE_ZONE ? env.VITE_ZONE.toLocaleLowerCase() : 'dev';
const retUrlEnv = ZONE !== 'prod' && ZONE !== 'test' ? 'dev' : ZONE;

const retUrlString = ZONE === 'prod'
  ? 'https://loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/logout'
  : `https://${retUrlEnv}.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/logout`;

// [https://logon7.gov.bc.ca] for PROD and [https://logontest7.gov.bc.ca] for everyting else
const logoutDomain = ZONE === 'prod' ? 'https://logon7.gov.bc.ca' : 'https://logontest7.gov.bc.ca';

const signOutUrl = [
  `${logoutDomain}/clp-cgi/logoff.cgi`,
  '?retnow=1',
  `&returl=${retUrlString}`,
  `?redirect_uri=${window.location.origin}/`
].join('');

const verificationMethods: 'code' | 'token' = 'code';

const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: env.VITE_USER_POOLS_ID,
      userPoolClientId: env.VITE_USER_POOLS_WEB_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: env.VITE_AWS_DOMAIN || 'prod-fam-user-pool-domain.auth.ca-central-1.amazoncognito.com',
          scopes: ['openid'],
          redirectSignIn: [`${window.location.origin}/`],
          redirectSignOut: [signOutUrl],
          responseType: verificationMethods
        }
      }
    }
  }
};

export default awsconfig;
