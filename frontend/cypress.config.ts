/* eslint-disable prefer-destructuring */
import { defineConfig } from 'cypress';
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
      '**/01-create-a-class-seedlot.cy.ts',
      '**/02-seedlot-dashboard.cy.ts',
      '**/03-seedlot-detail.cy.ts',
      '**/04-my-seedlots.cy.ts',
      '**/21-create-a-class-seedlot-pli.cy.ts',
      '**/22-a-class-seedlot-reg-form-collection-interim.cy.ts',
      '**/23-a-class-seedlot-reg-form-ownership.cy.ts',
      '**/24-a-class-seedlot-reg-form-extraction.cy.ts',
      '**/31-create-a-class-seedlot-pli.cy.ts',
      '**/32-a-class-seedlot-reg-form-orchard.cy.ts',
      '**/33-a-class-seedlot-reg-form-parent-tree-part-1.cy.ts',
      '**/34-a-class-seedlot-reg-form-parent-tree-part-2.cy.ts',
      '**/35-a-class-seedlot-reg-form-parent-tree-part-3.cy.ts',
      '**/11-login-page.cy.ts',
      '**/12-dashboard-page.cy.ts',
      '**/13-create-a-class-seedlot-fdi.cy.ts',
      '**/14-a-class-seedlot-reg-form-parent-tree-calculations-part-1.cy.ts',
      '**/15-api-tests.cy.ts',
      '**/16-edit-applicant-seedlot-info.cy.ts'
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
