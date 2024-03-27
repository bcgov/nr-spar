import { SeedlotRegistrationSelectors } from '../../utils/selectors';
import { NavigationLabels, SeedlotActivities } from '../../utils/labels';
import { TYPE_DELAY } from '../../constants';

describe('Create A-Class Seedlot', () => {
  let data: {
    applicantAgency: { name: string; number: string; email: string; invalidEmail: string; };
    seedlotInformation: { species: string; };
  };

  before(() => {
    cy.fixture('aclass-seedlot').then((fData) => {
      data = fData;
    });

    cy.login();
    cy.visit('/seedlots');
    cy.url().should('contains', '/seedlots');
  });

  it('should register an A-Class Seedlot', () => {
    cy.isPageTitle(NavigationLabels.Seedlots);
    // Select the “Seedlots” section from the left-hand panel
    // Click on the register seedlot an A-class seedlot card
    cy.get(SeedlotRegistrationSelectors.SeedlotActivitiesCardTitle)
      .contains(SeedlotActivities.RegisterAClass)
      .click();
    cy.url().should('contains', '/register-a-class');
    // To do - validate after to be fixed
    // Enter the applicant agency name
    cy.get('#applicant-info-combobox')
      .click();
    cy.contains('.bx--list-box__menu-item__option', data.applicantAgency.name)
      .click();
    // Enter the applicant agency number
    cy.get('#agency-number-input')
      .clear()
      .type(data.applicantAgency.number, { delay: TYPE_DELAY });
    // Enter an invalid email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency.invalidEmail, { delay: TYPE_DELAY });
    cy.get('#agency-number-input')
      .click();
    cy.get('#applicant-email-input-error-msg')
      .should('be.visible');
    // Enter the applicant email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency.email, { delay: TYPE_DELAY });
    // Enter the seedlot species, wait for species data to load
    cy.get('#seedlot-species-combobox')
      .click();
    cy.contains('.bx--list-box__menu-item__option', data.seedlotInformation.species)
      .scrollIntoView()
      .click();
    // Check checkbox behavior when Tested parent tree selected
    cy.get('#seedlot-source-radio-btn-tpt')
      .should('be.checked');
    cy.get('#seedlot-source-radio-btn-upt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-cus')
      .should('not.be.checked');
    // Check checkbox behavior when Custom seedlot selected
    cy.get('#seedlot-source-radio-btn-cus')
      .siblings('.bx--radio-button__label')
      .find('.bx--radio-button__appearance')
      .click();
    cy.get('#seedlot-source-radio-btn-tpt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-upt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-cus')
      .should('be.checked');
    // Check checkbox behavior when Untested parent tree selected
    cy.get('#seedlot-source-radio-btn-upt')
      .siblings('.bx--radio-button__label')
      .find('.bx--radio-button__appearance')
      .click();
    cy.get('#seedlot-source-radio-btn-tpt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-upt')
      .should('be.checked');
    cy.get('#seedlot-source-radio-btn-cus')
      .should('not.be.checked');
    // To be registered? should be checked by default
    cy.get('#register-w-tsc-yes')
      .should('be.checked');
    // Collected within bc? "Yes" should be checked by default
    cy.get('#collected-within-bc-yes')
      .should('be.checked');
    // Click on button Create seedlot number
    cy.get('.submit-button')
      .click();
    cy.url().should('contains', '/creation-success');
    cy.get('h1').contains('654321');
  });
});
