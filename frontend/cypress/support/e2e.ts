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
      method: 'POST',
      url: '**/api/seedlots'
    },
    {
      statusCode: 201,
      body: {
        seedlotNumber: '654321'
      }
    }
  ).as('POST_submit_seedlot');

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
      url: '**/api/seedlots/63001'
    },
    {
      statusCode: 200,
      fixture: 'default-seedlot-detail.json'
    }
  ).as('GET_seedlot_detail_by_63001');

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
