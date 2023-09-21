// @ts-check
/// <reference path="../global.d.ts" />

import { HALF_SECOND, ONE_SECOND, TYPE_DELAY } from '../constants';
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
      cy.wait(ONE_SECOND);
      cy.getByDataTest('landing-button__bceid').click();
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
    },
    {
      validate: () => {
        cy.getCookie('GUID', { domain: 'https://test.loginproxy.gov.bc.ca' }).should('exist');
      }
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
