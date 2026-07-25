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
