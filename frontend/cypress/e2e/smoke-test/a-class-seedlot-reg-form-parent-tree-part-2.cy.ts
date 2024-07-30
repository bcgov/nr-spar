import prefix from '../../../src/styles/classPrefix';

describe('A Class Seedlot Registration form, Parent Tree and SMP part-2(SMP success on parent)', () => {
  let regFormData: {
    parentTree: {
      title: string;
      subtitle: string;
      coneTitle: string;
      coneSubtitle: string;
      coneErrorMsg: string;
      pollenErrorMsg: string;
      conePollenErrorMsg: string;
    }
  };

  let seedlotNum: string;
  const speciesKey = 'pli';

  beforeEach(() => {
    // Login
    cy.login();
    cy.fixture('aclass-reg-form').then((fData) => {
      regFormData = fData;
    });

    cy.fixture('aclass-seedlot').then((fData) => {
      cy.task('getData', fData[speciesKey].species).then((sNumber) => {
        seedlotNum = sNumber as string;
        const url = `/seedlots/a-class-registration/${seedlotNum}/?step=5`;
        cy.visit(url);
        cy.url().should('contains', url);
      });
    });
  });
});
