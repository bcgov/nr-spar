// @ts-check
/// <reference path="../global.d.ts" />

import { GenericSelectors, NavigationSelectors } from '../utils/selectors';

Cypress.Commands.add('getByDataTest', (selector) => cy.get(`[data-testid=${selector}]`));

Cypress.Commands.add('login', () => {
  const credentials = {
    username: Cypress.env('USERNAME'),
    password: Cypress.env('PASSWORD')
  };

  cy.getByDataTest('landing-button__bceid').click();
  cy.origin(
    Cypress.env('keycloakLoginUrl'),
    { args: credentials },
    ({ username, password }) => {
      cy.get('#bceidLogo', { timeout: 10000 }).should('be.visible');
      cy.get('input[name=user]')
        .clear()
        .type(username, { delay: 50 });
      cy.get('input[name=password]')
        .clear()
        .type(password, { delay: 50 });
      cy.get('input[name=btnSubmit]').click();
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
