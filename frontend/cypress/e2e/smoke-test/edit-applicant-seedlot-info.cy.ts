/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

describe('Applicant and seedlot information page', () => {
  it('should edit a seedlot applicant info', () => {
    // Login
    cy.login();
    // Go to seedlot detail
    cy.visit('/seedlots/details/63001');
    cy.url().should('contains', '/seedlots/details/63001');

    // Click on Edit applicant and seedlot button
    cy.get('.applicant-seedlot-information')
      .find('.section-btn')
      .should('have.text', 'Edit applicant')
      .click();

    // Verify it's at the edit-a-class-application/{seedlot_number} page
    cy.url().should('contains', '/seedlots/edit-a-class-application/63001');

    // Change some entries
    cy.get('#edit-seedlot-email')
      .clear()
      .type('test@gmail.com');

    cy.get('#seedlot-source-radio-btn-tpt').check('TPT', { force: true });

    cy.get('#register-w-tsc-no')
      .should('be.visible')
      .click({ force: true });

    cy.get('#collected-within-bc-no')
      .should('be.visible')
      .click({ force: true });

    // Intercept PATCH /api/seedlots/{seedlot_number}/application-info call
    cy.intercept(
      {
        method: 'PATCH',
        url: '**/api/seedlots/63001/application-info'
      },
      {
        statusCode: 200,
        fixture: 'applicant-info-change.json'
      }
    ).as('PATCH_applicant_info_change_63001');

    // Intercept GET /api/seedlots/{seedlot_number} call, to reflect updated data
    cy.intercept(
      {
        method: 'GET',
        url: '**/api/seedlots/63001'
      },
      {
        statusCode: 200,
        fixture: 'applicant-info-change.json'
      }
    ).as('GET_applicant_info_change_63001');

    // Save edit
    cy.get('.submit-button').click();

    // Verify it's redirected to seedlot detail
    cy.url().should('contains', '/seedlots/details/63001');

    // Verify the stuff you changed are being displayed
    cy.get('.applicant-seedlot-information')
      .find('button.email-display-value')
      .should('have.text', 'test@gmail.com');

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-source')
      .should('have.value', 'Tested Parent Trees');

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-to-be-registered')
      .should('have.value', 'No');

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-within-bc')
      .should('have.value', 'No');
  });
});
