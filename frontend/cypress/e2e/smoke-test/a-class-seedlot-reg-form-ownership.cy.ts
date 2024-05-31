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
    cy.get('.seedlot-registration-title')
      .find('h1')
      .should('have.text', 'Seedlot Registration');

    cy.get('.seedlot-registration-title')
      .find('.seedlot-form-subtitle')
      .should('contain.text', `Seedlot ${seedlotNum}`);

    cy.get('.ownership-header')
      .find('h3')
      .should('have.text', regFormData.title);

    cy.get('.ownership-header')
      .find('p')
      .should('have.text', regFormData.subtitle);

    cy.get(`.${prefix}--accordion__title`)
      .find('.item-title-section')
      .should('have.text', regFormData.agencyTitle);

    cy.get(`.${prefix}--accordion__title`)
      .find('.item-description-section')
      .should('have.text', regFormData.agencySubtitle);
  });
});
