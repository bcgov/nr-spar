/**
 *
 */
export function mockMoistureContentApi() {
  cy.intercept(
    { method: 'GET', url: '**/api/moisture-content-cone/514330' },
    { statusCode: 200, fixture: 'seedlot-replicate-info.json' }
  ).as('GET_moisture_content_cone');

  cy.intercept(
    { method: 'GET', url: '**/api/seedlots/60662' },
    { statusCode: 200, fixture: 'default-seedlot-detail.json' }
  ).as('GET_seedlot_detail');

  cy.intercept(
    { method: 'GET', url: '**/api/forest-clients/00012797' },
    { statusCode: 200, fixture: 'forest-client.json' }
  ).as('GET_forest_client');
}
