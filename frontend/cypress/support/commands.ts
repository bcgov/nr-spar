// @ts-check
/// <reference path="../global.d.ts" />

import '@cypress/code-coverage/support';
import {
  HALF_SECOND, THREE_SECONDS, TYPE_DELAY
} from '../constants';
import { GenericSelectors, NavigationSelectors } from '../utils/selectors';

Cypress.Commands.add('getByDataTest', (selector) => cy.get(`[data-testid=${selector}]`));

Cypress.Commands.add('login', () => {
  const config = {
    username: Cypress.env('USERNAME'),
    password: Cypress.env('PASSWORD'),
    timeout: HALF_SECOND,
    delay: TYPE_DELAY
  };

  cy.session(
    config.username,
    () => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.visit('/');
      // We have to wait here because page might reload again, causing the login to fail
      cy.wait(THREE_SECONDS);
      cy.getByDataTest('landing-button__bceid').click();
      cy.url().then((url) => {
        if (url.includes('.gov.bc.ca')) {
          cy.get('#bceidLogo', { timeout: config.timeout }).should('be.visible');
          cy.get('input[name=user]')
            .clear()
            .type(config.username, { delay: config.delay });
          cy.get('input[name=password]')
            .clear()
            .type(config.password, { delay: config.delay });
          cy.get('input[name=btnSubmit]').click();
        } else {
          cy.origin(
            Cypress.env('keycloakLoginUrl'),
            { args: config },
            (
              {
                username, password, delay, timeout
              }
            ) => {
              cy.get('#bceidLogo', { timeout }).should('be.visible');
              cy.get('input[name=user]')
                .clear()
                .type(username, { delay });
              cy.get('input[name=password]')
                .clear()
                .type(password, { delay });
              cy.get('input[name=btnSubmit]').click();
            }
          );
        }
      });
      cy.getCookies().then((cookies) => {
        cookies.forEach((cookie) => {
          cy.log(cookie.name, cookie.domain, '\n');
        });
      });
    },
    {
      validate: () => {
        cy.getCookie('SMSESSION', { domain: '.gov.bc.ca' }).should('exist');
      },
      cacheAcrossSpecs: true
    }
  );
});

Cypress.Commands.add('navigateTo', (menuItem) => {
  cy.get(NavigationSelectors.NavigationSideMenu)
    .contains(menuItem)
    .click();
});

Cypress.Commands.add('isPageTitle', (pageTitle) => {
  cy.get(GenericSelectors.PageTitle)
    .should('contain.text', pageTitle);
});

Cypress.Commands.add('toogleFavourite', () => {
  cy.get(GenericSelectors.FavouriteButton)
    .click();
});

Cypress.Commands.overwrite('log', (log, ...args) => {
  if (Cypress.browser.isHeadless) {
    return cy.task('log', args, { log: false }).then(() => log(...args));
  }
  // eslint-disable-next-line no-console
  console.log(...args);
  return log(...args);
});
