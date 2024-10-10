import prefix from '../../../src/styles/classPrefix';
import { TYPE_DELAY } from '../../constants';
import { SeedlotRegFixtureType } from '../../definitions';

describe('A Class Seedlot Registration form, Parent Tree and SMP part-3(Calculation of SMP mix)', () => {
  let regFormData: {
    submission: {
      title: string;
      subtitle: string;
      checkboxText: string;
    }
  };

  let seedlotNum: string;
  const speciesKey = 'pli';
  let seedlotData: SeedlotRegFixtureType;

  beforeEach(() => {
    // Login
    cy.login();
    cy.fixture('aclass-reg-form').then((fData) => {
      regFormData = fData;
    });

    cy.fixture('aclass-seedlot').then((fData) => {
      seedlotData = fData;
      cy.task('getData', fData[speciesKey].species).then((sNumber) => {
        seedlotNum = sNumber as string;
        const url = `/seedlots/a-class-registration/${seedlotNum}/?step=6`;
        cy.visit(url);
        cy.url().should('contains', url);
      });
    });
  });

  it('Popup title and subtitles', () => {
  });
});
