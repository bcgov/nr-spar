import Keycloak from 'keycloak-js';
import { env } from './env';

const url = env.REACT_APP_KC_URL || '';
const realm = env.REACT_APP_KC_REALM || '';
const clientId = env.REACT_APP_KC_CLIENT_ID || '';

const keycloak = new Keycloak({
  url,
  realm,
  clientId
});

export default keycloak;
