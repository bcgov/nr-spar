import Keycloak from 'keycloak-js';
import { env } from './env';

const url = env.VITE_KC_URL || 'https://test.loginproxy.gov.bc.ca/auth';
const realm = env.VITE_KC_REALM || 'standard';
const clientId = env.VITE_KC_CLIENT_ID || 'seed-planning-test-4296';

const keycloak = new Keycloak({
  url,
  realm,
  clientId
});

export default keycloak;
