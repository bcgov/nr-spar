// @ts-check
/// <reference path="../global.d.ts" />

Cypress.Commands.add('getByDataTest', (selector) => cy.get(`[data-testid=${selector}]`));

Cypress.Commands.add('deleteUser', (firstname, lastname) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/api/users/${firstname}/${lastname}`,
    failOnStatusCode: false
  }).then((response) => {
    cy.log(`${response.status}`);
    cy.log(response.body);
  });
});

Cypress.Commands.add('createUser', (firstname, lastname) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/users`,
    failOnStatusCode: false,
    body: {
      firstName: firstname,
      lastName: lastname
    }
  }).then((response) => {
    cy.log(`${response.status}`);
    cy.log(response.body);
  });
});

Cypress.Commands.add('login', () => {
  const USERNAME = Cypress.env('USERNAME');
  const PASSWORD = Cypress.env('PASSWORD');

  cy.getByDataTest('landing-button__bceid').click();
  cy.get('#bceidLogo').should('be.visible');
  cy.get('input[name=user]')
    .clear()
    .type(USERNAME, { delay: 50 });
  cy.get('input[name=password]')
    .clear()
    .type(PASSWORD, { delay: 50 });
  cy.get('input[name=btnSubmit]').click();
});
