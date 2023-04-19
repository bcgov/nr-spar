describe('Seedlot registration flow', () => {
  let data: {
    applicantAgency: { name: string; number: string; email: string; invalidEmail: string;};
    seedlotInformation: { species: string; };
    ownership: {
      agency: string;
      locationCode: string;
      ownerPortion: string,
      reserved: string,
      surplus: string,
      fundingSource: string;
      methodPayment: string;
    };
    secondOwnership: {
      agency: string;
      locationCode: string;
      ownerPortion: string,
      reserved: string,
      surplus: string,
      fundingSource: string;
      methodPayment: string;
    };
    interimAgency: {
      agency: string,
      locationCode: string,
      startDate: string,
      endDate: string,
      invalidEndDate: string,
      invalidStorageLocation: string,
      storagelocation: string,
      methodPayment: string
    }
    orchard: { number: string; name: string; contributionMethodology: string; }
  };

  before(() => {
    cy.visit('/');
    cy.wait(2 * 1000);

    // Clear cookies and local storage
    cy.clearCookies({ log: true });
    cy.clearLocalStorage({ log: true });

    cy.fixture('seedlot-registration').then((fData) => {
      data = fData;
    });
  });

  it('should register a Class A Seedlot', () => {
    // SPAR log in
    cy.login();
    cy.wait(2 * 1000);
    cy.contains('Main activities');
    // Select the “Seedlots” section from the left-hand panel
    cy.get('nav')
      .contains('Seedlots')
      .click();
    // Click on the register seedlot an A class seedlot card
    cy.get('.std-card-title')
      .contains('Register an A class seedlot')
      .click();
    // Clicking the heart icon to enable it
    cy.get('.title-favourite button').click();
    // To do - validate after to be fixed
    // Clicking the heart icon to disable it
    cy.get('.title-favourite button').click();
    // To do - validate after to be fixed
    // Enter the applicant agency name
    cy.get('#agency-name-combobox')
      .siblings('.bcgov--list-box__selection')
      .click();
    cy.get('#agency-name-combobox')
      .siblings('[title=Open]')
      .click();
    cy.get('.bcgov--list-box__menu-item__option')
      .contains(data.applicantAgency.name)
      .click();
    // Enter the applicant agency number
    cy.get('#agency-number-input')
      .clear()
      .type(data.applicantAgency.number, { delay: 50 });
    // Enter an invalid email address
    cy.get('#appliccant-email-input')
      .clear()
      .type(data.applicantAgency.invalidEmail, { delay: 50 });
    cy.get('#agency-number-input')
      .click();
    cy.get('#appliccant-email-input-error-msg')
      .should('be.visible');
    // Enter the applicant email address
    cy.get('#appliccant-email-input')
      .clear()
      .type(data.applicantAgency.email, { delay: 50 });
    // Enter the seedlot species
    cy.get('#seedlot-species-dropdown')
      .find('.bcgov--list-box__menu-icon')
      .click();
    cy.get('#seedlot-species-dropdown')
      .contains(data.seedlotInformation.species)
      .click();
    // Check checkbox behavior when Tested parent tree selected
    cy.get('#tested-radio')
      .should('be.checked');
    cy.get('#untested-radio')
      .should('not.be.checked');
    cy.get('#custom-radio')
      .should('not.be.checked');
    // Check checkbox behavior when Custom seedlot selected
    cy.get('#custom-radio')
      .siblings('.bcgov--radio-button__label')
      .find('.bcgov--radio-button__appearance')
      .click();
    cy.get('#tested-radio')
      .should('not.be.checked');
    cy.get('#untested-radio')
      .should('not.be.checked');
    cy.get('#custom-radio')
      .should('be.checked');
    // Check checkbox behavior when Untested parent tree selected
    cy.get('#untested-radio')
      .siblings('.bcgov--radio-button__label')
      .find('.bcgov--radio-button__appearance')
      .click();
    cy.get('#tested-radio')
      .should('not.be.checked');
    cy.get('#untested-radio')
      .should('be.checked');
    cy.get('#custom-radio')
      .should('not.be.checked');
    // To be registered? should be checked by default
    cy.get('#registered-tree-seed-center')
      .should('be.checked');
    // To be registeredCollected from B.C. source? should be checked by default// as
    cy.get('#collected-bc')
      .should('be.checked');
    // Click on button Create seedlot number
    cy.get('.save-button')
      .find('button')
      .click();
    // To-do Validate seedlot id
    cy.get('.scf-info-container')
      .find('h2')
      .contains(/^Your A class seedlot [0-9]/);
    // Click on Go to seedlot's detail screen
    cy.contains('button', "Go to seedlot's detail screen")
      .click();
    // Click on Complete registration
    cy.contains('button', 'Complete registration')
      .click();
    // Click on Next button to go to Ownership step
    cy.contains('button', 'Next')
      .click();
    // Uncheck Use applicant agency as owner agency
    cy.get('#default-agency-code-checkbox')
      .siblings('.bcgov--checkbox-label')
      .click();
    cy.get('#default-agency-code-checkbox')
      .should('not.be.checked');
    cy.get('#owner-agency-0')
      .should('be.empty');
    cy.get('#single-owner-code-0')
      .should('be.empty');
    // Select Owner agency
    cy.get('#owner-agency-0')
      .siblings('[title=Open]')
      .click();
    cy.get('.bcgov--list-box__menu-item__option')
      .contains(data.ownership.agency)
      .click();
    // Input Owner location code
    cy.get('#single-owner-code-0')
      .type(data.ownership.locationCode, { delay: 50 });
    // Input Owner portion
    cy.get('#single-owner-portion-0')
      .clear()
      .type(data.ownership.ownerPortion, { delay: 50 });
    cy.get('#single-owner-portion-0-error-msg')
      .should('be.visible');
    // Input Reserved (%)
    cy.get('#single-owner-reserved-0')
      .clear()
      .type(data.ownership.reserved, { delay: 50 });
    // Validate Surplus (%)
    cy.get('#single-owner-surplus-0')
      .should('have.value', data.ownership.surplus);
    // Select Funding source
    cy.get('#owner-funding-source-0')
      .click();
    cy.get('.bcgov--list-box__menu')
      .eq(1)
      .contains(data.ownership.fundingSource)
      .click();
    // Check default Method of payment
    cy.get('#owner-method-of-payment-0')
      .should('have.value', data.ownership.methodPayment);
    // Click on button Add owner
    cy.contains('button', 'Add owner')
      .click();
    // Select Owner agency on second owner
    cy.get('#owner-agency-1')
      .siblings('[title=Open]')
      .click();
    cy.get('.bcgov--list-box__menu-item__option')
      .contains(data.secondOwnership.agency)
      .click();
    // Input Owner location code on second owner
    cy.get('#single-owner-code-1')
      .type(data.secondOwnership.locationCode, { delay: 50 });
    // Input Owner portion on second owner
    cy.get('#single-owner-portion-1')
      .clear()
      .type(data.secondOwnership.ownerPortion, { delay: 50 });
    // Input Reserved (%) on second owner
    cy.get('#single-owner-reserved-1')
      .clear()
      .type(data.secondOwnership.reserved, { delay: 50 });
    // Validate Surplus (%) on second owner
    cy.get('#single-owner-surplus-1')
      .should('have.value', data.secondOwnership.surplus);
    // Select Funding source on second owner
    cy.get('#owner-funding-source-1')
      .click();
    cy.get('.bcgov--list-box__menu')
      .eq(4)
      .contains(data.secondOwnership.fundingSource)
      .click();
    // Check default Method of payment on second owner
    cy.get('#owner-method-of-payment-1')
      .should('have.value', data.secondOwnership.methodPayment);
    // Click on Next button to go to Interim Storage step
    cy.contains('button', 'Next')
      .click();
    // Uncheck Use applicant agency as collector agency
    cy.get('#collector-agency-checkbox')
      .siblings('.bcgov--checkbox-label')
      .click();
    cy.get('#collector-agency-checkbox')
      .should('not.be.checked');
    cy.get('#agency-name-combobox')
      .siblings('.bcgov--list-box__selection')
      .click();
    cy.get('#agency-name-combobox')
      .should('be.empty');
    cy.get('#agency-number-input')
      .clear()
      .should('be.empty');
    // Check Use applicant agency as collector agency
    cy.get('#collector-agency-checkbox')
      .siblings('.bcgov--checkbox-label')
      .click();
    cy.get('#collector-agency-checkbox')
      .should('be.checked');
    cy.get('#agency-name-combobox')
      .should('have.value', data.interimAgency.agency);
    cy.get('#agency-number-input')
      .should('have.value', data.interimAgency.locationCode);
    // Insert start date
    cy.get('#start-date-input')
      .clear()
      .type(data.interimAgency.startDate, { delay: 50 });
    // Insert end date before start date
    cy.get('#end-date-input')
      .clear()
      .type(data.interimAgency.invalidEndDate, { delay: 50 });
    cy.get('#storage-location-input')
      .click();
    cy.get('#end-date-input')
      .should('have.value', '');
    // Insert end date
    cy.get('#end-date-input')
      .clear()
      .type(data.interimAgency.endDate, { delay: 50 });
    // Insert an invalid value size on storage location
    cy.get('#storage-location-input')
      .clear()
      .type(data.interimAgency.invalidStorageLocation, { delay: 50 });
    cy.get('#storage-location-input-error-msg')
      .should('be.visible');
    // Insert a valid value on storage location
    cy.get('#storage-location-input')
      .clear()
      .type(data.interimAgency.storagelocation, { delay: 50 });
    // Check checkbox behavior when Outside covered - OCV selected
    cy.get('#outside-radio')
      .should('be.checked');
    cy.get('#ventilated-radio')
      .should('not.be.checked');
    cy.get('#reefer-radio')
      .should('not.be.checked');
    cy.get('#other-radio')
      .should('not.be.checked');
    cy.get('#storage-facility-type-input')
      .should('not.exist');
    // Check checkbox behavior when Ventilated room - VRM selected
    cy.get('#ventilated-radio')
      .siblings('.bcgov--radio-button__label')
      .find('.bcgov--radio-button__appearance')
      .click();
    cy.get('#outside-radio')
      .should('not.be.checked');
    cy.get('#ventilated-radio')
      .should('be.checked');
    cy.get('#reefer-radio')
      .should('not.be.checked');
    cy.get('#other-radio')
      .should('not.be.checked');
    cy.get('#storage-facility-type-input')
      .should('not.exist');
    // Check checkbox behavior when Reefer - RFR selected
    cy.get('#reefer-radio')
      .siblings('.bcgov--radio-button__label')
      .find('.bcgov--radio-button__appearance')
      .click();
    cy.get('#outside-radio')
      .should('not.be.checked');
    cy.get('#ventilated-radio')
      .should('not.be.checked');
    cy.get('#reefer-radio')
      .should('be.checked');
    cy.get('#other-radio')
      .should('not.be.checked');
    cy.get('#storage-facility-type-input')
      .should('not.exist');
    // Check checkbox behavior when Other - OTH selected
    cy.get('#other-radio')
      .siblings('.bcgov--radio-button__label')
      .find('.bcgov--radio-button__appearance')
      .click();
    cy.get('#outside-radio')
      .should('not.be.checked');
    cy.get('#ventilated-radio')
      .should('not.be.checked');
    cy.get('#reefer-radio')
      .should('not.be.checked');
    cy.get('#other-radio')
      .should('be.checked');
    cy.get('#storage-facility-type-input')
      .should('be.visible');
    // Select Outside covered - OCV checkbox option
    cy.get('#outside-radio')
      .siblings('.bcgov--radio-button__label')
      .find('.bcgov--radio-button__appearance')
      .click();
    // Click on Next button to go to Orchard step
    cy.contains('button', 'Next')
      .click();
    // Insert Orchard ID number
    cy.get('#seedlot-orchard-number-input')
      .clear()
      .type(data.orchard.number, { delay: 50 });
    cy.get('#seedlot-orchard-name-input')
      .click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    // Validate if Orchard name is correct
    cy.get('#seedlot-orchard-name-input')
      .should('have.value', data.orchard.name);
    // Validate if Seedlot species is correct
    cy.get('#seedlot-species-dropdown')
      .find('.bcgov--list-box__label')
      .should('have.text', data.seedlotInformation.species);
    // Select Female gametic contribution methodology
    cy.get('#female-gametic-combobox')
      .click();
    cy.get('.bcgov--list-box__menu')
      .eq(1)
      .contains(data.orchard.contributionMethodology)
      .click();
    // Check checkbox behavior with default value
    cy.get('#m1-radio')
      .should('not.be.checked');
    cy.get('#m2-radio')
      .should('not.be.checked');
    cy.get('#m3-radio')
      .should('not.be.checked');
    cy.get('#m4-radio')
      .should('not.be.checked');
    cy.get('#m5-radio')
      .should('not.be.checked');
    // Check M2 - Pollen volume estimate by partial survey option
    cy.get('#m2-radio')
      .siblings('.bcgov--radio-button__label')
      .find('.bcgov--radio-button__appearance')
      .click();
    cy.get('#m2-radio')
      .should('be.checked');
    // Check default value to Was the seedlot produced through controlled crosses?
    cy.get('#seedlot-produced')
      .should('be.checked');
    // Uncheck and check to validate behavior
    cy.get('#seedlot-produced')
      .siblings('.bcgov--checkbox-label')
      .click();
    cy.get('#seedlot-produced')
      .should('not.be.checked');
    cy.get('#seedlot-produced')
      .siblings('.bcgov--checkbox-label')
      .click();
    cy.get('#seedlot-produced')
      .should('be.checked');
    // Check default value to Have biotechnological processes been used to produce this seedlot?
    cy.get('#bio-processes')
      .should('be.checked');
    // Uncheck and check to validate behavior
    cy.get('#bio-processes')
      .siblings('.bcgov--checkbox-label')
      .click();
    cy.get('#bio-processes')
      .should('not.be.checked');
    cy.get('#bio-processes')
      .siblings('.bcgov--checkbox-label')
      .click();
    cy.get('#bio-processes')
      .should('be.checked');
    // Check default value to Was pollen contamination present?
    cy.get('#pollen-contamination')
      .should('be.checked');
    cy.get('#pollen-percentage-number-input')
      .should('not.be.visible');
    // Uncheck and check to validate behavior
    cy.get('#pollen-contamination')
      .siblings('.bcgov--checkbox-label')
      .click();
    cy.get('#pollen-contamination')
      .should('not.be.checked');
    cy.get('#pollen-percentage-number-input')
      .should('be.visible');
    cy.get('#pollen-contamination')
      .siblings('.bcgov--checkbox-label')
      .click();
    cy.get('#pollen-contamination')
      .should('be.checked');
    cy.get('#pollen-percentage-number-input')
      .should('not.be.visible');
    // Click on Next button to go to Parent tree and SMP step
    cy.contains('button', 'Next')
      .click();
    // Click on Next button to go to Extraction and storage step
    cy.contains('button', 'Next')
      .click();
    // Click on Submit registration button to submit form
    cy.contains('button', 'Submit registration')
      .click();
  });
});
