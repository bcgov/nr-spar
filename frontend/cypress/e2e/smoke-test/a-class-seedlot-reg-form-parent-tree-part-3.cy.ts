import prefix from '../../../src/styles/classPrefix';

describe('A Class Seedlot Registration form, Parent Tree and SMP part-3(Calculation of SMP mix)', () => {
  let regFormData: {
    parentTree: {
      calculationTitle: string;
      calculationSubtitle: string;
      parentTreeErrorMsg: string;
      voulmeErrorMsg: string;
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

  // it('Page title and subtitles', () => {
  //   cy.get(`.${prefix}--data-table-header__title`)
  //     .should('have.text', regFormData.parentTree.calculationTitle);

  //   cy.get(`.${prefix}--data-table-header__description`)
  //     .should('have.text', regFormData.parentTree.calculationSubtitle);
  // });

  // it('Check \'Add a new row\' button functionality', () => {
  //   // Wait for the table to load
  //   cy.get('#parentTreeNumber');

  //   cy.get(`.${prefix}--pagination__items-count`)
  //     .should('include.text', '20 items');

  //   cy.get(`.${prefix}--toolbar-content > span`)
  //     .eq(0)
  //     .find('button')
  //     .as('clickAddRowBtn')
  //     .click({force: true});

  //   // Check total number of rows
  //   cy.get(`.${prefix}--pagination__items-count`)
  //     .should('include.text', '21 items');

  //   cy.get('@clickAddRowBtn')
  //     .click({force: true});

  //   // Check total number of rows
  //   cy.get(`.${prefix}--pagination__items-count`)
  //     .should('include.text', '22 items');

  //   // Check delete button functionality
  //   cy.get('#7-action-btn-del')
  //     .find('button')
  //     .click({ force: true});

  //   // Check total number of rows
  //   cy.get(`.${prefix}--pagination__items-count`)
  //     .should('include.text', '21 items');
  // });

  // it('Check \'Show/hide columns\' button functionality', () => {
  //   // Wait for the table to load
  //   cy.get('#parentTreeNumber');

  //   // Click 'Dothistroma needle blight (DFS)' checkbox
  //   cy.get(`.${prefix}--toolbar-content > span`)
  //     .eq(1)
  //     .find('button')
  //     .as('clickShowHideBtn')
  //     .click({force: true});

  //   cy.get('ul.parent-tree-table-toggle-menu')
  //     .find('li')
  //     .contains('Dothistroma needle blight (DFS)')
  //     .click();

  //   cy.get('.parent-tree-step-table-container')
  //     .find('h4')
  //     .as('closeShowHideDropdown')
  //     .click({force: true});

  //   cy.get('thead.table-header')
  //     .find('#dfs')
  //     .should('exist');

  //   // Click 'Comandra blister rust (DSC)' checkbox
  //   cy.get('@clickShowHideBtn')
  //     .click({force: true});

  //   cy.get('ul.parent-tree-table-toggle-menu')
  //     .find('li')
  //     .contains('Comandra blister rust (DSC)')
  //     .click();

  //   cy.get('@closeShowHideDropdown')
  //     .click({force: true});

  //   cy.get('thead.table-header')
  //     .find('#dsc')
  //     .should('exist');

  //   // Click 'Western gall rust (DSG)' checkbox
  //   cy.get('@clickShowHideBtn')
  //     .click({force: true});

  //   cy.get('ul.parent-tree-table-toggle-menu')
  //     .find('li')
  //     .contains('Western gall rust (DSG)')
  //     .click();

  //   cy.get('@closeShowHideDropdown')
  //     .click({force: true});

  //   cy.get('thead.table-header')
  //     .find('#dsg')
  //     .should('exist');

  //   // Click 'Volume growth (GVO)' checkbox
  //   cy.get('@clickShowHideBtn')
  //     .click({force: true});

  //   cy.get('ul.parent-tree-table-toggle-menu')
  //     .find('li')
  //     .contains('Volume growth (GVO)')
  //     .click();

  //   cy.get('@closeShowHideDropdown')
  //     .click({force: true});

  //   cy.get('thead.table-header')
  //     .find('#gvo')
  //     .should('exist');

  //   // Click 'Weighted DFS' checkbox
  //   cy.get('@clickShowHideBtn')
  //     .click({force: true});
  
  //   cy.get('ul.parent-tree-table-toggle-menu')
  //     .find('li')
  //     .contains('Weighted DFS')
  //     .click();

  //   cy.get('@closeShowHideDropdown')
  //     .click({force: true});

  //   cy.get('thead.table-header')
  //     .find('#w_dfs')
  //     .should('exist');

  //   // Click 'Weighted DSC' checkbox
  //   cy.get('@clickShowHideBtn')
  //     .click({force: true});
  
  //   cy.get('ul.parent-tree-table-toggle-menu')
  //     .find('li')
  //     .contains('Weighted DSC')
  //     .click();

  //   cy.get('@closeShowHideDropdown')
  //     .click({force: true});

  //   cy.get('thead.table-header')
  //     .find('#w_dsc')
  //     .should('exist');

  //   // Click 'Weighted DSG' checkbox
  //   cy.get('@clickShowHideBtn')
  //     .click({force: true});
  
  //   cy.get('ul.parent-tree-table-toggle-menu')
  //     .find('li')
  //     .contains('Weighted DSG')
  //     .click();

  //   cy.get('@closeShowHideDropdown')
  //     .click({force: true});

  //   cy.get('thead.table-header')
  //     .find('#w_dsg')
  //     .should('exist');

  //   // Click 'Weighted GVO' checkbox
  //   cy.get('@clickShowHideBtn')
  //     .click({force: true});
  
  //   cy.get('ul.parent-tree-table-toggle-menu')
  //     .find('li')
  //     .contains('Weighted GVO')
  //     .click();

  //   cy.get('@closeShowHideDropdown')
  //     .click({force: true});

  //   cy.get('thead.table-header')
  //     .find('#w_gvo')
  //     .should('exist');
  // });

  it('Check \'More Options\' button functionality', () => {
    // Wait for the table to load
    cy.get('#parentTreeNumber');

    // Check Download file option
    cy.get(`.${prefix}--toolbar-content > span`)
      .eq(2)
      .find('button')
      .as('clickMoreOptionsBtn')
      .click();

    cy.get('ul.parent-tree-table-option-menu')
      .find('li')
      .contains('Download table template')
      .click();

    cy.readFile(`${Cypress.config('downloadsFolder')}/SMP_Mix_Volume_template.csv`);

    // Click 'Clean table data' option
    cy.get('@clickMoreOptionsBtn')
      .click({force: true});

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
      .click({force: true});

    cy.get('@clickCleanTableBtn')
      .click({force: true});

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .find('button')
      .contains('Cancel')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .should('not.be.visible');

    // Check 'Clean table data' button of 'Clean table data' dialog box
    cy.get('@clickMoreOptionsBtn')
      .click({force: true});

    cy.get('@clickCleanTableBtn')
      .click({force: true});

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .find('button')
      .contains('Clean table data')
      .click();

    // Check values in 'SMP success on parent (%)' and 'Non-orchard pollen contam. (%)' columns of the table
    cy.get('#0-volume-value-input')
      .should('have.value', '');

    cy.get('#1-volume-value-input')
      .should('have.value', '');

    // Check upload button functionality
    cy.get('button.upload-button')
      .click({force: true});

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
      .selectFile('cypress/fixtures/Seedlot_composition_template_03.csv', {force: true});

    cy.get('button')
      .contains('Import file and continue')
      .click();

    // Compare values in Parent tree number and Volume (ml) columns of the table with the csv file
    cy.get('#0-parentTreeNumber-value-input')
      .should('have.value', '212');

    cy.get('#0-volume-value-input')
      .should('have.value', '4');

    cy.get('#1-parentTreeNumber-value-input')
      .should('have.value', '222');

    cy.get('#1-volume-value-input')
      .should('have.value', '7');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Check invalid Parent tree numbers and Volume', () => {
    // Wait for the table to load
    cy.get('#parentTreeNumber');

    // Click 'Clean table data' option
    cy.get(`.${prefix}--toolbar-content > span`)
      .eq(2)
      .find('button')
      .click({force: true});

    cy.get('ul.parent-tree-table-option-menu')
      .find('li')
      .contains('Clean table data')
      .click({force: true});

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .find('button')
      .contains('Clean table data')
      .click();

    // Check invalid parent tree number error msg
    cy.get('#0-parentTreeNumber-value-input')
      .type('5')
      .blur();

    cy.get(`.${prefix}--actionable-notification[role="alertdialog"]`)
      .should('be.visible');

    cy.get(`.${prefix}--actionable-notification__title`)
      .should('have.text', regFormData.parentTree.parentTreeErrorMsg);

    // Check invalid parent tree number error msg removal
    cy.get('#0-parentTreeNumber-value-input')
      .clear()
      .type('212')
      .blur();

    cy.get(`.${prefix}--actionable-notification[role="alertdialog"]`)
      .should('not.exist');

    // Check invalid parent tree number error msg for duplicate parent tree numbers
    cy.get('#1-parentTreeNumber-value-input')
      .type('212')
      .blur();

    cy.get(`.${prefix}--actionable-notification[role="alertdialog"]`)
      .should('be.visible');

    cy.get('#1-parentTreeNumber-value-input')
      .clear()
      .type('222')
      .blur();

    // Check Volume error msg for negative value
    cy.get('#0-volume-value-input')
      .type('-1')
      .blur();

    cy.get(`.${prefix}--actionable-notification[role="alertdialog"]`)
      .should('be.visible');

    cy.get(`.${prefix}--actionable-notification__title`)
      .should('have.text', regFormData.parentTree.voulmeErrorMsg);

    // Check Volume error msg for decimal value
    cy.get('#0-volume-value-input')
      .clear()
      .type('2.8')
      .blur();

    cy.get(`.${prefix}--actionable-notification[role="alertdialog"]`)
      .should('be.visible');

    cy.get(`.${prefix}--actionable-notification__title`)
      .should('have.text', regFormData.parentTree.voulmeErrorMsg);

    // Check Volume error msg for value > 999999
    cy.get('#0-volume-value-input')
      .clear()
      .type('1000000')
      .blur();

    cy.get(`.${prefix}--actionable-notification[role="alertdialog"]`)
      .should('be.visible');

    cy.get(`.${prefix}--actionable-notification__title`)
      .should('have.text', regFormData.parentTree.voulmeErrorMsg);

    // Check Volume error msg removal
    cy.get('#0-volume-value-input')
      .clear()
      .type('0')
      .blur();

    cy.get(`.${prefix}--actionable-notification[role="alertdialog"]`)
      .should('not.exist');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Check Proportion value', () => {
    // Wait for the table to load
    cy.get('#parentTreeNumber');

    cy.get('#0-volume-value-input')
      .clear()
      .type('1')
      .blur();

    cy.get('.parent-tree-step-table-container')
      .find('h4')
      .as('waitClick')
      .click({force: true});

    // Check proportion value
    cy.get('#0-proportion-value')
      .should('have.value', '1.0000');

    cy.get('#1-volume-value-input')
      .clear()
      .type('1')
      .blur();

    // Check proportion value after two Volume inputs
    cy.get('#0-proportion-value')
      .should('have.value', '0.5');

    cy.get('#1-proportion-value')
      .should('have.value', '0.5');

    // Enter 3rd parent tree number
    cy.get('#2-parentTreeNumber-value-input')
      .clear()
      .type('238')
      .blur();

    // Check proportion value after three unequal Volume inputs
    cy.get('#2-volume-value-input')
      .clear()
      .type('2')
      .blur();

    cy.get('@waitClick')
      .click({force: true});

    cy.get('#0-proportion-value')
      .should('have.value', '0.25');

    cy.get('#1-proportion-value')
      .should('have.value', '0.25');

    cy.get('#2-proportion-value')
      .should('have.value', '0.5');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Calculate Metrics button', () => {
    // Wait for the table to load
    cy.get('#parentTreeNumber');

    // Click 'Calculate metrics' button
    cy.get('.gen-worth-cal-row')
      .find('button')
      .contains('Calculate metrics')
      .click();

    // Check info sections visible in DOM
    cy.get('.info-section-items-row')
      .find(`label.${prefix}--label[for="meanlatitude"]`)
      .contains('Mean latitude')
      .should('be.visible');

    cy.get('.info-section-items-row')
      .find(`label.${prefix}--label[for="meanlongitude"]`)
      .contains('Mean longitude')
      .should('be.visible');

    cy.get('.info-section-items-row')
      .find(`label.${prefix}--label[for="meanelevation"]`)
      .contains('Mean elevation')
      .should('be.visible');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });
});
