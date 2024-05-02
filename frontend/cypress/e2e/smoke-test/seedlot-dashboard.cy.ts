import { NavigationLabels } from '../../utils/labels';
import { SeedlotRegFixtureType } from '../../definitions';

describe('Seedlot Dashboard test', () => {
  let seedlotDashboardData: {
    subtitle: string,
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
  });

  it('should display seedlot dashboard page title and subtitle', () => {
    cy.isPageTitle(NavigationLabels.Seedlots);
    cy.get('.title-section')
      .find('.subtitle-section')
      .should('have.text', seedlotDashboardData.subtitle);
    cy.get('.recent-seedlots-title')
      .find('h2')
      .should('have.text', seedlotDashboardData.secondSectionTitle);
    cy.get('.recent-seedlots-title')
      .find('.recent-seedlots-subtitle')
      .should('have.text', seedlotDashboardData.secondSectionSubtitle);
  });

  it('all seedlot species should exist in the table', () => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < speciesKeys.length; i++) {
      // eslint-disable-next-line prefer-destructuring
      const species = seedlotTableData[speciesKeys[i]].species;

      cy.task('getData', species).then((sNumber) => {
        const seedlotNumber = sNumber as string;

        cy.get(`#seedlot-table-cell-${seedlotNumber}-seedlotSpecies`).should('have.text', species);
        cy.get(`#seedlot-table-cell-${seedlotNumber}-seedlotStatus`).should('have.text', 'Pending');
      });
    }
  });
});
