import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { SeedlotRegFixtureType } from '../../definitions';

Given('the seedlot creation POST request is intercepted', () => {
  cy.intercept('POST', '/api/seedlots').as('postSeedlot');
});

Then('the seedlot creation POST request should succeed for {string}', (speciesKey: string) => {
  cy.get('@aClassSeedlotData').then((fixtureData) => {
    const regData = (fixtureData as unknown as SeedlotRegFixtureType)[speciesKey];

    cy.wait('@postSeedlot').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      expect(interception.request.body).to.have.property('applicantEmailAddress', regData.email);
    });
  });
});
