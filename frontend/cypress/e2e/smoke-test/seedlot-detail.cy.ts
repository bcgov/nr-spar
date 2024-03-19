/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

describe('Seedlot detail page', () => {
  beforeEach(function () {
    cy.login();
    cy.visit('/seedlots/details/63001');
    cy.url().should('contains', '/seedlots/details/63001');
  });

  /**
   * Dashboard page should load correctly.
   */
  it('should render seedlot detail correctly', () => {
    cy.get('.title-favourite')
      .should('have.text', 'Seedlot 63001');
  });

  it('renders Seedlot Summary section correctly', () => {
    cy.get('.seedlot-summary-title')
      .should('have.text', 'Seedlot summary');
  });

  it('renders Applicant and Seedlot Information section correctly', () => {
    cy.get('.applicant-seedlot-information-title')
      .should('have.text', 'Check your applicant and seedlot information');

    cy.get('.applicant-seedlot-information')
      .find('.btn-edit')
      .should('have.text', 'Edit applicant and seedlot')
      .click();
  });
});
