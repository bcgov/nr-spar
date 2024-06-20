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
      checkboxText: string;
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
        cy.visit(`/seedlots/a-class-registration/${seedlotNum}`);
      });
      testAcronym = seedlotData.dr.agencyAcronym;
      testPopupAcronym = seedlotData.cw.agencyAcronym;
    });
  });

  it('Page title and subtitles', () => {
    cy.get('.extraction-information-title')
      .find('h2')
      .should('have.text', regFormData.extraction.extrationTitle);

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
      .should('have.text', regFormData.extraction.checkboxText);
  });

  it('Storage agency section details', () => {
    cy.get('#str-agency-tsc-checkbox')
      .should('be.checked');

    cy.get('.agency-information-row')
      .eq(1)
      .find(`.${prefix}--checkbox-wrapper`)
      .should('have.text', regFormData.extraction.checkboxText);
  });

  it('Edit Extraction agency section details', () => {
    // Change inputs
    cy.get('#ext-agency-tsc-checkbox')
      .uncheck({ force: true });

    // Enter invalid acronym
    cy.get('#ext-agency-combobox')
      .type('ggg')
      .blur();

    cy.get('#ext-agency-combobox-error-msg')
      .should('have.text', regFormData.extraction.agencyErrorMsg);

    // Enter invalid acronym
    cy.get('#ext-agency-combobox')
      .clear()
      .type('-1')
      .blur();

    cy.get('#ext-agency-combobox-error-msg')
      .should('have.text', regFormData.extraction.agencyValidationMsg);

    cy.get('.applicant-error-notification')
      .should('be.visible');

    // Enter valid test acronym
    cy.get('#ext-agency-combobox')
      .clear()
      .type(testAcronym)
      .blur();

    cy.get(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');

    cy.get('.applicant-error-notification')
      .should('not.be.visible');

    // Enter invalid location code
    cy.get('#ext-location-code')
      .clear()
      .type('96', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ext-location-code-error-msg')
      .should('have.text', regFormData.extraction.locationErrorMsg);

    // Enter valid location code
    cy.get('#collection-location-code')
      .clear()
      .type('02')
      .blur();

    // Save changes
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains(/Save changes|Changes saved!/g)
      .click();
  });

  it('Extraction Date inputs', () => {
    cy.get('#ext-end-date')
      .clear()
      .type('2024-05-28')
      .blur();

    // Invalid start date
    cy.get('#ext-start-date')
      .clear()
      .type('2024-05-29')
      .blur();

    cy.get(`.${prefix}--date-picker`)
      .find(`.${prefix}--form-requirement`)
      .should('have.length', 2)
      .and('contain.text', regFormData.extraction.invalidDateErrorMsg);

    // Valid start date
    cy.get('#ext-start-date')
      .clear()
      .type('2024-05-27')
      .blur();

    // Save changes
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains(/Save changes|Changes saved!/g)
      .click();
  });
});
