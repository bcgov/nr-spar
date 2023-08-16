declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    config: any
  }
}

// eslint-disable-next-line import/prefer-default-export
export const env: Record<string, any> = { ...import.meta.env, ...window.config };
