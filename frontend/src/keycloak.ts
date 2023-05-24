import Keycloak from 'keycloak-js';
import { env } from './env';

const url = env.REACT_APP_KC_URL || '';
const realm = env.REACT_APP_KC_REALM || 'standard';
const clientId = env.REACT_APP_KC_CLIENT_ID || 'seed-planning-test-4296';

const keycloak = new Keycloak({
  url,
  realm,
  clientId
});

export default keycloak;
