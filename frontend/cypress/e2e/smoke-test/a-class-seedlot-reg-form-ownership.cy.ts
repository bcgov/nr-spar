import { SeedlotRegFixtureType } from '../../definitions';
import prefix from '../../../src/styles/classPrefix';

describe('A Class Seedlot Registration form, Ownership', () => {
  let regFormData: {
    title: string;
    subtitle: string;
    agencyTitle: string;
    agencySubtitle: string;
    informationTitle: string;
    informationSubtitle: string;
    checkboxText: string;
    acronymErrorMsg: string;
    locationErrorMsg: string;
    invalidDateErrorMsg: string;
    numOfContainerErrorMsg: string;
    volOfConesErrorMsg: string;
  };

  let seedlotNum: string;
  const speciesKey = 'pli';
  let seedlotData: SeedlotRegFixtureType;
  let testAcronym: string;
  let testPopupAcronym: string;

  beforeEach(() => {
    // Login
    cy.login();

    cy.fixture('a-class-reg-form-ownership').then((fData) => {
      regFormData = fData;
    });

    cy.fixture('aclass-seedlot').then((fData) => {
      seedlotData = fData;
      cy.task('getData', fData[speciesKey].species).then((sNumber) => {
        seedlotNum = sNumber as string;
        cy.visit(`/seedlots/a-class-registration/${seedlotNum}`);
        cy.url().should('contains', `/seedlots/a-class-registration/${seedlotNum}`);
      });
      testAcronym = seedlotData.dr.agencyAcronym;
      testPopupAcronym = seedlotData.cw.agencyAcronym;
      cy.get(`button.${prefix}--progress-step-button[title="Ownership"]`)
        .click();
    });
  });
  it('check title and subtitles', () => {

  });
});
