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
  ).as('GET_verify_location_code');

  cy.intercept(
    {
      method: 'GET',
      url: '**/api/vegetation-codes*'
    },
    {
      statusCode: 200,
      fixture: 'vegetation-code.json'
    }
  ).as('GET_veg_codes');

  cy.intercept(
    {
      method: 'GET',
      url: '**/api/forest-clients/00012797'
    },
    {
      statusCode: 200,
      fixture: 'forest-clients.json'
    }
  ).as('GET_client_mof');

  cy.intercept(
    {
      method: 'GET',
      url: '**/api/seedlot-sources'
    },
    {
      statusCode: 200,
      fixture: 'seedlot-source.json'
    }
  ).as('GET_seedlot_source_by_63001');
});
