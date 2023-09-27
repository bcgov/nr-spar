import { defineConfig } from 'cypress';

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
    // testIsolation: false,
    chromeWebSecurity: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(args) {
          // eslint-disable-next-line no-console
          console.log(...args);
          return null;
        }
      });
    }
  }
});
