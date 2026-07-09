import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

let fixtureData: SeedlotRegFixtureType;
let seedlotNumber: string;
let speciesKey: string;

Given('I open a seedlot detail page for a saved seedlot number', () => {
  cy.get('@aClassSeedlotData').then((fData: any) => {
    fixtureData = fData as SeedlotRegFixtureType;

    // Pick a random species to test
      const speciesKeys = Object.keys(fixtureData);
      speciesKey = speciesKeys[Math.floor(Math.random() * (speciesKeys.length - 1))];
      cy.task('getData', fData[speciesKey].species).then((sNumber) => {
        seedlotNumber = sNumber as string;
        cy.visit(`/seedlots/details/${seedlotNumber}`);
        cy.url().should('contains', `/seedlots/details/${seedlotNumber}`);
      });
  });
});

Then('I can see the seedlot number in the title', () => {
  cy.isPageTitle(`Seedlot ${seedlotNumber}`);
});

Then('I can see the seedlot number in the page header', () => {
  cy.get('.title-favourite')
    .should('have.text', `Seedlot ${seedlotNumber}`);
});

Then('the status and edit action follow seedlot rules', () => {
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

type ProgressRow = { index: string; label: string };

Then('I can see registration progress labels in order:', (table: { hashes: () => ProgressRow[] }) => {
  table.hashes().forEach(({ index, label }) => {
    cy.get('.detail-section-grid')
      .find('.steps-box ul li')
      .eq(Number(index))
      .find(`p.${prefix}--progress-label`)
      .should('have.text', label);
  });
});

Then('I can open edit seedlot form from the progress section', () => {
  cy.get('.detail-section-grid')
    .children(`.${prefix}--row`)
    .children(`.${prefix}--col`)
    .find('button.section-btn')
    .should('have.text', 'Edit seedlot form')
    .click();

  cy.url().should('contains', `/seedlots/a-class-registration/${seedlotNumber}`);
});

Then('I can see the seedlot summary title', () => {
  cy.get('.seedlot-summary-title')
    .should('have.text', 'Seedlot summary');
});

Then('I can see seedlot summary core fields', () => {
  cy.contains('p.seedlot-summary-info-label', 'Seedlot number')
    .siblings('p.seedlot-summary-info-value')
    .should('have.text', seedlotNumber);

  cy.contains('p.seedlot-summary-info-label', 'Seedlot class')
    .siblings('p.seedlot-summary-info-value')
    .should('have.text', 'A-class');

  cy.contains('p.seedlot-summary-info-label', 'Seedlot species')
    .siblings('p.seedlot-summary-info-value')
    .should('have.text', fixtureData[speciesKey].species);
});

Then('I can see seedlot summary status field', () => {
  cy.contains('p.seedlot-summary-info-label', 'Status')
    .next()
    .children('span')
    .invoke('text')
    .should('match', /Incomplete|Pending/);
});

Then('I can see seedlot summary approved at field', () => {
  cy.contains('p.seedlot-summary-info-label', 'Approved at')
    .siblings('p.seedlot-summary-info-value')
    .should('have.text', '--');
});

Then('I can see applicant and seedlot information title', () => {
  cy.get('.applicant-seedlot-information-title')
    .should('have.text', 'Check your applicant and seedlot information');
});

Then('I can see applicant identity fields match fixture', () => {
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
});

Then('I can see applicant source field match fixture', () => {
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
});

Then('I can see registration and within BC values match fixture', () => {
  const toBeRegisteredText = fixtureData[speciesKey].toBeRegistered ? 'Yes' : 'No';

  cy.get('.applicant-seedlot-information')
    .find('#seedlot-applicant-to-be-registered')
    .should('have.value', toBeRegisteredText);

  const withinBcText = fixtureData[speciesKey].withinBc ? 'Yes' : 'No';

  cy.get('.applicant-seedlot-information')
    .find('#seedlot-applicant-within-bc')
    .should('have.value', withinBcText);
});
