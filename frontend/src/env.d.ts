/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KC_URL: string
  readonly VITE_KC_REALM: string
  readonly VITE_KC_CLIENT_ID: string
  readonly VITE_NRSPARWEBAPP_VERSION: string
  readonly VITE_SERVER_URL: string
  readonly VITE_ORACLE_SERVER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
