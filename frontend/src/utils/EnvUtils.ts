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

const getEnvStrValue = (key: keyof IConfig): string => {
  const fromWindow = window.config?.[key];
  if (fromWindow) {
    return fromWindow;
  }

  return import.meta.env[key] ?? '';
};

const EnvVars = {
  VITE_KC_URL: getEnvStrValue('VITE_KC_URL'),
  VITE_KC_REALM: getEnvStrValue('VITE_KC_REALM'),
  VITE_KC_CLIENT_ID: getEnvStrValue('VITE_KC_CLIENT_ID'),
  VITE_NRSPARWEBAPP_VERSION: getEnvStrValue('VITE_NRSPARWEBAPP_VERSION'),
  VITE_SERVER_URL: getEnvStrValue('VITE_SERVER_URL'),
  VITE_ORACLE_SERVER_URL: getEnvStrValue('VITE_ORACLE_SERVER_URL')
};

export default EnvVars;
