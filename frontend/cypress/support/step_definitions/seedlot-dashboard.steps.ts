import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { SeedlotRegFixtureType } from '../../definitions';

When('I visit the seedlot dashboard page', () => {
  cy.visit('/seedlots');
});

Then('I can see the title {string}', (title: string) => {
  cy.isPageTitle(title);
});

Then('I can see the section title {string}', (title: string) => {
  cy.get('.recent-seedlots-title-section')
    .find('h2')
    .should('have.text', title);
});

Then('I can see the section subtitle {string}', (subtitle: string) => {
  cy.get('.recent-seedlots-title-section')
    .find('.recent-seedlots-subtitle')
    .should('have.text', subtitle);
});

When('I view the seedlot species table', () => {
  cy.get('.recent-seedlots-table').should('be.visible');
});

Then('all seedlot species should exist in the seedlot table', () => {
  cy.get('@aClassSeedlotData').then((fixtureData: any) => {
    const tableData: SeedlotRegFixtureType = fixtureData;
    const keys = Object.keys(tableData).filter((k) => k !== 'fdi');

    Cypress._.times(keys.length, (i) => {
      const { species } = tableData[keys[i]];

      cy.task('getData', species).then((sNumber) => {
        const seedlotNumber = sNumber as string;

        cy.get(`#seedlot-table-cell-${seedlotNumber}-seedlotSpecies`)
          .should('have.text', species);
      });
    });
  });
});
