import Keycloak from 'keycloak-js';
import { env } from './env';

const url = env.VITE_KC_URL || '';
const realm = env.VITE_KC_REALM || '';
const clientId = env.VITE_KC_CLIENT_ID || '';

const keycloak = new Keycloak({
  url,
  realm,
  clientId
});

export default keycloak;
