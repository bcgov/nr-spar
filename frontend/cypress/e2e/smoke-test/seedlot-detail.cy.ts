/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

describe('Seedlot detail page', () => {
  beforeEach(function () {
    cy.login();
    cy.visit('/seedlots/details/63001');
    cy.url().should('contains', '/seedlots/details/63001');
  });

  /**
   * Seedlot Dashboard page should load correctly.
   */
  it('should render seedlot detail correctly', () => {
    cy.get('.title-favourite')
      .should('have.text', 'Seedlot 63001');

    cy.get('.detail-section-grid')
      .children('.bx--row')
      .children('.bx--col')
      .find('button.section-btn')
      .should('have.text', 'Edit seedlot form')
      .click();

    cy.url().should('contains', '/seedlots/a-class-registration/63001');
  });

  it('renders Seedlot Summary section correctly', () => {
    cy.get('.seedlot-summary-title')
      .should('have.text', 'Seedlot summary');

    cy.contains('p.seedlot-summary-info-label', 'Seedlot number')
      .siblings('p.seedlot-summary-info-value')
      .should('have.text', '63001');

    cy.contains('p.seedlot-summary-info-label', 'Seedlot class')
      .siblings('p.seedlot-summary-info-value')
      .should('have.text', 'A-class');

    cy.contains('p.seedlot-summary-info-label', 'Seedlot species')
      .siblings('p.seedlot-summary-info-value')
      .should('have.text', 'CW - Western redcedar');

    cy.contains('p.seedlot-summary-info-label', 'Status')
      .next()
      .children('span')
      .should('have.text', 'Pending');

    cy.contains('p.seedlot-summary-info-label', 'Created at')
      .siblings('p.seedlot-summary-info-value')
      .should('have.text', 'Mar 18, 2024');

    cy.contains('p.seedlot-summary-info-label', 'Last updated')
      .siblings('p.seedlot-summary-info-value')
      .should('have.text', 'Mar 18, 2024');

    cy.contains('p.seedlot-summary-info-label', 'Approved at')
      .siblings('p.seedlot-summary-info-value')
      .should('have.text', '--');

    cy.get('.combo-button-container')
      .find('.combo-button')
      .should('have.text', 'Edit seedlot form')
      .click();

    cy.url().should('contains', '/seedlots/a-class-registration/63001');
  });

  it('renders Applicant and Seedlot Information section correctly', () => {
    cy.get('.applicant-seedlot-information-title')
      .should('have.text', 'Check your applicant and seedlot information');
  });
});
