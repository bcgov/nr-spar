import { Given } from '@badeball/cypress-cucumber-preprocessor';
import { SeedlotRegFixtureType } from '../../definitions';
import { loadFixtureAndAlias } from '../helpers/fixture-loader';

Given('the a-class seedlot fixture is loaded', () => {
  loadFixtureAndAlias<SeedlotRegFixtureType>('aclass-seedlot', 'aClassSeedlotData');
});
