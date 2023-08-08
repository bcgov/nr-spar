import Keycloak from 'keycloak-js';
import EnvVars from './utils/EnvUtils';

const keycloak = new Keycloak({
  url: EnvVars.VITE_KC_URL,
  realm: EnvVars.VITE_KC_REALM,
  clientId: EnvVars.VITE_KC_CLIENT_ID
});

export default keycloak;
