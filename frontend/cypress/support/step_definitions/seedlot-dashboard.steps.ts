import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { NavigationLabels } from '../../utils/labels';
import { SeedlotDashboardDataType, SeedlotRegFixtureType } from '../../definitions';

let seedlotDashboardData: SeedlotDashboardDataType;

Given('the seedlot dashboard fixture is loaded', () => {
  cy.fixture('seedlot-dashboard').then((fData) => {
    seedlotDashboardData = fData;
  });
});

When('I visit the seedlot dashboard page', () => {
  cy.visit('/seedlots');
});

Then('the seedlot dashboard page should display the correct title and subtitle', () => {
  cy.isPageTitle(NavigationLabels.Seedlots);

  cy.get('.recent-seedlots-title-section')
    .find('h2')
    .should('have.text', seedlotDashboardData.secondSectionTitle);

  cy.get('.recent-seedlots-title-section')
    .find('.recent-seedlots-subtitle')
    .should('have.text', seedlotDashboardData.secondSectionSubtitle);
});

let seedlotTableData: SeedlotRegFixtureType = {};
let speciesKeys: string[] = [];

Given('the a-class seedlot fixture is loaded', () => {
  cy.fixture('aclass-seedlot').then((jsonData: SeedlotRegFixtureType) => {
    seedlotTableData = jsonData;
    speciesKeys = Object.keys(jsonData);
  });
});

Then('all seedlot species should exist in the seedlot table', () => {
  Cypress._.times(speciesKeys.length - 1, (i) => {
    const { species } = seedlotTableData[speciesKeys[i]];
    cy.task('getData', species).then((sNumber) => {
      const seedlotNumber = sNumber as string;
      cy.get(`#seedlot-table-cell-${seedlotNumber}-seedlotSpecies`).should('have.text', species);
    });
  });
});
