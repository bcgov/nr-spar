import { NavigationLabels } from '../../utils/labels';
import { SeedlotRegFixtureType } from '../../definitions';
import { FIVE_SECONDS } from '../../constants';

describe('Seedlot Dashboard test', () => {
  let seedlotDashboardData: {
    secondSectionTitle: string,
    secondSectionSubtitle: string,
    emptySectionTitle: string,
    emptySectionSubtitle: string
  };
  let seedlotTableData: SeedlotRegFixtureType = {};
  let speciesKeys: Array<string> = [];

  beforeEach(() => {
    // Loading test data
    cy.fixture('seedlot-dashboard').then((fData) => {
      seedlotDashboardData = fData;
    });
    cy.fixture('aclass-seedlot').then((jsonData) => {
      seedlotTableData = jsonData;
      speciesKeys = Object.keys(jsonData);
    });

    cy.login();
    cy.visit('/seedlots');
    cy.url().should('contains', '/seedlots');
    // Wait for the page title to be visible before proceeding
    cy.get('.title-section h1')
      .should('have.text', NavigationLabels.Seedlots, { timeout: FIVE_SECONDS });
  });

  it('should display seedlot dashboard page title and subtitle', () => {
    cy.isPageTitle(NavigationLabels.Seedlots);
    cy.get('.recent-seedlots-title-section')
      .find('h2')
      .should('have.text', seedlotDashboardData.secondSectionTitle);
    cy.get('.recent-seedlots-title-section')
      .find('.recent-seedlots-subtitle')
      .should('have.text', seedlotDashboardData.secondSectionSubtitle);
  });

  it('all seedlot species should exist in the table', () => {
    Cypress._.times((speciesKeys.length - 1), (i) => {
      const { species } = seedlotTableData[speciesKeys[i]];

      cy.task('getData', species).then((sNumber) => {
        const seedlotNumber = sNumber as string;

        cy.get(`#seedlot-table-cell-${seedlotNumber}-seedlotSpecies`).should('have.text', species);
      });
    });
  });
});
