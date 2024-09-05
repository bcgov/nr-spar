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

  it('Check \'Show/hide columns\' button functionality', () => {
    // Wait for the table to load
    cy.get('#parentTreeNumber');

    // Click 'Dothistroma needle blight (DFS)' checkbox
    cy.get(`.${prefix}--toolbar-content > span`)
      .eq(1)
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

    // Click 'Weighted DFS' checkbox
    cy.get('@clickShowHideBtn')
      .click({force: true});
  
    cy.get('ul.parent-tree-table-toggle-menu')
      .find('li')
      .contains('Weighted DFS')
      .click();

    cy.get('@closeShowHideDropdown')
      .click();

    cy.get('thead.table-header')
      .find('#w_dfs')
      .should('exist');

    // Click 'Weighted DSC' checkbox
    cy.get('@clickShowHideBtn')
      .click({force: true});
  
    cy.get('ul.parent-tree-table-toggle-menu')
      .find('li')
      .contains('Weighted DSC')
      .click();

    cy.get('@closeShowHideDropdown')
      .click();

    cy.get('thead.table-header')
      .find('#w_dsc')
      .should('exist');

    // Click 'Weighted DSG' checkbox
    cy.get('@clickShowHideBtn')
      .click({force: true});
  
    cy.get('ul.parent-tree-table-toggle-menu')
      .find('li')
      .contains('Weighted DSG')
      .click();

    cy.get('@closeShowHideDropdown')
      .click();

    cy.get('thead.table-header')
      .find('#w_dsg')
      .should('exist');

    // Click 'Weighted GVO' checkbox
    cy.get('@clickShowHideBtn')
      .click({force: true});
  
    cy.get('ul.parent-tree-table-toggle-menu')
      .find('li')
      .contains('Weighted GVO')
      .click();

    cy.get('@closeShowHideDropdown')
      .click();

    cy.get('thead.table-header')
      .find('#w_gvo')
      .should('exist');
  });
});
