import { defineConfig } from 'cypress';
import { TEN_SECONDS } from './cypress/constants';

declare const require: any;

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000/',
    viewportWidth: 1280,
    viewportHeight: 720,
    experimentalWebKitSupport: true,
    env: {
      keycloakLoginUrl: 'https://logontest7.gov.bc.ca'
    },
    specPattern: [
      '**/login-page.cy.ts',
      '**/dashboard-page.cy.ts',
      '**/seedlot-main-page.cy.ts',
      '**/create-a-class-seedlot.cy.ts'
    ],
    chromeWebSecurity: false,
    retries: {
      runMode: 4
    },
    defaultCommandTimeout: TEN_SECONDS,
    video: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      // implement node event listeners here
      on('task', {
        log(args) {
          // eslint-disable-next-line no-console
          console.log(...args);
          return null;
        }
      });

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    }
  }
});
