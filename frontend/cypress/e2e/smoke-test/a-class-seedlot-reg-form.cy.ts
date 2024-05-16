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
        cy.url().should('contains', `/seedlots/details/${seedlotNum}`);
      });
  });

  it('has edit seedlot form button', () => {
    cy.get('.detail-section-grid')
      .find(`.${prefix}--col`)
      .children('button.section-btn')
      .should('have.text', 'Edit seedlot form');
  });

  it('edit seedlot form button should display page details correctly', () => {
    cy.get('.detail-section-grid')
      .find(`.${prefix}--col`)
      .children('button.section-btn')
      .click();
    cy.url().should('contains', `seedlots/a-class-registration/${seedlotNum}`);

    cy.get('.seedlot-registration-title')
      .find('h1')
      .should('have.text', 'Seedlot Registration');

    cy.get('.seedlot-registration-title')
      .find('.seedlot-form-subtitle')
      .should('contain.text', 'Seedlot 63011');
  });
});
