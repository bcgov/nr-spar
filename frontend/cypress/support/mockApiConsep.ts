/**
 * Sets up Cypress intercepts for moisture content cone and forest client APIs
 * with predefined fixture responses for testing purposes.
 */
export function mockMoistureContentApi() {
  cy.intercept(
    { method: 'GET', url: '**/api/moisture-content-cone/514330' },
    { statusCode: 200, fixture: 'moisture-seedlot-replicate-info.json' }
  ).as('GET_moisture_content_cone');

  cy.intercept(
    { method: 'GET', url: '**/api/forest-clients/00012797' },
    { statusCode: 200, fixture: 'forest-client.json' }
  ).as('GET_forest_client');

  cy.intercept(
    { method: 'POST', url: '**/api/moisture-content-cone/514330/calculate-average' },
    { statusCode: 200, fixture: 'moisture-content-cal-avg.json' }
  ).as('POST_calculate_average');

  cy.intercept(
    { method: 'DELETE', url: '**/api/moisture-content-cone/514330/*' },
    { statusCode: 200, fixture: 'moisture-seedlot-replicate-info.json' }
  ).as('DELETE_replicate');
}

export function mockPurityContentApi() {
  cy.intercept(
    { method: 'GET', url: '**/api/purity-tests/79082/*' },
    { statusCode: 200, fixture: 'purity-seedlot-replicate-info.json' }
  ).as('GET_purity_content_cone');

  cy.intercept(
    { method: 'DELETE', url: '**/api/purity-tests/debris/79082/**' },
    {
      statusCode: 200,
      body: [
        {
          riaKey: 79082,
          replicateNumber: 1,
          debrisSeqNumber: 5889566,
          debrisRank: 1,
          debrisTypeCode: 'BRS'
        },
        {
          riaKey: 79082,
          replicateNumber: 1,
          debrisSeqNumber: 5889571,
          debrisRank: 2,
          debrisTypeCode: 'CHF'
        },
        {
          riaKey: 79082,
          replicateNumber: 1,
          debrisSeqNumber: null,
          debrisRank: 3,
          debrisTypeCode: 'OTH'
        }
      ]
    }
  ).as('DELETE_impurity');
}
