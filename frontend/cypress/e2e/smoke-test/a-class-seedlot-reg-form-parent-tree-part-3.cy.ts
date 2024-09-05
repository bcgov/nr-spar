import prefix from '../../../src/styles/classPrefix';

describe('A Class Seedlot Registration form, Parent Tree and SMP part-3(Calculation of SMP mix)', () => {
  let regFormData: {
    parentTree: {
      calculationTitle: string;
      calculationSubtitle: string;
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
        cy.get('#parent-tree-step-tab-list-id')
          .find('button')
          .contains('Calculation of SMP mix')
          .click();
      });
    });
  });

  it('Page title and subtitles', () => {
    cy.get(`.${prefix}--data-table-header__title`)
      .should('have.text', regFormData.parentTree.calculationTitle);

    cy.get(`.${prefix}--data-table-header__description`)
      .should('have.text', regFormData.parentTree.calculationSubtitle);
  });
});
