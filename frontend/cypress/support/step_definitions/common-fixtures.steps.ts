import { Given } from '@badeball/cypress-cucumber-preprocessor';
import { SeedlotRegFixtureType } from '../../definitions';

Given('the a-class seedlot fixture is loaded', () => {
  cy.fixture('aclass-seedlot').then((data: SeedlotRegFixtureType) => {
    cy.wrap(data).as('aClassSeedlotData');
  });
});
