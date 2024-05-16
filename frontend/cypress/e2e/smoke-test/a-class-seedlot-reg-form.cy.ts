import prefix from '../../../src/styles/classPrefix';

describe('My seedlots page', () => {
  let seedlotNum: string;

  beforeEach(() => {
    // Login
    cy.login();
    // Go to my seedlot page
    cy.visit('/seedlots/my-seedlots');
    cy.url().should('contains', '/seedlots/my-seedlots');

    cy.get('.my-seedlot-data-table-row').children(`.${prefix}--search`).find('input')
      .type('PLI');

    cy.get('table.seedlot-data-table tbody tr')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($seedlot) => {
        seedlotNum = $seedlot.text();
        cy.get(`#seedlot-table-cell-${seedlotNum}-seedlotSpecies`)
          .click();
      });
  });
});
