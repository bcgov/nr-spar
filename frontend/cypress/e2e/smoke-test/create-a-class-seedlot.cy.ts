import { SeedlotRegistrationSelectors } from '../../utils/selectors';
import { NavigationLabels, SeedlotActivities } from '../../utils/labels';
import { TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';

describe('Create A-Class Seedlot', () => {
  let data: {
    applicantAgency1: { name: string; number: string; email: string; invalidEmail: string; };
    seedlotInformation1: { species: string; };
    applicantAgency2: { name: string; number: string; email: string; invalidEmail: string; };
    seedlotInformation2: { species: string; };
    applicantAgency3: { name: string; number: string; email: string; invalidEmail: string; };
    seedlotInformation3: { species: string; };
    applicantAgency4: { name: string; number: string; email: string; invalidEmail: string; };
    seedlotInformation4: { species: string; };
    applicantAgency5: { name: string; number: string; email: string; invalidEmail: string; };
    seedlotInformation5: { species: string; };
  };

  beforeEach(() => {
    cy.fixture('aclass-seedlot').then((fData) => {
      data = fData;
    });

    cy.login();
    cy.visit('/seedlots');
    cy.url().should('contains', '/seedlots');
  });

  it('should register an A-Class Seedlot PLI', () => {
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
    cy.contains(`.${prefix}--list-box__menu-item__option`, data.applicantAgency1.name)
      .click();
    // Enter the applicant agency number
    cy.get('#agency-number-input')
      .clear()
      .type(data.applicantAgency1.number, { delay: TYPE_DELAY });
    // Enter an invalid email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency1.invalidEmail, { delay: TYPE_DELAY });
    cy.get('#agency-number-input')
      .click();
    cy.get('#applicant-email-input-error-msg')
      .should('be.visible');
    // Enter the applicant email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency1.email, { delay: TYPE_DELAY });
    // Enter the seedlot species, wait for species data to load
    cy.get('#seedlot-species-combobox')
      .click();
    cy.contains(`.${prefix}--list-box__menu-item__option`, data.seedlotInformation1.species)
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
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
      .click();
    cy.get('#seedlot-source-radio-btn-tpt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-upt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-cus')
      .should('be.checked');
    // Check checkbox behavior when Untested parent tree selected
    cy.get('#seedlot-source-radio-btn-upt')
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
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
  });

  it('should register an A-Class Seedlot CW', () => {
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
    cy.contains(`.${prefix}--list-box__menu-item__option`, data.applicantAgency2.name)
      .click();
    // Enter the applicant agency number
    cy.get('#agency-number-input')
      .clear()
      .type(data.applicantAgency2.number, { delay: TYPE_DELAY });
    // Enter an invalid email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency2.invalidEmail, { delay: TYPE_DELAY });
    cy.get('#agency-number-input')
      .click();
    cy.get('#applicant-email-input-error-msg')
      .should('be.visible');
    // Enter the applicant email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency2.email, { delay: TYPE_DELAY });
    // Enter the seedlot species, wait for species data to load
    cy.get('#seedlot-species-combobox')
      .click();
    cy.contains(`.${prefix}--list-box__menu-item__option`, data.seedlotInformation2.species)
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
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
      .click();
    cy.get('#seedlot-source-radio-btn-tpt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-upt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-cus')
      .should('be.checked');
    // Check checkbox behavior when Untested parent tree selected
    cy.get('#seedlot-source-radio-btn-upt')
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
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
  });

  it('should register an A-Class Seedlot DR', () => {
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
    cy.contains(`.${prefix}--list-box__menu-item__option`, data.applicantAgency3.name)
      .click();
    // Enter the applicant agency number
    cy.get('#agency-number-input')
      .clear()
      .type(data.applicantAgency3.number, { delay: TYPE_DELAY });
    // Enter an invalid email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency3.invalidEmail, { delay: TYPE_DELAY });
    cy.get('#agency-number-input')
      .click();
    cy.get('#applicant-email-input-error-msg')
      .should('be.visible');
    // Enter the applicant email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency3.email, { delay: TYPE_DELAY });
    // Enter the seedlot species, wait for species data to load
    cy.get('#seedlot-species-combobox')
      .click();
    cy.contains(`.${prefix}--list-box__menu-item__option`, data.seedlotInformation3.species)
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
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
      .click();
    cy.get('#seedlot-source-radio-btn-tpt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-upt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-cus')
      .should('be.checked');
    // Check checkbox behavior when Untested parent tree selected
    cy.get('#seedlot-source-radio-btn-upt')
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
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
  });

  it('should register an A-Class Seedlot EP', () => {
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
    cy.contains(`.${prefix}--list-box__menu-item__option`, data.applicantAgency4.name)
      .click();
    // Enter the applicant agency number
    cy.get('#agency-number-input')
      .clear()
      .type(data.applicantAgency4.number, { delay: TYPE_DELAY });
    // Enter an invalid email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency4.invalidEmail, { delay: TYPE_DELAY });
    cy.get('#agency-number-input')
      .click();
    cy.get('#applicant-email-input-error-msg')
      .should('be.visible');
    // Enter the applicant email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency4.email, { delay: TYPE_DELAY });
    // Enter the seedlot species, wait for species data to load
    cy.get('#seedlot-species-combobox')
      .click();
    cy.contains(`.${prefix}--list-box__menu-item__option`, data.seedlotInformation4.species)
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
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
      .click();
    cy.get('#seedlot-source-radio-btn-tpt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-upt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-cus')
      .should('be.checked');
    // Check checkbox behavior when Untested parent tree selected
    cy.get('#seedlot-source-radio-btn-upt')
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
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
  });

  it('should register an A-Class Seedlot FDC', () => {
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
    cy.contains(`.${prefix}--list-box__menu-item__option`, data.applicantAgency5.name)
      .click();
    // Enter the applicant agency number
    cy.get('#agency-number-input')
      .clear()
      .type(data.applicantAgency5.number, { delay: TYPE_DELAY });
    // Enter an invalid email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency5.invalidEmail, { delay: TYPE_DELAY });
    cy.get('#agency-number-input')
      .click();
    cy.get('#applicant-email-input-error-msg')
      .should('be.visible');
    // Enter the applicant email address
    cy.get('#applicant-email-input')
      .clear()
      .type(data.applicantAgency5.email, { delay: TYPE_DELAY });
    // Enter the seedlot species, wait for species data to load
    cy.get('#seedlot-species-combobox')
      .click();
    cy.contains(`.${prefix}--list-box__menu-item__option`, data.seedlotInformation5.species)
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
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
      .click();
    cy.get('#seedlot-source-radio-btn-tpt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-upt')
      .should('not.be.checked');
    cy.get('#seedlot-source-radio-btn-cus')
      .should('be.checked');
    // Check checkbox behavior when Untested parent tree selected
    cy.get('#seedlot-source-radio-btn-upt')
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
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
  });
});
