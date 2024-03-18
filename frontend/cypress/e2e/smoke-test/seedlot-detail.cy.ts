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
    //
  });

  it('renders Applicant and Seedlot Information section correctly', () => {
    //
  });
});
