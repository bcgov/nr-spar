import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { SeedlotRegFixtureType } from '../../definitions';

let seedlotNumber: string;

Given('I open the configured applicant seedlot detail page', () => {
  cy.get('@aClassSeedlotData').then((data: unknown) => {
    const fixtureData = data as SeedlotRegFixtureType;
    const speciesKey = Object.keys(fixtureData)[5];

    if (!speciesKey) {
      throw new Error('The configured applicant seedlot fixture entry was not found');
    }

    cy.task('getData', fixtureData[speciesKey].species).then((number) => {
      seedlotNumber = number as string;

      cy.visit(`/seedlots/details/${seedlotNumber}`);
      cy.url().should('include', `/seedlots/details/${seedlotNumber}`);
      cy.get('.title-section h1')
        .should('have.text', `Seedlot ${seedlotNumber}`);
    });
  });
});

When('I open the applicant and seedlot editor', () => {
  cy.get('.applicant-seedlot-information')
    .find('.section-btn')
    .should('have.text', 'Edit applicant')
    .click();

  cy.url()
    .should('include', `/seedlots/edit-a-class-application/${seedlotNumber}`);
});

When('I change the applicant email to {string}', (email: string) => {
  cy.get('#edit-seedlot-email')
    .clear()
    .type(email);
});

When('I select {string} as the seedlot source', (source: string) => {
  cy.get('#seedlot-source-radio-btn-tpt')
    .check(source, { force: true });
});

When('I set the registration status to {string}', (status: string) => {
  cy.get(`#register-w-tsc-${status.toLowerCase()}`)
    .should('be.visible')
    .click({ force: true });
});

When('I set the collected within BC status to {string}', (status: string) => {
  cy.get(`#collected-within-bc-${status.toLowerCase()}`)
    .should('be.visible')
    .click({ force: true });
});

When('I save the applicant and seedlot information', () => {
  cy.get('.submit-button').click();
});

Then('I should be on the seedlot detail page', () => {
  cy.url()
    .should('include', `/seedlots/details/${seedlotNumber}`);
});

Then('the applicant email should be {string}', (email: string) => {
  cy.get('.applicant-seedlot-information')
    .find('button.email-display-value')
    .should('have.text', email);
});

Then('the applicant source should be {string}', (source: string) => {
  cy.get('.applicant-seedlot-information')
    .find('#seedlot-applicant-source')
    .should('have.value', source);
});

Then('the applicant registration status should be {string}', (status: string) => {
  cy.get('.applicant-seedlot-information')
    .find('#seedlot-applicant-to-be-registered')
    .should('have.value', status);
});

Then('the applicant within BC status should be {string}', (status: string) => {
  cy.get('.applicant-seedlot-information')
    .find('#seedlot-applicant-within-bc')
    .should('have.value', status);
});
