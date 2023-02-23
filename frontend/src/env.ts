declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    env: any
  }
}

// eslint-disable-next-line import/prefer-default-export
export const env: Record<string, any> = { ...process.env, ...window.env };
