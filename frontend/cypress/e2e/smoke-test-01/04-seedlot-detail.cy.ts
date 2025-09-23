/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { FIVE_SECONDS } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

describe('Seedlot detail page', () => {
  let seedlotNumber: string;
  let fixtureData: SeedlotRegFixtureType;
  let speciesKey: string;

  beforeEach(function () {
    cy.login();
    cy.fixture('aclass-seedlot').then((fData) => {
      fixtureData = fData;
      // Pick a random species to test
      const speciesKeys = Object.keys(fixtureData);
      speciesKey = speciesKeys[Math.floor(Math.random() * (speciesKeys.length - 1))];
      cy.task('getData', fData[speciesKey].species).then((sNumber) => {
        seedlotNumber = sNumber as string;
        cy.visit(`/seedlots/details/${seedlotNumber}`);
        cy.url().should('contains', `/seedlots/details/${seedlotNumber}`);
        // Wait for the page title to be visible before proceeding
        cy.get('.title-section h1')
          .should('have.text', `Seedlot ${seedlotNumber}`, { timeout: FIVE_SECONDS });
      });
    });
  });

  it('should render seedlot detail correctly', () => {
    cy.get('.title-favourite')
      .should('have.text', `Seedlot ${seedlotNumber}`);

    cy.contains('p.seedlot-summary-info-label', 'Status')
      .next()
      .children('span')
      .invoke('text')
      .then((text) => {
        if (text.trim() !== 'Expired') {
          cy.get('.combo-button-container')
            .find('.combo-button')
            .should('have.text', 'Edit seedlot form')
            .click();

          cy.url().should('contains', `/seedlots/a-class-registration/${seedlotNumber}`);
        }
      });
  });

  it('should render registration progress bar correctly', () => {
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
      .should('have.text', fixtureData[speciesKey].species);

    cy.contains('p.seedlot-summary-info-label', 'Status')
      .next()
      .children('span')
      .invoke('text')
      .should('match', /Incomplete|Pending/);

    cy.contains('p.seedlot-summary-info-label', 'Approved at')
      .siblings('p.seedlot-summary-info-value')
      .should('have.text', '--');
  });

  it('renders Applicant and Seedlot Information section correctly', () => {
    cy.get('.applicant-seedlot-information-title')
      .should('have.text', 'Check your applicant and seedlot information');

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-agency')
      .should('have.value', fixtureData[speciesKey].agencyName);

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-location-code')
      .should('have.value', fixtureData[speciesKey].agencyNumber);

    cy.get('.applicant-seedlot-information')
      .find('button.email-display-value')
      .should('have.text', fixtureData[speciesKey].email);

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-species')
      .should('have.value', fixtureData[speciesKey].species);

    if (fixtureData[speciesKey].source === 'tpt') {
      cy.get('.applicant-seedlot-information')
        .find('#seedlot-applicant-source')
        .should('have.value', 'Tested Parent Trees');
    } else if (fixtureData[speciesKey].source === 'upt') {
      cy.get('.applicant-seedlot-information')
        .find('#seedlot-applicant-source')
        .should('have.value', 'Untested Parent Trees');
    } else {
      cy.get('.applicant-seedlot-information')
        .find('#seedlot-applicant-source')
        .should('have.value', 'Custom Seedlot');
    }

    const toBeRegisteredText = fixtureData[speciesKey].toBeRegistered ? 'Yes' : 'No';

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-to-be-registered')
      .should('have.value', toBeRegisteredText);

    const withinBcText = fixtureData[speciesKey].withinBc ? 'Yes' : 'No';

    cy.get('.applicant-seedlot-information')
      .find('#seedlot-applicant-within-bc')
      .should('have.value', withinBcText);
  });
});
