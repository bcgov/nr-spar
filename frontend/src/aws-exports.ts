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

const cognitoDomain = env.VITE_AWS_DOMAIN || 'lza-prod-fam-user-pool-domain.auth.ca-central-1.amazoncognito.com';

// Cognito's client in Keycloak, one per IdP. FAM uses the same ids in the dev, test and prod
// loginproxy realms (oidc_*_idp_client_id in nr-forests-access-management's terragrunt).
const KEYCLOAK_CLIENT_IDS: Record<string, string> = {
  IDIR: 'fsa-cognito-idir-dev-4088',
  BCEIDBUSINESS: 'fsa-cognito-b-ce-id-business-dev-4090'
};

/**
 * Federated logout (#2639): Siteminder logoff.cgi -> Keycloak end-session -> Cognito /logout ->
 * app. Cognito's own /logout does not end the upstream Keycloak or Siteminder sessions, so the
 * app drives the chain, Cognito last (same as FAM, nr-fspts and nr-csp).
 *
 * Each inner URL is encoded exactly once as the outer layer's parameter. Unencoded, logoff.cgi
 * takes the inner URL's own query string as its params and the Keycloak hop loses its redirect.
 *
 * @returns {string | null} the chain URL, or null for an unknown provider (the caller falls back to Amplify).
 */
export const buildFederatedLogoutUrl = (
  provider: string,
  appReturnUrl = `${window.location.origin}/`
): string | null => {
  const keycloakClientId = KEYCLOAK_CLIENT_IDS[provider.toUpperCase()];
  if (!keycloakClientId) {
    return null;
  }
  const cognitoLogout = `https://${cognitoDomain}/logout`
    + `?client_id=${encodeURIComponent(env.VITE_USER_POOLS_WEB_CLIENT_ID)}`
    + `&logout_uri=${encodeURIComponent(appReturnUrl)}`;
  const keycloakLogout = `${retUrlString}?client_id=${encodeURIComponent(keycloakClientId)}`
    + `&post_logout_redirect_uri=${encodeURIComponent(cognitoLogout)}`;
  return `${logoutDomain}/clp-cgi/logoff.cgi?retnow=1&returl=${encodeURIComponent(keycloakLogout)}`;
};

const verificationMethods: 'code' | 'token' = 'code';

const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: env.VITE_USER_POOLS_ID,
      userPoolClientId: env.VITE_USER_POOLS_WEB_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: cognitoDomain,
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
