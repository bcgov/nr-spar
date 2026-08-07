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

type FavouriteMockState = {
  getFavStore: () => FavouriteMockItem[];
  setFavStore: (items: FavouriteMockItem[]) => void;
  getNextId: () => number;
  setNextId: (id: number) => void;
};

/**
 * Sets up Cypress intercepts for favourite activities APIs with in-memory state.
 */
export function mockFavouriteActivitiesApi(state: FavouriteMockState) {
  const apiPath = '**/api/favourite-activities**';

  cy.intercept('GET', apiPath, (req) => {
    req.reply({
      statusCode: 200,
      body: state.getFavStore()
    });
  }).as('GET_favourite_activities');

  cy.intercept('POST', apiPath, (req) => {
    const body = (req.body ?? []) as Array<{ activity: string }>;
    const current = [...state.getFavStore()];
    let nextId = state.getNextId();

    body.forEach((item) => {
      if (!current.some((x) => x.activity === item.activity) && current.length < 12) {
        current.push({
          id: nextId,
          activity: item.activity,
          highlighted: false
        });
        nextId += 1;
      }
    });

    state.setFavStore(current);
    state.setNextId(nextId);

    req.reply({ statusCode: 200, body });
  }).as('POST_favourite_activities');

  cy.intercept('PATCH', '**/api/favourite-activities/*', (req) => {
    const id = Number(req.url.split('/').pop());
    const updated = state.getFavStore().map((x) => (x.id === id ? { ...x, highlighted: !x.highlighted } : x));
    state.setFavStore(updated);

    req.reply({ statusCode: 200, body: {} });
  }).as('PATCH_favourite_activities');

  cy.intercept('DELETE', '**/api/favourite-activities/*', (req) => {
    const id = Number(req.url.split('/').pop());
    const updated = state.getFavStore().filter((x) => x.id !== id);
    state.setFavStore(updated);

    req.reply({ statusCode: 200, body: {} });
  }).as('DELETE_favourite_activities');
}

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
