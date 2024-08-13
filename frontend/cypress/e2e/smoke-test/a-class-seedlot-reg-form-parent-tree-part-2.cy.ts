import prefix from '../../../src/styles/classPrefix';

describe('A Class Seedlot Registration form, Parent Tree and SMP part-2(SMP success on parent)', () => {
  let regFormData: {
    parentTree: {
      smpSuccessTitle: string;
      smpSuccessSubtitle: string;
      smpSuccessErrorMsg: string;
      nonOrchardErrorMsg: string;
      smpSuccessNonOrchardErrorMsg: string;
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
          .contains('SMP success on parent')
          .click();
      });
    });
  });

  it('Page title and subtitles', () => {
    cy.get('.parent-tree-step-table-container')
      .find('h4')
      .should('have.text', regFormData.parentTree.smpSuccessTitle);

    cy.get('.parent-tree-step-table-container')
      .find(`p.${prefix}--data-table-header__description`)
      .should('have.text', regFormData.parentTree.smpSuccessSubtitle);
  });
});
