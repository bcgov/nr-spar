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
    'GET',
    '**/api/favourite-activities',
    [
      {
        id: 239,
        userId: 'IDIR@TEST',
        activity: 'registerAClass',
        highlighted: false
      }
    ]
  ).as('GET_initial_fav_act_req');

  cy.intercept(
    'POST',
    '**/api/favourite-activities',
    {
      statusCode: 201
    }
  ).as('POST_fav_act_req');

  cy.intercept(
    'PATCH',
    '**/api/favourite-activities/**',
    {
      statusCode: 200
    }
  ).as('PATCH_fav_act_req');

  cy.intercept(
    'DELETE',
    '**/api/favourite-activities/**',
    {
      statusCode: 200
    }
  ).as('DELETE_fav_act_req');

  cy.intercept(
    {
      method: 'GET',
      url: '**/api/seedlots/users/**'
    },
    {
      statusCode: 200,
      fixture: 'user_seedlots.json'
    }
  ).as('GET_seedlots_by_user');

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

  // TODO: Use feature instead
  cy.intercept(
    'GET',
    '**/api/forest-clients/00012797',
    {
      clientNumber: '00012797',
      clientName: 'MINISTRY OF FORESTS',
      legalFirstName: null,
      legalMiddleName: null,
      clientStatusCode: 'ACT',
      clientTypeCode: 'F',
      acronym: 'MOF'
    }
  ).as('GET_client_mof');

  // TODO: Mock seedlot sources call /api/seedlot-sources, use fixture
});
