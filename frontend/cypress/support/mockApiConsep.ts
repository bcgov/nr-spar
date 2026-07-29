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

export type FavouriteMockItem = {
  id: number;
  activity: string;
  highlighted: boolean;
};

/**
 * Sets up Cypress intercepts for purity content tests and debris APIs
 * with predefined fixture responses for testing purposes.
 */
export function mockPurityContentApi() {
  const riaKey = '79082';

  cy.intercept(
    { method: 'GET', url: `**/api/purity-tests/${riaKey}*` },
    { statusCode: 200, fixture: 'purity-seedlot-replicate-info.json' }
  ).as('GET_purity_content_cone');

  cy.intercept(
    { method: 'GET', url: '**/api/test-codes/by-activity*' },
    {
      statusCode: 200,
      body: ['BRS', 'CHF', 'DUS', 'OTH']
    }
  ).as('GET_impurity_codes');

  cy.intercept(
    { method: 'PATCH', url: `**/api/purity-tests/debris/${riaKey}*` },
    (req) => {
      const body = Array.isArray(req.body) ? req.body : [];
      const response = body.map((item: any, idx: number) => ({
        riaKey: Number(riaKey),
        replicateNumber: Number(item.replicateNumber ?? 1),
        debrisSeqNumber: item.debrisSeqNumber ?? 5889500 + idx,
        debrisRank: Number(item.debrisRank ?? idx + 1),
        debrisTypeCode: String(item.debrisTypeCode ?? 'OTH')
      }));

      req.reply({
        statusCode: 200,
        body: response
      });
    }
  ).as('PATCH_impurity');

  cy.intercept(
    { method: 'DELETE', url: `**/api/purity-tests/debris/${riaKey}*` },
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

  cy.intercept(
    { method: 'PATCH', url: `**/api/purity-tests/${riaKey}*` },
    {
      statusCode: 200,
      body: {
        updateTimestamp: '2026-07-29T00:00:00.000Z'
      }
    }
  ).as('PATCH_purity_activity_record');
}
