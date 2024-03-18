/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

describe('Applicant and seedlot information page', () => {
  it('should edit a seedlot applicant info', () => {
    // Login
    cy.login();
    // Go to seedlot detail
    cy.visit('/seedlots/details/63001');
    cy.url().should('contains', '/seedlots/details/63001');

    // TODO: Click on Edit applicant and seedlot button

    // TODO: Verify it's at the edit-a-class-application/{seedlot_number} page

    // TODO: Verify if information are displayed correctly

    // TODO: Change some entries

    // TODO: Intercept PATCH /api/seedlots/{seedlot_number}/application-info call

    // TODO: Intercept GET /api/seedlots/{seedlot_number} call, to reflect updated data

    // TODO: Save edit

    // TODO: Verify it's redirected to seedlot detail

    // TODO: Verify the stuff you changed are being displayed
  });
});
