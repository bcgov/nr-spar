import EnvVars from "../../utils/EnvUtils";

describe('Env Utils test', () => {
  it('should have VITE_KC_URL param', () => {
    const kcUrl = EnvVars.VITE_KC_URL;
    const kcRealm = EnvVars.VITE_KC_REALM;
    const kcClientId = EnvVars.VITE_KC_CLIENT_ID;
    const appVersion = EnvVars.VITE_NRSPARWEBAPP_VERSION;
    const serverUrl = EnvVars.VITE_SERVER_URL;
    const oracleServerUrl = EnvVars.VITE_ORACLE_SERVER_URL;

    expect(kcUrl).toBe('https://test.loginproxy.gov.bc.ca/auth');
    expect(kcRealm).toBe('standard');
    expect(kcClientId).toBe('seed-planning-test-4296');
    expect(appVersion).toBe('dev');
    expect(serverUrl).toBe('http://localhost:8090');
    expect(oracleServerUrl).toBe('https://nr-spar-test-oracle-api.apps.silver.devops.gov.bc.ca');
  });
});