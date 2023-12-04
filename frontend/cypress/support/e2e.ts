import './commands';

beforeEach(() => {
  cy.intercept(
    {
      method: 'GET',
      url: '**/api/forest-clients/**'
    },
    {
      statusCode: 200
    }
  ).as('verifyLocationCode');

  cy.intercept(
    {
      method: 'POST',
      url: '**/api/seedlots'
    },
    {
      statusCode: 201,
      body: {
        seedlotNumber: '654321'
      }
    }
  ).as('submitSeedlot');

  cy.intercept(
    {
      method: 'GET',
      url: '**/api/vegetation-codes*'
    },
    {
      statusCode: 201,
      fixture: 'vegetation-code.json'
    }
  ).as('vegetationCode');
});
