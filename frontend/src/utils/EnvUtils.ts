interface IConfig {
  VITE_KC_URL: string
  VITE_KC_REALM: string
  VITE_KC_CLIENT_ID: string
  VITE_NRSPARWEBAPP_VERSION: string
  VITE_SERVER_URL: string
  VITE_ORACLE_SERVER_URL: string
}

declare global {
  interface Window {
    config?: IConfig;
  }
}

const EnvVars = {
  VITE_KC_URL: window.config?.VITE_KC_URL || import.meta.env.VITE_KC_URL,
  VITE_KC_REALM: window.config?.VITE_KC_REALM || import.meta.env.VITE_KC_REALM,
  VITE_KC_CLIENT_ID: window.config?.VITE_KC_CLIENT_ID || import.meta.env.VITE_KC_CLIENT_ID,
  VITE_NRSPARWEBAPP_VERSION: window.config?.VITE_NRSPARWEBAPP_VERSION
    || import.meta.env.VITE_NRSPARWEBAPP_VERSION,
  VITE_SERVER_URL: window.config?.VITE_SERVER_URL || import.meta.env.VITE_SERVER_URL,
  VITE_ORACLE_SERVER_URL: window.config?.VITE_ORACLE_SERVER_URL
    || import.meta.env.VITE_ORACLE_SERVER_URL
};

export default EnvVars;
