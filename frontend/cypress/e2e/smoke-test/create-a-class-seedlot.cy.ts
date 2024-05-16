import { SeedlotRegistrationSelectors } from '../../utils/selectors';
import { NavigationLabels, SeedlotActivities } from '../../utils/labels';
import { TYPE_DELAY, INVALID_EMAIL, NUM_OF_LOOPS } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

Cypress._.times(NUM_OF_LOOPS, (currentLoop) => {
  describe(`Create A-Class Seedlot run number ${currentLoop + 1}`, () => {
    let fixtureData: SeedlotRegFixtureType = {};
    beforeEach(() => {
      cy.fixture('aclass-seedlot').then((jsonData) => {
        fixtureData = jsonData;
      });

      cy.login();
      cy.visit('/seedlots');
      cy.url().should('contains', '/seedlots');
    });

    it('should register an A-Class Seedlot with species pli', () => {
      const regData = fixtureData.pli;
      cy.isPageTitle(NavigationLabels.Seedlots);
      // Select the “Seedlots” section from the left-hand panel
      // Click on the register seedlot an A-class seedlot card
      cy.get(SeedlotRegistrationSelectors.SeedlotActivitiesCardTitle)
        .contains(SeedlotActivities.RegisterAClass)
        .click();
      cy.url().should('contains', '/register-a-class');
      // Enter the applicant agency name
      cy.get('#applicant-info-input')
        .clear()
        .type(regData.agencyAcronym, { delay: TYPE_DELAY })
        .blur();
      cy.get(`svg.${prefix}--inline-loading__checkmark-container`);
      // Enter the applicant agency number
      cy.get('#agency-number-input')
        .clear()
        .type(regData.agencyNumber, { delay: TYPE_DELAY });
      // Enter an invalid email address
      cy.get('#applicant-email-input')
        .clear()
        .type(INVALID_EMAIL, { delay: TYPE_DELAY });
      cy.get('#agency-number-input')
        .click();
      cy.get('#applicant-email-input-error-msg')
        .should('be.visible');
      // Enter the applicant email address
      cy.get('#applicant-email-input')
        .clear()
        .type(regData.email, { delay: TYPE_DELAY });
      // Enter the seedlot species, wait for species data to load
      cy.get('#seedlot-species-combobox')
        .click();
      cy.contains(`.${prefix}--list-box__menu-item__option`, regData.species)
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
      // Select the A-Class source option according to the fixture
      cy.get(`#seedlot-source-radio-btn-${regData.source}`)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();

      // To be registered? should be checked by default
      cy.get('#register-w-tsc-yes')
        .should('be.checked');
      cy.get('#register-w-tsc-no')
        .should('not.be.checked');

      // Select the to be registered according to fixture
      const regIdToClick = regData.toBeRegistered ? '#register-w-tsc-yes' : '#register-w-tsc-no';
      cy.get(regIdToClick)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();
      cy.get(regIdToClick)
        .should('be.checked');

      // Collected within bc? "Yes" should be checked by default
      cy.get('#collected-within-bc-yes')
        .should('be.checked');
      cy.get('#collected-within-bc-no')
        .should('not.be.checked');

      // Select the Collected within BC according to fixture
      const collectedIdToClick = regData.withinBc ? '#collected-within-bc-yes' : '#collected-within-bc-no';
      cy.get(collectedIdToClick)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();
      cy.get(collectedIdToClick)
        .should('be.checked');

      // Click on button Create seedlot number
      cy.get('.submit-button')
        .click();

      cy.url().should('contains', '/creation-success');
      // remember seedlot number
      cy.get('#created-seedlot-number').invoke('text')
        .then((seedlotNumber) => {
          cy.task('setData', [regData.species, seedlotNumber]);
        });
      cy.log('A-Class seedlot created with species', regData.species);
    });

    it('should register an A-Class Seedlot with species cw', () => {
      const regData = fixtureData.cw;
      cy.isPageTitle(NavigationLabels.Seedlots);
      // Select the “Seedlots” section from the left-hand panel
      // Click on the register seedlot an A-class seedlot card
      cy.get(SeedlotRegistrationSelectors.SeedlotActivitiesCardTitle)
        .contains(SeedlotActivities.RegisterAClass)
        .click();
      cy.url().should('contains', '/register-a-class');
      // Enter the applicant agency name
      cy.get('#applicant-info-input')
        .clear()
        .type(regData.agencyAcronym, { delay: TYPE_DELAY })
        .blur();
      cy.get(`svg.${prefix}--inline-loading__checkmark-container`);
      // Enter the applicant agency number
      cy.get('#agency-number-input')
        .clear()
        .type(regData.agencyNumber, { delay: TYPE_DELAY });
      // Enter an invalid email address
      cy.get('#applicant-email-input')
        .clear()
        .type(INVALID_EMAIL, { delay: TYPE_DELAY });
      cy.get('#agency-number-input')
        .click();
      cy.get('#applicant-email-input-error-msg')
        .should('be.visible');
      // Enter the applicant email address
      cy.get('#applicant-email-input')
        .clear()
        .type(regData.email, { delay: TYPE_DELAY });
      // Enter the seedlot species, wait for species data to load
      cy.get('#seedlot-species-combobox')
        .click();
      cy.contains(`.${prefix}--list-box__menu-item__option`, regData.species)
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
      // Select the A-Class source option according to the fixture
      cy.get(`#seedlot-source-radio-btn-${regData.source}`)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();

      // To be registered? should be checked by default
      cy.get('#register-w-tsc-yes')
        .should('be.checked');
      cy.get('#register-w-tsc-no')
        .should('not.be.checked');

      // Select the to be registered according to fixture
      const regIdToClick = regData.toBeRegistered ? '#register-w-tsc-yes' : '#register-w-tsc-no';
      cy.get(regIdToClick)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();
      cy.get(regIdToClick)
        .should('be.checked');

      // Collected within bc? "Yes" should be checked by default
      cy.get('#collected-within-bc-yes')
        .should('be.checked');
      cy.get('#collected-within-bc-no')
        .should('not.be.checked');

      // Select the Collected within BC according to fixture
      const collectedIdToClick = regData.withinBc ? '#collected-within-bc-yes' : '#collected-within-bc-no';
      cy.get(collectedIdToClick)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();
      cy.get(collectedIdToClick)
        .should('be.checked');

      // Click on button Create seedlot number
      cy.get('.submit-button')
        .click();

      cy.url().should('contains', '/creation-success');
      // remember seedlot number
      cy.get('#created-seedlot-number').invoke('text')
        .then((seedlotNumber) => {
          cy.task('setData', [regData.species, seedlotNumber]);
        });
      cy.log('A-Class seedlot created with species', regData.species);
    });

    it('should register an A-Class Seedlot with species dr', () => {
      const regData = fixtureData.dr;
      cy.isPageTitle(NavigationLabels.Seedlots);
      // Select the “Seedlots” section from the left-hand panel
      // Click on the register seedlot an A-class seedlot card
      cy.get(SeedlotRegistrationSelectors.SeedlotActivitiesCardTitle)
        .contains(SeedlotActivities.RegisterAClass)
        .click();
      cy.url().should('contains', '/register-a-class');
      // Enter the applicant agency name
      cy.get('#applicant-info-input')
        .clear()
        .type(regData.agencyAcronym, { delay: TYPE_DELAY })
        .blur();
      cy.get(`svg.${prefix}--inline-loading__checkmark-container`);
      // Enter the applicant agency number
      cy.get('#agency-number-input')
        .clear()
        .type(regData.agencyNumber, { delay: TYPE_DELAY });
      // Enter an invalid email address
      cy.get('#applicant-email-input')
        .clear()
        .type(INVALID_EMAIL, { delay: TYPE_DELAY });
      cy.get('#agency-number-input')
        .click();
      cy.get('#applicant-email-input-error-msg')
        .should('be.visible');
      // Enter the applicant email address
      cy.get('#applicant-email-input')
        .clear()
        .type(regData.email, { delay: TYPE_DELAY });
      // Enter the seedlot species, wait for species data to load
      cy.get('#seedlot-species-combobox')
        .click();
      cy.contains(`.${prefix}--list-box__menu-item__option`, regData.species)
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
      // Select the A-Class source option according to the fixture
      cy.get(`#seedlot-source-radio-btn-${regData.source}`)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();

      // To be registered? should be checked by default
      cy.get('#register-w-tsc-yes')
        .should('be.checked');
      cy.get('#register-w-tsc-no')
        .should('not.be.checked');

      // Select the to be registered according to fixture
      const regIdToClick = regData.toBeRegistered ? '#register-w-tsc-yes' : '#register-w-tsc-no';
      cy.get(regIdToClick)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();
      cy.get(regIdToClick)
        .should('be.checked');

      // Collected within bc? "Yes" should be checked by default
      cy.get('#collected-within-bc-yes')
        .should('be.checked');
      cy.get('#collected-within-bc-no')
        .should('not.be.checked');

      // Select the Collected within BC according to fixture
      const collectedIdToClick = regData.withinBc ? '#collected-within-bc-yes' : '#collected-within-bc-no';
      cy.get(collectedIdToClick)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();
      cy.get(collectedIdToClick)
        .should('be.checked');

      // Click on button Create seedlot number
      cy.get('.submit-button')
        .click();

      cy.url().should('contains', '/creation-success');
      // remember seedlot number
      cy.get('#created-seedlot-number').invoke('text')
        .then((seedlotNumber) => {
          cy.task('setData', [regData.species, seedlotNumber]);
        });
      cy.log('A-Class seedlot created with species', regData.species);
    });

    it('should register an A-Class Seedlot with species ep', () => {
      const regData = fixtureData.ep;
      cy.isPageTitle(NavigationLabels.Seedlots);
      // Select the “Seedlots” section from the left-hand panel
      // Click on the register seedlot an A-class seedlot card
      cy.get(SeedlotRegistrationSelectors.SeedlotActivitiesCardTitle)
        .contains(SeedlotActivities.RegisterAClass)
        .click();
      cy.url().should('contains', '/register-a-class');
      // Enter the applicant agency name
      cy.get('#applicant-info-input')
        .clear()
        .type(regData.agencyAcronym, { delay: TYPE_DELAY })
        .blur();
      cy.get(`svg.${prefix}--inline-loading__checkmark-container`);
      // Enter the applicant agency number
      cy.get('#agency-number-input')
        .clear()
        .type(regData.agencyNumber, { delay: TYPE_DELAY });
      // Enter an invalid email address
      cy.get('#applicant-email-input')
        .clear()
        .type(INVALID_EMAIL, { delay: TYPE_DELAY });
      cy.get('#agency-number-input')
        .click();
      cy.get('#applicant-email-input-error-msg')
        .should('be.visible');
      // Enter the applicant email address
      cy.get('#applicant-email-input')
        .clear()
        .type(regData.email, { delay: TYPE_DELAY });
      // Enter the seedlot species, wait for species data to load
      cy.get('#seedlot-species-combobox')
        .click();
      cy.contains(`.${prefix}--list-box__menu-item__option`, regData.species)
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
      // Select the A-Class source option according to the fixture
      cy.get(`#seedlot-source-radio-btn-${regData.source}`)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();

      // To be registered? should be checked by default
      cy.get('#register-w-tsc-yes')
        .should('be.checked');
      cy.get('#register-w-tsc-no')
        .should('not.be.checked');

      // Select the to be registered according to fixture
      const regIdToClick = regData.toBeRegistered ? '#register-w-tsc-yes' : '#register-w-tsc-no';
      cy.get(regIdToClick)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();
      cy.get(regIdToClick)
        .should('be.checked');

      // Collected within bc? "Yes" should be checked by default
      cy.get('#collected-within-bc-yes')
        .should('be.checked');
      cy.get('#collected-within-bc-no')
        .should('not.be.checked');

      // Select the Collected within BC according to fixture
      const collectedIdToClick = regData.withinBc ? '#collected-within-bc-yes' : '#collected-within-bc-no';
      cy.get(collectedIdToClick)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();
      cy.get(collectedIdToClick)
        .should('be.checked');

      // Click on button Create seedlot number
      cy.get('.submit-button')
        .click();

      cy.url().should('contains', '/creation-success');
      // remember seedlot number
      cy.get('#created-seedlot-number').invoke('text')
        .then((seedlotNumber) => {
          cy.task('setData', [regData.species, seedlotNumber]);
        });
      cy.log('A-Class seedlot created with species', regData.species);
    });

    it('should register an A-Class Seedlot with species fdc', () => {
      const regData = fixtureData.fdc;
      cy.isPageTitle(NavigationLabels.Seedlots);
      // Select the “Seedlots” section from the left-hand panel
      // Click on the register seedlot an A-class seedlot card
      cy.get(SeedlotRegistrationSelectors.SeedlotActivitiesCardTitle)
        .contains(SeedlotActivities.RegisterAClass)
        .click();
      cy.url().should('contains', '/register-a-class');
      // Enter the applicant agency name
      cy.get('#applicant-info-input')
        .clear()
        .type(regData.agencyAcronym, { delay: TYPE_DELAY })
        .blur();
      cy.get(`svg.${prefix}--inline-loading__checkmark-container`);      // Enter the applicant agency number
      cy.get('#agency-number-input')
        .clear()
        .type(regData.agencyNumber, { delay: TYPE_DELAY });
      // Enter an invalid email address
      cy.get('#applicant-email-input')
        .clear()
        .type(INVALID_EMAIL, { delay: TYPE_DELAY });
      cy.get('#agency-number-input')
        .click();
      cy.get('#applicant-email-input-error-msg')
        .should('be.visible');
      // Enter the applicant email address
      cy.get('#applicant-email-input')
        .clear()
        .type(regData.email, { delay: TYPE_DELAY });
      // Enter the seedlot species, wait for species data to load
      cy.get('#seedlot-species-combobox')
        .click();
      cy.contains(`.${prefix}--list-box__menu-item__option`, regData.species)
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
      // Select the A-Class source option according to the fixture
      cy.get(`#seedlot-source-radio-btn-${regData.source}`)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();

      // To be registered? should be checked by default
      cy.get('#register-w-tsc-yes')
        .should('be.checked');
      cy.get('#register-w-tsc-no')
        .should('not.be.checked');

      // Select the to be registered according to fixture
      const regIdToClick = regData.toBeRegistered ? '#register-w-tsc-yes' : '#register-w-tsc-no';
      cy.get(regIdToClick)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();
      cy.get(regIdToClick)
        .should('be.checked');

      // Collected within bc? "Yes" should be checked by default
      cy.get('#collected-within-bc-yes')
        .should('be.checked');
      cy.get('#collected-within-bc-no')
        .should('not.be.checked');

      // Select the Collected within BC according to fixture
      const collectedIdToClick = regData.withinBc ? '#collected-within-bc-yes' : '#collected-within-bc-no';
      cy.get(collectedIdToClick)
        .siblings(`.${prefix}--radio-button__label`)
        .find(`.${prefix}--radio-button__appearance`)
        .click();
      cy.get(collectedIdToClick)
        .should('be.checked');

      // Click on button Create seedlot number
      cy.get('.submit-button')
        .click();

      cy.url().should('contains', '/creation-success');
      // remember seedlot number
      cy.get('#created-seedlot-number').invoke('text')
        .then((seedlotNumber) => {
          cy.task('setData', [regData.species, seedlotNumber]);
        });
      cy.log('A-Class seedlot created with species', regData.species);
    });
  });
});
