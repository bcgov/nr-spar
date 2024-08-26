// @ts-check
/// <reference path="../global.d.ts" />

import '@cypress/code-coverage/support';
import {
  HALF_SECOND, TYPE_DELAY
} from '../constants';
import { GenericSelectors, NavigationSelectors } from '../utils/selectors';
import prefix from '../../src/styles/classPrefix';

Cypress.Commands.add('getByDataTest', (selector) => cy.get(`[data-testid=${selector}]`));

Cypress.Commands.add('login', () => {
  const config = {
    username: Cypress.env('USERNAME'),
    password: Cypress.env('PASSWORD'),
    timeout: HALF_SECOND,
    loginService: Cypress.env('LOGIN_SERVICE') ?? 'IDIR',
    delay: TYPE_DELAY
  };

  cy.session(
    config.username,
    () => {
      const loginBtnId = `landing-button__${config.loginService.toLowerCase()}`;
      const loginLogo = `#${config.loginService.toLowerCase()}Logo`;
      const loginUrl = config.loginService === 'IDIR'
        ? Cypress.env('idirLoginUrl') : Cypress.env('businessBceIdLoginUrl');
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.visit('/');
      cy.getByDataTest(loginBtnId).click();
      cy.url().then((url) => {
        if (url.includes('.gov.bc.ca')) {
          cy.get(loginLogo, { timeout: config.timeout }).should('be.visible');
          cy.get('input[name=user]')
            .clear()
            .type(config.username, { delay: config.delay });
          cy.get('input[name=password]')
            .clear()
            .type(config.password, { delay: config.delay });
          cy.get('input[name=btnSubmit]').click();
        } else {
          cy.origin(
            loginUrl,
            { args: config },
            (
              {
                username, password, delay, timeout
              }
            ) => {
              cy.get(loginLogo, { timeout }).should('be.visible');
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
      cy.get('.bx--contained-list-item__content').contains('WESTERN FOREST PRODUCTS INC.').click();
      cy.get('.action-btn').contains('Continue').click();

      cy.url().should('contains', '/dashboard');
      cy.setCookie('is-cypress-logged-in', 'true');
    },
    {
      validate: () => {
        cy.getCookie('is-cypress-logged-in').should('exist');
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

Cypress.Commands.add('saveSeedlotRegFormProgress', () => {
  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .should('not.be.disabled');

  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .contains('Save changes')
    .click();

  cy.get(`.${prefix}--inline-loading__text`)
    .contains('Changes saved!');
});
