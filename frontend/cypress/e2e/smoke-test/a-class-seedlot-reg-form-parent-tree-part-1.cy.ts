import { TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

describe('A Class Seedlot Registration form, Parent Tree and SMP part-1(Cone and Pollen count)', () => {
  let regFormData: {
    parentTree: {
      parentTreeTitle: string;
      parentTreeSubtitle: string;
      coneTitle: string;
      coneSubtitle: string;
      smpSuccessTitle: string;
      smpSuccessSubtitle: string;
      calculationSMPTitle: string;
      calculationSMPSubtitle: string;
      smpSuccessCheckboxText: string;
      coneErrorMsg: string;
      pollenErrorMsg: string;
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
        const url = `/seedlots/a-class-registration/${seedlotNum}/?step=5`;
        cy.visit(url);
        cy.url().should('contains', url);
      });
    });
  });

  it('Page title and subtitles', () => {
  });
});
