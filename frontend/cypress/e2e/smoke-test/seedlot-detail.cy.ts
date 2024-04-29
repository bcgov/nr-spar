/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import prefix from '../../../src/styles/classPrefix';

describe('Seedlot detail page', () => {
  let seedlotNumber: string;
  let fixtureData: Record<string, any>;

  beforeEach(function () {
    cy.login();
    cy.fixture('aclass-seedlot').then((fData) => {
      fixtureData = fData;
      cy.task('getData', fData.seedlotInformation1.species).then((sNumber) => {
        seedlotNumber = sNumber as string;
        cy.visit(`/seedlots/details/${seedlotNumber}`);
        cy.url().should('contains', `/seedlots/details/${seedlotNumber}`);
      });
    });
  });

  /**
   * Seedlot Dashboard page should load correctly.
   */
  it('should render seedlot detail correctly', () => {
    cy.get('.title-favourite')
      .should('have.text', `Seedlot ${seedlotNumber}`);

    cy.get('.combo-button-container')
      .find('.combo-button')
      .should('have.text', 'Edit seedlot form')
      .click();

    cy.url().should('contains', `/seedlots/a-class-registration/${seedlotNumber}`);
  });

  it('should render registration process section correctly', () => {
    cy.get('.detail-section-grid')
      .find('.steps-box ul li')
      .eq(0)
      .find(`p.${prefix}--progress-label`)
      .should('have.text', 'Collection');

    cy.get('.detail-section-grid')
      .find('.steps-box ul li')
      .eq(1)
      .find(`p.${prefix}--progress-label`)
      .should('have.text', 'Ownership');

    cy.get('.detail-section-grid')
      .find('.steps-box ul li')
      .eq(2)
      .find(`p.${prefix}--progress-label`)
      .should('have.text', 'Interim storage');

    cy.get('.detail-section-grid')
      .find('.steps-box ul li')
      .eq(3)
      .find(`p.${prefix}--progress-label`)
      .should('have.text', 'Orchard');

    cy.get('.detail-section-grid')
      .find('.steps-box ul li')
      .eq(4)
      .find(`p.${prefix}--progress-label`)
      .should('have.text', 'Parent tree and SMP');

    cy.get('.detail-section-grid')
      .find('.steps-box ul li')
      .eq(5)
      .find(`p.${prefix}--progress-label`)
      .should('have.text', 'Extraction and storage');

    cy.get('.detail-section-grid')
      .children(`.${prefix}--row`)
      .children(`.${prefix}--col`)
      .find('button.section-btn')
      .should('have.text', 'Edit seedlot form')
      .click();

    cy.url().should('contains', `/seedlots/a-class-registration/${seedlotNumber}`);
  });

  it('renders Seedlot Summary section correctly', () => {
    cy.get('.seedlot-summary-title')
      .should('have.text', 'Seedlot summary');

    cy.contains('p.seedlot-summary-info-label', 'Seedlot number')
      .siblings('p.seedlot-summary-info-value')
      .should('have.text', seedlotNumber);

    cy.contains('p.seedlot-summary-info-label', 'Seedlot class')
      .siblings('p.seedlot-summary-info-value')
      .should('have.text', 'A-class');

    cy.contains('p.seedlot-summary-info-label', 'Seedlot species')
      .siblings('p.seedlot-summary-info-value')
      .should('have.text', fixtureData.seedlotInformation1.species);

    cy.contains('p.seedlot-summary-info-label', 'Status')
      .next()
      .children('span')
      .should('have.text', 'Pending');

    cy.contains('p.seedlot-summary-info-label', 'Approved at')
      .siblings('p.seedlot-summary-info-value')
      .should('have.text', '--');
  });

  it('renders Applicant and Seedlot Information section correctly', () => {
    cy.get('.applicant-seedlot-information-title')
      .should('have.text', 'Check your applicant and seedlot information');

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-agency')
      .should('have.value', fixtureData.applicantAgency1.name);

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-location-code')
      .should('have.value', fixtureData.applicantAgency1.number);

    cy.get('.applicant-seedlot-information')
      .find('button.email-display-value')
      .should('have.text', fixtureData.applicantAgency1.email);

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-species')
      .should('have.value', fixtureData.seedlotInformation1.species);

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-source')
      .should('have.value', 'Untested Parent Trees');

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-to-be-registered')
      .should('have.value', 'Yes');

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-within-bc')
      .should('have.value', 'Yes');
  });
});
