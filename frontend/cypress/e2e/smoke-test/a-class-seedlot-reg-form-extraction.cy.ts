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
});
