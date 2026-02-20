import { TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

describe('A Class Seedlot Registration form, Extraction and Storage', () => {
  let regFormData: {
    extraction: {
      extrationTitle: string;
      extrationSubtitle: string;
      storageTitle: string;
      storageSubtitle: string;
      extractionCheckboxText: string;
      storageCheckboxText: string;
      agencyErrorMsg: string;
      agencyValidationMsg: string;
      locationErrorMsg: string;
      invalidDateErrorMsg: string;
    }
  };

  let seedlotNum: string;
  const speciesKey = 'pli';
  let seedlotData: SeedlotRegFixtureType;
  let testAcronym: string;
  let testPopupAcronym: string;

  beforeEach(() => {
    // Login
    cy.login();
    cy.fixture('aclass-reg-form').then((fData) => {
      regFormData = fData;
    });

    cy.fixture('aclass-seedlot').then((fData) => {
      seedlotData = fData;
      cy.task('getData', fData[speciesKey].species).then((sNumber) => {
        seedlotNum = sNumber as string;
        const url = `/seedlots/a-class-registration/${seedlotNum}/?step=6`;
        cy.visit(url);
        cy.url().should('contains', url);
        cy.get('.extraction-information-title').contains(regFormData.extraction.extrationTitle);
      });
      testAcronym = seedlotData.dr.agencyAcronym;
      testPopupAcronym = seedlotData.cw.agencyAcronym;
    });
  });

  it('Page title and subtitles', () => {
    cy.get('.seedlot-registration-title')
      .find('h1')
      .should('have.text', `Registration for seedlot ${seedlotNum}`);

    cy.get('.extraction-information-title')
      .find('.subtitle-section')
      .should('have.text', regFormData.extraction.extrationSubtitle);

    cy.get('.temporary-seed-storage-title')
      .find('h2')
      .should('have.text', regFormData.extraction.storageTitle);

    cy.get('.temporary-seed-storage-title')
      .find('.subtitle-section')
      .should('have.text', regFormData.extraction.storageSubtitle);
  });

  it('Extraction agency section details', () => {
    cy.get('#ext-agency-tsc-checkbox')
      .should('be.checked');

    cy.get('.agency-information-row')
      .eq(0)
      .find(`.${prefix}--checkbox-wrapper`)
      .should('have.text', regFormData.extraction.extractionCheckboxText);
  });

  it('Storage agency section details', () => {
    cy.get('#str-agency-tsc-checkbox')
      .should('be.checked');

    cy.get('.agency-information-row')
      .eq(2)
      .find(`.${prefix}--checkbox-wrapper`)
      .should('have.text', regFormData.extraction.storageCheckboxText);
  });

  it('Edit Extraction agency section details', () => {
    // Change inputs
    cy.get('#ext-agency-tsc-checkbox')
      .uncheck({ force: true });

    // Enter invalid acronym
    cy.get('#ext-agency-number')
      .type('ggg')
      .blur();

    cy.get('#ext-agency-number-error-msg')
      .should('have.text', regFormData.extraction.agencyErrorMsg);

    // Enter invalid acronym
    cy.get('#ext-agency-number')
      .clear()
      .type('-1')
      .blur();

    cy.get('#ext-agency-number-error-msg')
      .should('have.text', regFormData.extraction.agencyValidationMsg);

    cy.get('.applicant-error-notification')
      .should('be.visible');

    // Enter valid test acronym
    cy.get('#ext-agency-number')
      .clear()
      .type(testAcronym)
      .blur();

    cy.get('#ext-agency-number-loading-status-tooltip')
      .find(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');

    cy.get('.applicant-error-notification')
      .should('not.exist');

    // Enter invalid location code
    cy.get('#ext-location-code')
      .clear()
      .type('96', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ext-location-code-error-msg')
      .should('have.text', regFormData.extraction.locationErrorMsg);

    // Enter valid location code
    cy.get('#ext-location-code')
      .clear()
      .type('00')
      .blur();

    cy.get('#ext-location-code-loading-status-tooltip')
      .find(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Extraction Client search modal', () => {
    cy.get('.agency-information-section')
      .eq(0)
      .find('button.client-search-toggle-btn')
      .click();

    cy.get('#client-search-dropdown')
      .find(`button.${prefix}--list-box__field`)
      .click();

    cy.get('#client-search-dropdown')
      .find('li')
      .contains('Acronym')
      .click();

    cy.get('#client-search-input')
      .clear()
      .type(testPopupAcronym)
      .blur();

    cy.get('button.client-search-button')
      .contains('Search')
      .focus()
      .click();

    cy.get(`.${prefix}--table-header-label`).contains('Acronym');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(0)
      .find('td:nth-child(1)')
      .find(`input.${prefix}--radio-button`)
      .check({ force: true });

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(0)
      .find('td[id*="locationCode"]')
      .invoke('text')
      .then((text) => {
        const locationCode = text;

        cy.get(`button.${prefix}--btn--primary`)
          .contains('Apply selected client')
          .click({ force: true });

        cy.get('#ext-agency-number')
          .should('have.value', testPopupAcronym);

        cy.get('#ext-location-code')
          .should('have.value', locationCode);

        // Save changes
        cy.saveSeedlotRegFormProgress();
      });
  });

  it('Extraction Date inputs', () => {
    // Wait for end date input to be enabled
    cy.get('#ext-end-date')
      .should('not.be.disabled')
      .clear()
      .type('2024-05-28')
      .blur();

    // Wait for start date input to be enabled
    cy.get('#ext-start-date')
      .should('not.be.disabled')
      .clear()
      .type('2024-05-29')
      .blur();

    // Check invalid date error messages
    cy.get(`.${prefix}--date-picker`)
      .find(`.${prefix}--form-requirement`)
      .should('have.length', 2)
      .and('contain.text', regFormData.extraction.invalidDateErrorMsg);

    // Enter valid start date
    cy.get('#ext-start-date')
      .should('not.be.disabled')
      .clear()
      .type('2024-05-27')
      .blur();

    // Ensure extraction agency checkbox is checked
    cy.get('#ext-agency-tsc-checkbox')
      .should('not.be.disabled')
      .check({ force: true });

    // Save changes
    cy.saveSeedlotRegFormProgress();

    // Retry-friendly check: make sure step shows 'Complete'
    cy.contains(`.${prefix}--progress-step-button`, 'Extraction')
      .find(`.${prefix}--assistive-text`)
      .should('contain.text', 'Complete');
  });

  it('Edit Storage agency section details', () => {
    // Change inputs
    cy.get('#str-agency-tsc-checkbox')
      .uncheck({ force: true });

    // Enter invalid acronym
    cy.get('#str-agency-number')
      .type('ggg')
      .blur();

    cy.get('#str-agency-number-error-msg')
      .should('have.text', regFormData.extraction.agencyErrorMsg);

    // Enter invalid acronym
    cy.get('#str-agency-number')
      .clear()
      .type('-1')
      .blur();

    cy.get('#str-agency-number-error-msg')
      .should('have.text', regFormData.extraction.agencyValidationMsg);

    cy.get('.applicant-error-notification')
      .should('be.visible');

    // Enter valid test acronym
    cy.get('#str-agency-number')
      .clear()
      .type(testAcronym)
      .blur();

    cy.get('#str-agency-number-loading-status-tooltip')
      .find(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');

    cy.get('.applicant-error-notification')
      .should('not.exist');

    // Enter invalid location code
    cy.get('#str-location-code')
      .clear()
      .type('96', { delay: TYPE_DELAY })
      .blur();

    cy.get('#str-location-code-error-msg')
      .should('have.text', regFormData.extraction.locationErrorMsg);

    // Enter valid location code
    cy.get('#str-location-code')
      .clear()
      .type('00')
      .blur();

    cy.get('#str-location-code-loading-status-tooltip')
      .find(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Storage Client search modal', () => {
    cy.get('.agency-information-section')
      .find('button.client-search-toggle-btn')
      .click();

    cy.get('#client-search-dropdown')
      .find(`button.${prefix}--list-box__field`)
      .click();

    cy.get('#client-search-dropdown')
      .find('li')
      .contains('Acronym')
      .click();

    cy.get('#client-search-input')
      .clear()
      .type(testPopupAcronym)
      .blur();

    cy.get('button.client-search-button')
      .contains('Search')
      .focus()
      .click();

    cy.get(`.${prefix}--table-header-label`).contains('Acronym');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(0)
      .find('td:nth-child(1)')
      .find(`input.${prefix}--radio-button`)
      .check({ force: true });

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(0)
      .find('td[id*="locationCode"]')
      .invoke('text')
      .then((text) => {
        const locationCode = text;

        cy.get(`button.${prefix}--btn--primary`)
          .contains('Apply selected client')
          .click();

        cy.get('#str-agency-number')
          .should('have.value', testPopupAcronym);

        cy.get('#str-location-code')
          .should('have.value', locationCode);

        // Save changes
        cy.saveSeedlotRegFormProgress();
      });
  });

  it('Storage Date inputs', () => {
    cy.get('#str-end-date')
      .clear()
      .type('2024-05-28')
      .blur();

    // Invalid start date
    cy.get('#str-start-date')
      .clear()
      .type('2024-05-29')
      .blur();

    cy.get(`.${prefix}--date-picker`)
      .find(`.${prefix}--form-requirement`)
      .should('have.length', 2)
      .and('contain.text', regFormData.extraction.invalidDateErrorMsg);

    // Valid start date
    cy.get('#str-start-date')
      .clear()
      .type('2024-05-27')
      .blur();

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });
});
