import { Given, Then, When, DataTable } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';
import { FavouriteActivitiesType } from '../../definitions';

let favouriteContent: FavouriteActivitiesType;
type FavItem = {
  id: number;
  activity: string;
  highlighted: boolean;
};

let favStore: FavItem[] = [];
let nextId = 1;

const apiPath = '**/api/favourite-activities**';

const getFixtureRowNames = (): string[] => {
  if (!favouriteContent) {
    throw new Error('Favourite activities fixture is not loaded. Add step: And the favourite activities content fixture is loaded');
  }

  return Object.values(favouriteContent.table);
};

const toActivityKey = (header: string): string => {
  const tokens = header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  return tokens
    .map((token, index) => (index === 0 ? token : token.charAt(0).toUpperCase() + token.slice(1)))
    .join('');
};

const addActivityByHeader = (header: string) => {
  if (!getFixtureRowNames().includes(header)) {
    throw new Error('Header is not in favourite-activities-content fixture: ' + header);
  }

  const key = toActivityKey(header);

  if (!favStore.some((x) => x.activity === key) && favStore.length < 12) {
    favStore.push({ id: nextId++, activity: key, highlighted: false });
  }
};

Given('favourite activities API responses are mocked', () => {
  favStore = [];
  nextId = 1;

  cy.intercept('GET', apiPath, (req) => {
    req.reply({
      statusCode: 200,
      body: favStore
    });
  }).as('GET_favourite_activities');

  cy.intercept('POST', apiPath, (req) => {
    const body = (req.body ?? []) as Array<{ activity: string }>;
    body.forEach((item) => {
      if (!favStore.some((x) => x.activity === item.activity) && favStore.length < 12) {
        favStore.push({
          id: nextId++,
          activity: item.activity,
          highlighted: false
        });
      }
    });

    req.reply({ statusCode: 200, body: body });
  }).as('POST_favourite_activities');

  cy.intercept('PATCH', '**/api/favourite-activities/*', (req) => {
    const id = Number(req.url.split('/').pop());
    favStore = favStore.map((x) => (x.id === id ? { ...x, highlighted: !x.highlighted } : x));
    req.reply({ statusCode: 200, body: {} });
  }).as('PATCH_favourite_activities');

  cy.intercept('DELETE', '**/api/favourite-activities/*', (req) => {
    const id = Number(req.url.split('/').pop());
    favStore = favStore.filter((x) => x.id !== id);
    req.reply({ statusCode: 200, body: {} });
  }).as('DELETE_favourite_activities');
});

Given('the favourite activities content fixture is loaded', () => {
  cy.fixture('favourite-activities-content').then((data: FavouriteActivitiesType) => {
    favouriteContent = data;
    cy.wrap(data).as('favouriteContent');
  });
});

Given('favourite activities include:', (dataTable: DataTable) => {
  dataTable.raw().flat().filter(Boolean).forEach((header) => {
    addActivityByHeader(header);
  });
});

Then('I can see the empty favourite section title', () => {
  cy.contains('.consep-fav-non-content-title', favouriteContent.fa.title).should('be.visible');
});

Then('I can see the empty favourite section subtitle', () => {
  cy.contains('.consep-fav-non-content-subtitle', favouriteContent.fa.subtitle).should('be.visible');
});

Then('I can see the add favourite activity button', () => {
  cy.contains('button.consep-fav-non-content-btn', favouriteContent.fa.favouriteActivitiesBtn).should('be.visible');
});

When('I open the add favourite activity modal', () => {
  cy.contains('button', /Add favourite activity|Add favourite/).click();
});

Then('I can see the favourite activity modal', () => {
  cy.get('.favourite-activity-modal').should('be.visible');
  cy.contains('h2', 'Add favourite activity').should('be.visible');
});

When('I close the favourite activity modal', () => {
  cy.contains('button', 'Cancel').click();
});

Then('I should not see the favourite activity modal', () => {
  cy.get('.favourite-activity-modal').should('not.exist');
});

When('I search favourite activities for {string}', (term: string) => {
  cy.get('#client-search-input').clear().type(term);
  cy.contains('button', 'Search').click();
});

Then('I should see favourite activity row {string}', (activityName: string) => {
  expect(getFixtureRowNames(), `Row not found in fixture: ${activityName}`).to.include(activityName);
  cy.contains(`.${prefix}--data-table tbody tr`, activityName).should('be.visible');
});

When('I select favourite activities:', (dataTable: DataTable) => {
  dataTable.raw().flat().filter(Boolean).forEach((activityName) => {
    expect(getFixtureRowNames(), `Row not found in fixture: ${activityName}`).to.include(activityName);
    cy.contains(`.${prefix}--data-table tbody tr`, activityName).click();
  });
});

When('I submit favourite activity modal', () => {
  cy.contains('button', 'Add to favourites').click();
  cy.wait('@POST_favourite_activities');
  cy.wait('@GET_favourite_activities');
});

Then('I should see favourite card {string}', (activityName: string) => {
  cy.contains('.consep-fav-card p, .consep-fav-card-highlighted p', activityName).should('be.visible');
});

Then('I should not see favourite card {string}', (activityName: string) => {
  cy.contains('.consep-fav-card p, .consep-fav-card-highlighted p', activityName).should('not.exist');
});

When('I highlight favourite card {string}', (activityName: string) => {
  cy.contains('.consep-fav-card p, .consep-fav-card-highlighted p', activityName)
    .closest('.consep-fav-card, .consep-fav-card-highlighted')
    .find('button.fav-card-overflow')
    .click();

  cy.get('.fav-card-menu-options, .' + prefix + '--overflow-menu-options')
    .contains('Highlight shortcut')
    .click();

  cy.wait('@PATCH_favourite_activities');
  cy.wait('@GET_favourite_activities');
});

Then('favourite card {string} should be highlighted', (activityName: string) => {
  cy.contains('.consep-fav-card-highlighted p', activityName).should('be.visible');
});

When('I delete favourite card {string}', (activityName: string) => {
  cy.contains('.consep-fav-card p, .consep-fav-card-highlighted p', activityName)
    .closest('.consep-fav-card, .consep-fav-card-highlighted')
    .find('button.fav-card-overflow')
    .click();

  cy.get('.fav-card-menu-options, .' + prefix + '--overflow-menu-options')
    .contains('Delete shortcut')
    .click();

  cy.wait('@DELETE_favourite_activities');
  cy.wait('@GET_favourite_activities');
});

When('I select the first 12 favourite activities', () => {
  getFixtureRowNames().slice(0, 12).forEach((activityName) => {
    cy.contains(`.${prefix}--data-table tbody tr`, activityName).click();
  });
});

Then('unselected favourite activity checkboxes should be disabled', () => {
  cy.get('.favourite-activity-modal tbody input[type="checkbox"]:disabled')
    .should('have.length.greaterThan', 0);
});
