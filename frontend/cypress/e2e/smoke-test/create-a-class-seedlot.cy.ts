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

// Code commented below is to create a test in the future
// @ArthurEncr please separate these in another test function
//   // Click on Complete registration
//   cy.contains('button', 'Complete registration')
//     .click();
//   // Collection step
//   // Uncheck Use applicant agency as collector agency
//   cy.get('#applicant')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#applicant')
//     .should('not.be.checked');
//   cy.get('#collectorAgency')
//     .clear()
//     .should('be.empty');
//   cy.get('#locationCode')
//     .clear()
//     .should('be.empty');
//   // Select Collection agency
//   cy.get('#collectorAgency')
//     .clear();
//   cy.get('.bx--list-box__menu-item__option')
//     .contains(data.collection.agency)
//     .click();
//   // Input Collection location code
//   cy.get('#locationCode')
//     .type(data.collection.locationCode, { delay: 50 });
//   cy.get('#collectorAgency')
//     .should('have.value', data.collection.agency);
//   cy.get('#locationCode')
//     .should('have.value', data.collection.locationCode);
//   cy.get('#applicant')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#applicant')
//     .should('be.checked');
//   cy.get('#collectorAgency')
//     .should('not.have.value', data.collection.agency);
//   cy.get('#locationCode')
//     .should('not.have.value', data.collection.locationCode);
//   // Checking dates inputs
//   // Insert start date
//   cy.get('#startDate')
//     .type(data.collection.startDate, { delay: 50 });
//   // Insert end date before start date
//   cy.get('#endDate')
//     .type(data.collection.invalidEndDate, { delay: 50 })
//     .blur();
//   cy.get('#endDate')
//     .should('have.value', '');
//   // Insert end date
//   cy.get('#endDate')
//     .type(data.collection.endDate, { delay: 50 });
//   // Checking Containers and Cones inputs
//   cy.get('#numberOfContainers')
//     .clear()
//     .type(data.collection.numberOfContainers, { delay: 50 });
//   cy.get('#volumeOfCones')
//     .should('have.value', data.collection.numberOfContainers);
//   cy.get('#volumePerContainers')
//     .clear()
//     .type(data.collection.volumePerContainers, { delay: 50 });
//   cy.get('#volumeOfCones')
//     .should('have.value', data.collection.volumeOfCones);
//   cy.get('#volumeOfCones')
//     .clear();
//   cy.get('#volumeOfCones-error-msg')
//     .should('be.visible');
//   cy.get('#volumeOfCones')
//     .type(data.collection.nonMatchVolumeOfCones, { delay: 50 });
//   cy.get('#volumeOfCones-warn-msg')
//     .should('be.visible');
//   // Validating Collection Methods
//   cy.get('.collection-methods .bx--checkbox')
//     .as('collectionMethods');
//   cy.get('@collectionMethods')
//     .each((checkbox) => expect(checkbox).to.not.be.checked);
//   cy.get('@collectionMethods')
//     .each((checkbox) => {
//       cy.wrap(checkbox)
//         .siblings('.bx--checkbox-label')
//         .click();
//     });
//   cy.get('@collectionMethods')
//     .each((checkbox) => expect(checkbox).to.be.checked);
//   cy.get('@collectionMethods')
//     .each((checkbox) => {
//       cy.wrap(checkbox)
//         .siblings('.bx--checkbox-label')
//         .click();
//     });
//   cy.get('@collectionMethods')
//     .first()
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('@collectionMethods')
//     .first()
//     .should('be.checked');
//   cy.get('[name="comments"]')
//     .clear()
//     .type(data.collection.comments, { delay: 50 });
//   cy.get('[name="comments"')
//     .should('have.value', data.collection.comments);
//   // Click on Next button to go to Ownership step
//   cy.contains('button', 'Next')
//     .click();
//   // Uncheck Use applicant agency as owner agency
//   cy.get('#default-agency-code-checkbox')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#default-agency-code-checkbox')
//     .should('not.be.checked');
//   cy.get('#owner-agency-0')
//     .should('be.empty');
//   cy.get('#single-owner-code-0')
//     .should('be.empty');
//   // Select Owner agency
//   cy.get('#owner-agency-0')
//     .siblings('[title=Open]')
//     .click();
//   cy.get('.bx--list-box__menu-item__option')
//     .contains(data.ownership.agency)
//     .click();
//   // Input Owner location code
//   cy.get('#single-owner-code-0')
//     .type(data.ownership.locationCode, { delay: 50 });
//   // Input Owner portion
//   cy.get('#single-owner-portion-0')
//     .clear()
//     .type(data.ownership.ownerPortion, { delay: 50 });
//   cy.get('#single-owner-portion-0-error-msg')
//     .should('be.visible');
//   // Input Reserved (%)
//   cy.get('#single-owner-reserved-0')
//     .clear()
//     .type(data.ownership.reserved, { delay: 50 });
//   // Validate Surplus (%)
//   cy.get('#single-owner-surplus-0')
//     .should('have.value', data.ownership.surplus);
//   // Select Funding source
//   // cy.get('#owner-funding-source-0')
//   //   .click();
//   // cy.get('.bx--list-box__menu')
//   //   .eq(1)
//   //   .contains(data.ownership.fundingSource)
//   //   .click();
//   // Check default Method of payment
//   cy.get('#owner-method-of-payment-0')
//     .should('have.value', data.ownership.methodPayment);
//   // Click on button Add owner
//   cy.contains('button', 'Add owner')
//     .click();
//   // Select Owner agency on second owner
//   cy.get('#owner-agency-1')
//     .siblings('[title=Open]')
//     .click();
//   cy.get('.bx--list-box__menu-item__option')
//     .contains(data.secondOwnership.agency)
//     .click();
//   // Input Owner location code on second owner
//   cy.get('#single-owner-code-1')
//     .type(data.secondOwnership.locationCode, { delay: 50 });
//   // Input Owner portion on second owner
//   cy.get('#single-owner-portion-1')
//     .clear()
//     .type(data.secondOwnership.ownerPortion, { delay: 50 });
//   // Input Reserved (%) on second owner
//   cy.get('#single-owner-reserved-1')
//     .clear()
//     .type(data.secondOwnership.reserved, { delay: 50 });
//   // Validate Surplus (%) on second owner
//   cy.get('#single-owner-surplus-1')
//     .should('have.value', data.secondOwnership.surplus);
//   // Select Funding source on second owner
//   // cy.get('#owner-funding-source-1')
//   //   .click();
//   // cy.get('.bx--list-box__menu')
//   //   .eq(4)
//   //   .contains(data.secondOwnership.fundingSource)
//   //   .click();
//   // Check default Method of payment on second owner
//   cy.get('#owner-method-of-payment-1')
//     .should('have.value', data.secondOwnership.methodPayment);
//   // Click on Next button to go to Interim Storage step
//   cy.contains('button', 'Next')
//     .click();
//   // Uncheck Use applicant agency as collector agency
//   cy.get('#collector-agency-checkbox')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#collector-agency-checkbox')
//     .should('not.be.checked');
//   cy.get('#agency-name-combobox')
//     .siblings('.bx--list-box__selection')
//     .click();
//   cy.get('#agency-name-combobox')
//     .should('be.empty');
//   cy.get('#agency-number-input')
//     .clear()
//     .should('be.empty');
//   // Check Use applicant agency as collector agency
//   cy.get('#collector-agency-checkbox')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#collector-agency-checkbox')
//     .should('be.checked');
//   cy.get('#agency-name-combobox')
//     .should('have.value', data.interimAgency.agency);
//   cy.get('#agency-number-input')
//     .should('have.value', data.interimAgency.locationCode);
//   // Insert start date
//   cy.get('#start-date-input')
//     .clear()
//     .type(data.interimAgency.startDate, { delay: 50 });
//   // Insert end date before start date
//   cy.get('#end-date-input')
//     .clear()
//     .type(data.interimAgency.invalidEndDate, { delay: 50 });
//   cy.get('#storage-location-input')
//     .click();
//   cy.get('#end-date-input')
//     .should('have.value', '');
//   // Insert end date
//   cy.get('#end-date-input')
//     .clear()
//     .type(data.interimAgency.endDate, { delay: 50 });
//   // Insert an invalid value size on storage location
//   cy.get('#storage-location-input')
//     .clear()
//     .type(data.interimAgency.invalidStorageLocation, { delay: 50 });
//   cy.get('#storage-location-input-error-msg')
//     .should('be.visible');
//   // Insert a valid value on storage location
//   cy.get('#storage-location-input')
//     .clear()
//     .type(data.interimAgency.storagelocation, { delay: 50 });
//   // Check checkbox behavior when Outside covered - OCV selected
//   cy.get('#outside-radio')
//     .should('be.checked');
//   cy.get('#ventilated-radio')
//     .should('not.be.checked');
//   cy.get('#reefer-radio')
//     .should('not.be.checked');
//   cy.get('#other-radio')
//     .should('not.be.checked');
//   cy.get('#storage-facility-type-input')
//     .should('not.exist');
//   // Check checkbox behavior when Ventilated room - VRM selected
//   cy.get('#ventilated-radio')
//     .siblings('.bx--radio-button__label')
//     .find('.bx--radio-button__appearance')
//     .click();
//   cy.get('#outside-radio')
//     .should('not.be.checked');
//   cy.get('#ventilated-radio')
//     .should('be.checked');
//   cy.get('#reefer-radio')
//     .should('not.be.checked');
//   cy.get('#other-radio')
//     .should('not.be.checked');
//   cy.get('#storage-facility-type-input')
//     .should('not.exist');
//   // Check checkbox behavior when Reefer - RFR selected
//   cy.get('#reefer-radio')
//     .siblings('.bx--radio-button__label')
//     .find('.bx--radio-button__appearance')
//     .click();
//   cy.get('#outside-radio')
//     .should('not.be.checked');
//   cy.get('#ventilated-radio')
//     .should('not.be.checked');
//   cy.get('#reefer-radio')
//     .should('be.checked');
//   cy.get('#other-radio')
//     .should('not.be.checked');
//   cy.get('#storage-facility-type-input')
//     .should('not.exist');
//   // Check checkbox behavior when Other - OTH selected
//   cy.get('#other-radio')
//     .siblings('.bx--radio-button__label')
//     .find('.bx--radio-button__appearance')
//     .click();
//   cy.get('#outside-radio')
//     .should('not.be.checked');
//   cy.get('#ventilated-radio')
//     .should('not.be.checked');
//   cy.get('#reefer-radio')
//     .should('not.be.checked');
//   cy.get('#other-radio')
//     .should('be.checked');
//   cy.get('#storage-facility-type-input')
//     .should('be.visible');
//   // Select Outside covered - OCV checkbox option
//   cy.get('#outside-radio')
//     .siblings('.bx--radio-button__label')
//     .find('.bx--radio-button__appearance')
//     .click();
//   // Click on Next button to go to Orchard step
//   cy.contains('button', 'Next')
//     .click();
//   // Insert Orchard ID number
//   cy.get('#seedlot-orchard-number-input')
//     .clear()
//     .type(data.orchard.number, { delay: 50 });
//   // cy.get('#seedlot-orchard-name-input')
//   //   .click();
//   // eslint-disable-next-line cypress/no-unnecessary-waiting
//   // cy.wait(1000);
//   // Validate if Orchard name is correct
//   // cy.get('#seedlot-orchard-name-input')
//   //   .should('have.value', data.orchard.name);
//   // Validate if Seedlot species is correct
//   // cy.get('#seedlot-species-dropdown')
//   //   .find('.bx--list-box__label')
//   //   .should('have.text', data.seedlotInformation.species);
//   // Select Female gametic contribution methodology
//   cy.get('#female-gametic-combobox')
//     .click();
//   cy.get('.bx--list-box__menu')
//     .eq(1)
//     .contains(data.orchard.contributionMethodology)
//     .click();
//   // Check checkbox behavior with default value
//   cy.get('#m1-radio')
//     .should('not.be.checked');
//   cy.get('#m2-radio')
//     .should('not.be.checked');
//   cy.get('#m3-radio')
//     .should('not.be.checked');
//   cy.get('#m4-radio')
//     .should('not.be.checked');
//   cy.get('#m5-radio')
//     .should('not.be.checked');
//   // Check M2 - Pollen volume estimate by partial survey option
//   cy.get('#m2-radio')
//     .siblings('.bx--radio-button__label')
//     .find('.bx--radio-button__appearance')
//     .click();
//   cy.get('#m2-radio')
//     .should('be.checked');
//   // Check default value to Was the seedlot produced through controlled crosses?
//   cy.get('#seedlot-produced')
//     .should('be.checked');
//   // Uncheck and check to validate behavior
//   cy.get('#seedlot-produced')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#seedlot-produced')
//     .should('not.be.checked');
//   cy.get('#seedlot-produced')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#seedlot-produced')
//     .should('be.checked');
// //Check default value to Have biotechnological processes been used to produce this seedlot?
//   cy.get('#bio-processes')
//     .should('be.checked');
//   // Uncheck and check to validate behavior
//   cy.get('#bio-processes')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#bio-processes')
//     .should('not.be.checked');
//   cy.get('#bio-processes')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#bio-processes')
//     .should('be.checked');
//   // Check default value to Was pollen contamination present?
//   cy.get('#pollen-contamination')
//     .should('be.checked');
//   cy.get('#pollen-percentage-number-input')
//     .should('not.be.visible');
//   // Uncheck and check to validate behavior
//   cy.get('#pollen-contamination')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#pollen-contamination')
//     .should('not.be.checked');
//   cy.get('#pollen-percentage-number-input')
//     .should('be.visible');
//   cy.get('#pollen-contamination')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#pollen-contamination')
//     .should('be.checked');
//   cy.get('#pollen-percentage-number-input')
//     .should('not.be.visible');
//   // Click on Next button to go to Parent tree and SMP step
//   cy.contains('button', 'Next')
//     .click();
//   // Click on Next button to go to Extraction and storage step
//   cy.contains('button', 'Next')
//     .click();
//   // Validating Extraction and storage step
//   cy.get('#extractory-agency-tsc-checkbox')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#extractory-agency-tsc-checkbox')
//     .should('not.be.checked');
//   cy.get('#extractory-agency-combobox')
//     .clear()
//     .should('be.empty');
//   cy.get('#extractory-agency-location-code-input')
//     .clear()
//     .should('be.empty');
//   // Select extractory agency
//   cy.get('#extractory-agency-combobox')
//     .clear();
//   cy.get('.bx--list-box__menu-item__option')
//     .contains(data.extractionStorage.extractoryAgency)
//     .click();
//   // Input extractory location code
//   cy.get('#extractory-agency-location-code-input')
//     .type(data.extractionStorage.extractoryLocationCode, { delay: 50 });
//   cy.get('#extractory-agency-combobox')
//     .should('have.value', data.extractionStorage.extractoryAgency);
//   cy.get('#extractory-agency-location-code-input')
//     .should('have.value', data.extractionStorage.extractoryLocationCode);
//   cy.get('#extractory-agency-tsc-checkbox')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#extractory-agency-tsc-checkbox')
//     .should('be.checked');
//   cy.get('#extractory-agency-combobox')
//     .should('not.have.value', data.extractionStorage.extractoryAgency);
//   cy.get('#extractory-agency-location-code-input')
//     .should('not.have.value', data.extractionStorage.extractoryLocationCode);
//   cy.get('#extractory-agency-tsc-checkbox')
//     .siblings('.bx--checkbox-label')
//     .click();
//   // Checking dates inputs
//   // Insert start date
//   cy.get('#extraction-start-date-input')
//     .type(data.extractionStorage.startDate, { delay: 50 });
//   // Insert end date before start date
//   cy.get('#extraction-end-date-input')
//     .type(data.extractionStorage.invalidEndDate, { delay: 50 })
//     .blur();
//   cy.get('#extraction-end-date-input')
//     .click()
//     .focus()
//     .blur();
//   cy.get('#extraction-end-date-input')
//     .parent()
//     .siblings('.bx--form-requirement')
//     .should('be.visible');
//   // Insert end date
//   cy.get('#extraction-end-date-input')
//     .clear()
//     .type(data.extractionStorage.endDate, { delay: 50 })
//     .blur();
//   cy.get('#extraction-end-date-input')
//     .click()
//     .focus()
//     .blur();
//   cy.get('#extraction-end-date-input')
//     .parent()
//     .siblings('.bx--form-requirement')
//     .should('not.exist');
//   // Uncheck Use applicant agency as storage agency
//   cy.get('#seed-storage-agency-tsc-checkbox')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#seed-storage-agency-tsc-checkbox')
//     .should('not.be.checked');
//   cy.get('#seed-storage-agency-combobox')
//     .clear()
//     .should('be.empty');
//   cy.get('#seed-storage-location-code-input')
//     .clear()
//     .should('be.empty');
//   // Select storage agency
//   cy.get('#seed-storage-agency-combobox')
//     .clear();
//   cy.get('.bx--list-box__menu-item__option')
//     .contains(data.extractionStorage.storageAgency)
//     .click();
//   // Input storage location code
//   cy.get('#seed-storage-location-code-input')
//     .type(data.extractionStorage.storageLocationCode, { delay: 50 });
//   cy.get('#seed-storage-agency-combobox')
//     .should('have.value', data.extractionStorage.storageAgency);
//   cy.get('#seed-storage-location-code-input')
//     .should('have.value', data.extractionStorage.storageLocationCode);
//   cy.get('#seed-storage-agency-tsc-checkbox')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('#seed-storage-agency-tsc-checkbox')
//     .should('be.checked');
//   cy.get('#seed-storage-agency-combobox')
//     .should('not.have.value', data.extractionStorage.storageAgency);
//   cy.get('#seed-storage-location-code-input')
//     .should('not.have.value', data.extractionStorage.storageLocationCode);
//   cy.get('#seed-storage-agency-tsc-checkbox')
//     .siblings('.bx--checkbox-label')
//     .click();
//   // Checking dates inputs
//   // Insert start date
//   cy.get('#storage-start-date-input')
//     .type(data.extractionStorage.startDate, { delay: 50 });
//   // Insert end date before start date
//   cy.get('#storage-end-date-input')
//     .type(data.extractionStorage.invalidEndDate, { delay: 50 })
//     .blur();
//   cy.get('#storage-end-date-input')
//     .click()
//     .focus()
//     .blur();
//   cy.get('#storage-end-date-input')
//     .parent()
//     .siblings('.bx--form-requirement')
//     .should('be.visible');
//   // Insert end date
//   cy.get('#storage-end-date-input')
//     .clear()
//     .type(data.extractionStorage.endDate, { delay: 50 })
//     .blur();
//   cy.get('#storage-end-date-input')
//     .click()
//     .focus()
//     .blur();
//   cy.get('#storage-end-date-input')
//     .parent()
//     .siblings('.bx--form-requirement')
//     .should('not.exist');
//   // Click on Submit registration button to submit form
//   cy.contains('button', 'Submit registration')
//     .click();
//   cy.get('#declaration-modal-checkbox')
//     .siblings('.bx--checkbox-label')
//     .click();
//   cy.get('.seedlot-registration-modal')
//     .contains('button', 'Submit seedlot')
//     .click();
