import { defineConfig } from 'cypress';
import cypressSplit from 'cypress-split';
import { TEN_SECONDS } from './cypress/constants';

declare const require: any;

let CypressData: { [k: string]: any } = {};

export default defineConfig({
  e2e: {
    projectId: 'aa2v3q',
    baseUrl: 'http://localhost:3000/',
    viewportWidth: 1280,
    viewportHeight: 720,
    experimentalWebKitSupport: true,
    supportFile: 'cypress/support/commands.ts',
    env: {
      idirLoginUrl: 'https://logontest7.gov.bc.ca',
      businessBceIdLoginUrl: 'https://logontest7.gov.bc.ca'
    },
    specPattern: [
      'cypress/e2e/smoke-test-01/**/*.cy.ts',
      'cypress/e2e/smoke-test-02/**/*.cy.ts',
      'cypress/e2e/smoke-test-03/**/*.cy.ts',
      'cypress/e2e/smoke-test-04/**/*.cy.ts',
      'cypress/e2e/smoke-test-05/**/*.cy.ts'
    ],
    chromeWebSecurity: false,
    retries: {
      runMode: 0
    },
    defaultCommandTimeout: TEN_SECONDS,
    video: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      cypressSplit(on, config);
      // implement node event listeners here
      on('task', {
        log(args) {
          // eslint-disable-next-line no-console
          console.log(...args);
          return null;
        },
        setData(keyValuePair) {
          if (!Array.isArray(keyValuePair) || keyValuePair.length !== 2) {
            return null;
          }
          const key = keyValuePair[0];
          const value = keyValuePair[1];
          CypressData = Object.assign(CypressData, { [key]: value });

          return null;
        },
        getData(key) {
          if (CypressData[key]) {
            return CypressData[key];
          }
          return '';
        }
      });

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    }
  }
});
