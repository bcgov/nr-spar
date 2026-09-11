import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { SeedlotRegFixtureType } from '../../definitions';
import { loadFixtureAndAlias } from '../helpers/fixture-loader';

let seedlotNumber = '';
let fixtureData: SeedlotRegFixtureType = {};

const getSeedlotNumberFromFixture = () => {
  const species = fixtureData?.fdi?.species;
  if (!species) {
    throw new Error('Seedlot fixture is missing fdi.species');
  }

  return cy.task('getData', species).then((value) => {
    seedlotNumber = value as string;
  });
};

Given('the aclass seedlot fixture is loaded', () => {
  loadFixtureAndAlias<SeedlotRegFixtureType>('aclass-seedlot', 'aClassSeedlotData', (data) => {
    fixtureData = data;
  });
});

Given('the a-class seedlot fixture is loaded', () => {
  loadFixtureAndAlias<SeedlotRegFixtureType>('aclass-seedlot', 'aClassSeedlotData', (data) => {
    fixtureData = data;
  });
});

When('I visit the seedlot detail page for the loaded aclass seedlot', () => {
  getSeedlotNumberFromFixture().then(() => {
    cy.intercept('GET', `/api/seedlots/${seedlotNumber}`).as('getSeedlot');
    cy.visit(`/seedlots/details/${seedlotNumber}`);
  });
});

Then('the seedlot GET request status is {int}', (statusCode: number) => {
  cy.wait('@getSeedlot').then((interception) => {
    expect(interception.response?.statusCode).to.eq(statusCode);
  });
});

Then('the response contains the expected applicant location code', () => {
  cy.wait('@getSeedlot').then((interception) => {
    const responseBody = interception.response?.body.seedlot;
    expect(responseBody).to.have.property(
      'applicantLocationCode',
      fixtureData.fdi.agencyNumber
    );
  });
});

When('I visit {string} without failing on the status code', (path: string) => {
  cy.visit(path, { failOnStatusCode: false });
});

Then('I can see the page heading {string}', (text: string) => {
  cy.get('h1').should('contain', text);
});
