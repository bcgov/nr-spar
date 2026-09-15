import {
  Before, Then, When
} from '@badeball/cypress-cucumber-preprocessor';
import { SeedlotRegFixtureType } from '../../definitions';

let seedlotNumber: string;
let fixtureData: SeedlotRegFixtureType = {};
let seedlotInterception: Cypress.ObjectLike = {};

Before(() => cy.fixture('aclass-seedlot').then((fData: SeedlotRegFixtureType) => {
  fixtureData = fData;
  return cy.task('getData', fData.fdi.species).then((sNumber) => {
    seedlotNumber = sNumber as string;
  });
}));

When('I visit the seedlot detail page for the loaded aclass seedlot', () => {
  cy.log(`Visiting seedlot detail page for seedlot number: ${seedlotNumber}`);
  cy.intercept('GET', `/api/seedlots/${seedlotNumber}`).as('getSeedlot');
  cy.visit(`/seedlots/details/${seedlotNumber}`);
  // Consume the single seedlot GET request once, so later steps don't re-wait for a second one.
  cy.wait('@getSeedlot', { timeout: 30000 }).then((interception) => {
    seedlotInterception = interception;
  });
});

Then('the seedlot GET request status is {int}', (statusCode: number) => {
  expect(seedlotInterception.response?.statusCode).to.eq(statusCode);
});

Then('the response contains the expected applicant location code', () => {
  const responseBody = seedlotInterception.response?.body.seedlot;
  expect(responseBody).to.have.property(
    'applicantLocationCode',
    fixtureData.fdi.agencyNumber
  );
});

When('I visit {string} without failing on the status code', (path: string) => {
  cy.visit(path, { failOnStatusCode: false });
});

Then('I can see the page heading {string}', (text: string) => {
  cy.get('h1').should('contain', text);
});
