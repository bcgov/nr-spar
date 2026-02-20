/**
 * Sets up Cypress intercepts for moisture content cone and forest client APIs
 * with predefined fixture responses for testing purposes.
 */
export function mockMoistureContentApi() {
  cy.intercept(
    { method: 'GET', url: '**/api/moisture-content-cone/514330' },
    { statusCode: 200, fixture: 'seedlot-replicate-info.json' }
  ).as('GET_moisture_content_cone');

  cy.intercept(
    { method: 'GET', url: '**/api/forest-clients/00012797' },
    { statusCode: 200, fixture: 'forest-client.json' }
  ).as('GET_forest_client');

  cy.intercept(
    { method: 'POST', url: '**/api/moisture-content-cone/514330/calculate-average' },
    { statusCode: 200, fixture: 'moisture-content-cal-avg.json' }
  ).as('postCalcAvg');

  cy.intercept(
    { method: 'DELETE', url: '**/api/moisture-content-cone/514330/*' },
    { statusCode: 200, fixture: 'seedlot-replicate-info.json' }
  ).as('deleteReplicate');
}
