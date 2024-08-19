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

  it('Check \'Show/hide columns\' button functionality', () => {
    // Click 'Dothistroma needle blight (DFS)' checkbox
    cy.get(`.${prefix}--toolbar-content > span`)
      .eq(0)
      .find('button')
      .as('clickShowHideBtn')
      .click({force: true});

    cy.get('ul.parent-tree-table-toggle-menu')
      .find('li')
      .contains('Dothistroma needle blight (DFS)')
      .click();

    cy.get('.parent-tree-step-table-container')
      .find('h4')
      .as('closeShowHideDropdown')
      .click();

    cy.get('thead.table-header')
      .find('#dfs')
      .should('exist');

    // Click 'Comandra blister rust (DSC)' checkbox
    cy.get('@clickShowHideBtn')
      .click({force: true});

    cy.get('ul.parent-tree-table-toggle-menu')
      .find('li')
      .contains('Comandra blister rust (DSC)')
      .click();

    cy.get('@closeShowHideDropdown')
      .click();

    cy.get('thead.table-header')
      .find('#dsc')
      .should('exist');

    // Click 'Western gall rust (DSG)' checkbox
    cy.get('@clickShowHideBtn')
      .click({force: true});

    cy.get('ul.parent-tree-table-toggle-menu')
      .find('li')
      .contains('Western gall rust (DSG)')
      .click();

    cy.get('@closeShowHideDropdown')
      .click();

    cy.get('thead.table-header')
      .find('#dsg')
      .should('exist');

    // Click 'Volume growth (GVO)' checkbox
    cy.get('@clickShowHideBtn')
      .click({force: true});

    cy.get('ul.parent-tree-table-toggle-menu')
      .find('li')
      .contains('Volume growth (GVO)')
      .click();

    cy.get('@closeShowHideDropdown')
      .click();

    cy.get('thead.table-header')
      .find('#gvo')
      .should('exist');
  });

  it('Check \'More Options\' button functionality', () => {
    // Check Download file option
    cy.get(`.${prefix}--toolbar-content > span`)
      .eq(1)
      .find('button')
      .as('clickMoreOptionsBtn')
      .click();

    cy.get('ul.parent-tree-table-option-menu')
      .find('li')
      .contains('Download table template')
      .click();

    cy.readFile(`${Cypress.config('downloadsFolder')}/Seedlot_composition_template.csv`);

    // Click 'Clean table data' option
    cy.get('@clickMoreOptionsBtn')
      .click();

    cy.get('ul.parent-tree-table-option-menu')
      .find('li')
      .contains('Clean table data')
      .as('clickCleanTableBtn')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .should('be.visible');

    // Check Cancel button of 'Clean table data' dialog box
    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .find('button')
      .contains('Cancel')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .should('not.be.visible');

    // Check 'X' button of 'Clean table data' dialog box
    cy.get('@clickMoreOptionsBtn')
      .click();

    cy.get('@clickCleanTableBtn')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .find('button[aria-label="close"]')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .should('not.be.visible');

    // Check 'Clean table data' button of 'Clean table data' dialog box
    cy.get('@clickMoreOptionsBtn')
      .click();

    cy.get('@clickCleanTableBtn')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .find('button')
      .contains('Clean table data')
      .click();

    // Check values in 'SMP success on parent (%)' and 'Non-orchard pollen contam. (%)' columns of the table
    cy.get('#212-smpSuccessPerc-value-input')
      .should('have.value', '');

    cy.get('#212-nonOrchardPollenContam-value-input')
      .should('have.value', '');

    cy.get('#219-smpSuccessPerc-value-input')
      .should('have.value', '');

    cy.get('#219-nonOrchardPollenContam-value-input')
      .should('have.value', '');

    // Check upload button functionality
    cy.get('button.upload-button')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .should('be.visible');

    cy.get('button')
      .contains('Cancel')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .should('not.be.visible');

    // Check file upload functionality
    cy.get('button.upload-button')
      .click({force: true});

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .should('be.visible');

    cy.get(`.${prefix}--file`)
      .find(`input.${prefix}--file-input`)
      .selectFile('cypress/fixtures/Seedlot_composition_template.csv', {force: true});

    cy.get('button')
      .contains('Import file and continue')
      .click();

    // Compare values in 'SMP success on parent (%)' and 'Non-orchard pollen contam. (%)' columns of the table with the csv file
    cy.get('#212-smpSuccessPerc-value-input')
      .should('have.value', '1');

    cy.get('#212-nonOrchardPollenContam-value-input')
      .should('have.value', '46');

    cy.get('#219-smpSuccessPerc-value-input')
      .should('have.value', '2');

    cy.get('#219-nonOrchardPollenContam-value-input')
      .should('have.value', '22');
  });

  it('Calculate Metrics button', () => {
    // Check info sections not visible in DOM
    cy.get('.info-section-sub-title')
      .should('not.exist');

    // Click 'Calculate metrics' button
    cy.get('.gen-worth-cal-row')
      .find('button')
      .contains('Calculate metrics')
      .click();

    // Check info sections visible in DOM
    cy.get('.info-section-sub-title')
      .find(`.${prefix}--col`)
      .contains('Genetic worth and percent of Tested parent tree contribution')
      .should('be.visible');

    cy.get('.info-section-sub-title')
      .find(`.${prefix}--col`)
      .contains('Effective population size and diversity')
      .should('be.visible');

    cy.get('.info-section-sub-title')
      .find(`.${prefix}--col`)
      .contains('Orchard parent tree geospatial summary')
      .should('be.visible');
  });
});
