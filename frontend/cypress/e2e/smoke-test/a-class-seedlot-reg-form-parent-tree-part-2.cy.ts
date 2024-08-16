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

  it('check checkbox default state', () => {
    cy.get('[for="smp-default-vals-checkbox"]')
      .should('have.text', '');

    cy.get('#smp-default-vals-checkbox')
      .should('not.be.checked');

    cy.get('#smp-default-vals-checkbox')
      .check();

    cy.get('.smp-default-input-row')
      .should('be.visible');
  });

  it('change checkbox default state', () => {
    cy.get('#smp-default-vals-checkbox')
      .check({force: true});

    cy.get('.smp-default-input-row')
      .should('be.visible');

    // Check error msg for negative 'SMP success' value
    cy.get('#default-smp-success-input')
      .type('-1')
      .blur();

    cy.get(`.${prefix}--actionable-notification--error`)
      .should('be.visible');

    cy.get(`.${prefix}--actionable-notification--error`)
      .find(`.${prefix}--actionable-notification__title`)
      .as('errorDialog')
      .should('have.text', regFormData.parentTree.smpSuccessErrorMsg);

    // Check no error message for positive 'SMP success' value
    cy.get('#default-smp-success-input')
      .type('5')
      .blur();

    cy.get(`.${prefix}--actionable-notification--error`)
      .should('not.exist');

    // Check error msg for decimal 'SMP success' value
    cy.get('#default-smp-success-input')
      .type('0.05')
      .blur();

    cy.get(`.${prefix}--actionable-notification--error`)
      .should('be.visible');

    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.smpSuccessErrorMsg);

    // Check error msg for >25 'SMP success' value
    cy.get('#default-smp-success-input')
      .type('26')
      .blur();

    cy.get(`.${prefix}--actionable-notification--error`)
      .should('be.visible');

    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.smpSuccessErrorMsg);

    // Check error msg for negative 'pollen contaminant' value
    cy.get('#default-pollen-contam-input')
      .type('-1')
      .blur();

    cy.get(`.${prefix}--actionable-notification--error`)
      .should('be.visible');

    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.nonOrchardErrorMsg);

    // Check no error message for positive 'pollen contaminant' value
    cy.get('#default-pollen-contam-input')
      .type('5')
      .blur();

    cy.get(`.${prefix}--actionable-notification--error`)
      .should('not.exist');

    // Check error msg for decimal 'pollen contaminant' value
    cy.get('#default-pollen-contam-input')
      .type('0.05')
      .blur();

    cy.get(`.${prefix}--actionable-notification--error`)
      .should('be.visible');

    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.nonOrchardErrorMsg);

    // Check error msg for >100 'pollen contaminant' value
    cy.get('#default-pollen-contam-input')
      .type('101')
      .blur();

    cy.get(`.${prefix}--actionable-notification--error`)
      .should('be.visible');

    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.nonOrchardErrorMsg);

    // Enter values for all 'SMP success on parent (%)' cells
    cy.get('#default-smp-success-input')
      .type('5')
      .blur();

    // Enter values for all 'Non-orchard pollen contam. (%)' cells
    cy.get('#default-pollen-contam-input')
      .type('2')
      .blur();

    cy.get(`.${prefix}--actionable-notification--error`)
      .should('not.exist');

    // Check values for top 5 rows
    cy.get('#212-smpSuccessPerc-value-input')
      .should('have.value', '5');

    cy.get('#212-nonOrchardPollenContam-value-input')
      .should('have.value', '2');

    cy.get('#219-smpSuccessPerc-value-input')
      .should('have.value', '5');

    cy.get('#219-nonOrchardPollenContam-value-input')
      .should('have.value', '2');

    cy.get('#222-smpSuccessPerc-value-input')
      .should('have.value', '5');

    cy.get('#222-nonOrchardPollenContam-value-input')
      .should('have.value', '2');

    cy.get('#223-smpSuccessPerc-value-input')
      .should('have.value', '5');

    cy.get('#223-nonOrchardPollenContam-value-input')
      .should('have.value', '2');

    cy.get('#224-smpSuccessPerc-value-input')
      .should('have.value', '5');

    cy.get('#224-nonOrchardPollenContam-value-input')
      .should('have.value', '2');

    // Change values of first rows
    cy.get('#212-smpSuccessPerc-value-input')
      .type('0')
      .blur();

    cy.get('#212-nonOrchardPollenContam-value-input')
      .type('0')
      .blur();
  });
});
