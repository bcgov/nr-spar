import {
  Given,
  Then,
  When,
  DataTable
} from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';
import { FavouriteActivitiesType } from '../../definitions';
import { FavouriteMockItem, mockFavouriteActivitiesApi } from '../mockApiConsep';
import { loadFixtureAndAlias } from '../helpers/fixture-loader';
import { getFavouriteCardLabel, runFavouriteCardMenuAction } from '../helpers/favourite-card';

let favouriteContent: FavouriteActivitiesType;

let favStore: FavouriteMockItem[] = [];
let nextId = 1;

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
    throw new Error(`Header is not in favourite-activities-content fixture: ${header}`);
  }

  const key = toActivityKey(header);

  if (!favStore.some((x) => x.activity === key) && favStore.length < 12) {
    favStore.push({ id: nextId, activity: key, highlighted: false });
    nextId += 1;
  }
};

Given('favourite activities API responses are mocked', () => {
  favStore = [];
  nextId = 1;

  mockFavouriteActivitiesApi({
    getFavStore: () => favStore,
    setFavStore: (items) => {
      favStore = items;
    },
    getNextId: () => nextId,
    setNextId: (id) => {
      nextId = id;
    }
  });
});

Given('the favourite activities content fixture is loaded', () => {
  loadFixtureAndAlias<FavouriteActivitiesType>('favourite-activities-content', 'favouriteContent', (data) => {
    favouriteContent = data;
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

When('I open the add favourite activity modal', () => {
  cy.contains('button.consep-fav-non-content-btn', favouriteContent.fa.favouriteActivitiesBtn).click();
  cy.get('[role="dialog"][aria-label="Add favourite activity"]').as('favouriteActivityModal');
});

When('I open the add favourite activity modal from the populated page', () => {
  cy.get('button.consep-add-fav-btn').click();
  cy.get('[role="dialog"][aria-label="Add favourite activity"]').as('favouriteActivityModal');
});

Then('I can see the favourite activity modal', () => {
  cy.get('@favouriteActivityModal').should('be.visible');
  cy.get('@favouriteActivityModal').contains('h2', 'Add favourite activity').should('be.visible');
});

When('I close the favourite activity modal', () => {
  cy.get('@favouriteActivityModal').contains('button', 'Cancel').click();
});

Then('I should not see the favourite activity modal', () => {
  cy.get('@favouriteActivityModal').should('not.be.visible');
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
  getFavouriteCardLabel(activityName).should('be.visible');
});

Then('favourite activity row {string} should not be selected', (activityName: string) => {
  cy.get('@favouriteActivityModal')
    .contains(`.${prefix}--data-table tbody tr`, activityName)
    .find('input[type="checkbox"]')
    .should('not.be.checked');
});

Then('I should not see favourite card {string}', (activityName: string) => {
  getFavouriteCardLabel(activityName).should('not.exist');
});

When('I highlight favourite card {string}', (activityName: string) => {
  runFavouriteCardMenuAction(activityName, 'Highlight shortcut', ['@PATCH_favourite_activities', '@GET_favourite_activities']);
});

Then('favourite card {string} should be highlighted', (activityName: string) => {
  cy.contains('.consep-fav-card-highlighted p', activityName).should('be.visible');
});

When('I delete favourite card {string}', (activityName: string) => {
  runFavouriteCardMenuAction(activityName, 'Delete shortcut', ['@DELETE_favourite_activities', '@GET_favourite_activities']);
});

When('I select the first 12 favourite activities', () => {
  cy.get('.bx--pagination__left')
    .scrollIntoView()
    .as('paginationLeft')
    .within(() => {
      cy.get('.bx--select-input').select('15');
    });

  cy.get('@paginationLeft')
    .contains('.bx--pagination__items-count', '1–15 of 48 items')
    .should('exist');

  getFixtureRowNames().slice(0, 12).forEach((activityName) => {
    cy.contains(`.${prefix}--data-table tbody tr`, activityName).click();
  });
});

Then('unselected favourite activity checkboxes should be disabled', () => {
  cy.get('.favourite-activity-modal tbody input[type="checkbox"]:disabled')
    .should('have.length.greaterThan', 0);
});
