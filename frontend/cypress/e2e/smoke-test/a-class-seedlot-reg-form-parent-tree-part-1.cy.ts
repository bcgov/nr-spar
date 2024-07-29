import { TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

describe('A Class Seedlot Registration form, Parent Tree and SMP part-1(Cone and Pollen count)', () => {
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
    cy.get('.title-row')
      .find('h2')
      .should('have.text', regFormData.parentTree.title);

    cy.get('.subtitle-section')
      .should('have.text', regFormData.parentTree.subtitle);

    cy.get('.parent-tree-step-table-container')
      .find('h4')
      .should('have.text', regFormData.parentTree.coneTitle);

    cy.get('.parent-tree-step-table-container')
      .find(`p.${prefix}--data-table-header__description`)
      .should('have.text', regFormData.parentTree.coneSubtitle);
  });

  it('Accordion', () => {
    // Check default accordion behaviour
    cy.get(`.${prefix}--accordion__wrapper`)
      .should('be.visible');

    // Check closing of first accordion
    cy.get(`ul.${prefix}--accordion > li`)
      .eq(0)
      .find(`button.${prefix}--accordion__heading`)
      .click();

    cy.get(`ul.${prefix}--accordion > li`)
      .eq(0)
      .find(`.${prefix}--accordion__wrapper`)
      .should('not.be.visible');

    // Check closing of second accordion
    cy.get(`ul.${prefix}--accordion > li`)
      .eq(1)
      .find(`button.${prefix}--accordion__heading`)
      .click();

    cy.get(`ul.${prefix}--accordion > li`)
      .eq(1)
      .find(`.${prefix}--accordion__wrapper`)
      .should('not.be.visible');

    // Check closing of third accordion
    cy.get(`ul.${prefix}--accordion > li`)
      .eq(2)
      .find(`button.${prefix}--accordion__heading`)
      .click();

    cy.get(`ul.${prefix}--accordion > li`)
      .eq(2)
      .find(`.${prefix}--accordion__wrapper`)
      .should('not.be.visible');
  });

  it('Cone and pollen count table entries', () => {
    // Check error message for negative Cone count
    cy.get('#212-coneCount-value-input')
      .type('-1')
      .blur();

    cy.get(`.${prefix}--actionable-notification--error`)
      .should('be.visible');

    cy.get(`.${prefix}--actionable-notification--error`)
      .find(`.${prefix}--actionable-notification__title`)
      .as('errorDialog')
      .should('have.text', regFormData.parentTree.coneErrorMsg);

    cy.get('.subtitle-section')
      .should('have.text', regFormData.parentTree.subtitle);

    // Check error message for Cone count > 10000000000
    cy.get('#212-coneCount-value-input')
      .clear()
      .type('10000000001')
      .blur();

    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.coneErrorMsg);

    // Check error message for Cone count value > 10 decimal places
    cy.get('#212-coneCount-value-input')
      .clear()
      .type('0.00000000001')
      .blur();
  
    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.coneErrorMsg);

    // Check no error message for positive Cone count
    cy.get('#212-coneCount-value-input')
      .clear()
      .type('1')
      .blur();
  
    cy.get(`.${prefix}--actionable-notification--error`)
      .should('not.exist');

    // Check error message for negative Pollen count
    cy.get('#212-pollenCount-value-input')
      .type('-1')
      .blur();

    cy.get(`.${prefix}--actionable-notification--error`)
      .should('be.visible');

    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.pollenErrorMsg);

    // Check error message for Pollen count > 10000000000
    cy.get('#212-pollenCount-value-input')
      .clear()
      .type('10000000001')
      .blur();
  
    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.coneErrorMsg);
  
    // Check error message for Pollen count value > 10 decimal places
    cy.get('#212-pollenCount-value-input')
      .clear()
      .type('0.00000000001')
      .blur();
  
    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.coneErrorMsg);

    // Check error message for negative Cone count and negative Pollen count
    cy.get('#212-coneCount-value-input')
      .clear()
      .type('-1')
      .blur();

    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.conePollenErrorMsg);

    // Empty the Pollen count and Cone count inputs
    cy.get('#212-pollenCount-value-input')
      .clear()
      .blur();

    cy.get('#212-coneCount-value-input')
      .clear()
      .blur();
  });

  it('Check \'Show/hide columns\' button functionality', () => {
    // Click 'Dothistroma needle blight (DFS)' checkbox
    cy.get(`.${prefix}--toolbar-content > span`)
      .eq(0)
      .find('button')
      .click()
      .as('clickShowHideBtn');

    cy.get('ul.parent-tree-table-option-menu')
      .find('li')
      .contains('Dothistroma needle blight (DFS)')
      .click();

    cy.get('.parent-tree-step-table-container')
      .find('h4')
      .click()
      .as('closeShowHideDropdown');

    cy.get('thead.table-header')
      .find('#dfs')
      .should('exist');

    // Click 'Comandra blister rust (DSC)' checkbox
    cy.get('@clickShowHideBtn');

    cy.get('ul.parent-tree-table-option-menu')
      .find('li')
      .contains('Comandra blister rust (DSC)')
      .click();

    cy.get('@closeShowHideDropdown')

    cy.get('thead.table-header')
      .find('#dsc')
      .should('exist');

    // Click 'Western gall rust (DSG)' checkbox
    cy.get('@clickShowHideBtn');

    cy.get('ul.parent-tree-table-option-menu')
      .find('li')
      .contains('Western gall rust (DSG)')
      .click();

    cy.get('@closeShowHideDropdown')

    cy.get('thead.table-header')
      .find('#dsg')
      .should('exist');

    // Click 'Volume growth (GVO)' checkbox
    cy.get('@clickShowHideBtn');

    cy.get('ul.parent-tree-table-option-menu')
      .find('li')
      .contains('Volume growth (GVO)')
      .click();

    cy.get('@closeShowHideDropdown')

    cy.get('thead.table-header')
      .find('#gvo')
      .should('exist');
  });

  it('Check \'More Options\' button functionality', () => {
    // Check Download file option
    cy.get(`.${prefix}--toolbar-content > span`)
      .eq(1)
      .find('button')
      .click()
      .as('clickMoreOptionsBtn');

    cy.get('ul.parent-tree-table-option-menu')
      .find('li')
      .contains('Download table template')
      .click();

    cy.readFile(`${Cypress.config('downloadsFolder')}/Seedlot_composition_template.csv`);
    
    // Enter values in Cone count and Pollen count columns of the table
    cy.get('#212-coneCount-value-input')
      .clear()
      .type('16')
      .blur();

    cy.get('#212-pollenCount-value-input')
      .clear()
      .type('17')
      .blur();

    cy.get('#219-coneCount-value-input')
      .clear()
      .type('23')
      .blur();

    cy.get('#219-pollenCount-value-input')
      .clear()
      .type('28')
      .blur();

    // Click 'Clean table data' option
    cy.get('@clickMoreOptionsBtn');

    cy.get('ul.parent-tree-table-option-menu')
      .find('li')
      .contains('Clean table data')
      .click()
      .as('clickCleanTableBtn');

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .should('be.visible');

    // Check Cancel button of 'Clean table data' dialog box
    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .find('button')
      .contains('Cancel')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .should('not.exist');

    // Check 'X' button of 'Clean table data' dialog box
    cy.get('@clickMoreOptionsBtn');

    cy.get('@clickCleanTableBtn')

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .find('button[aria-label="close"]')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .should('not.exist');

    // Check 'Clean table data' button of 'Clean table data' dialog box
    cy.get('@clickMoreOptionsBtn');

    cy.get('@clickCleanTableBtn')

    cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`)
      .find('button')
      .contains('Clean table data')
      .click();

    // Check values in Cone count and Pollen count columns of the table
    cy.get('#212-coneCount-value-input')
      .should('have.value', '');

    cy.get('#212-pollenCount-value-input')
      .should('have.value', '');

    cy.get('#219-coneCount-value-input')
      .should('have.value', '');

    cy.get('#219-pollenCount-value-input')
      .should('have.value', '');
  });

  it('Pagination', () => {
    const dropdownNumber = '20';
    // Number of item dropdown
    cy.get(`.${prefix}--pagination__left`)
      .find('select')
      .as('dropdownBtn')
      .select(dropdownNumber);

    // Check total number of rows are 20
    cy.get(`table.${prefix}--data-table > tbody > tr`)
      .should('equal', dropdownNumber);

    // Page number dropdown
    cy.get(`.${prefix}--pagination__right`)
      .find(`select.${prefix}--select-input`)
      .select(2);

    cy.get(`.${prefix}--pagination__left`)
      .find(`.${prefix}--pagination__items-count`)
      .should('include.text', '21–40');

    cy.get(`.${prefix}--pagination__right`)
      .find(`select.${prefix}--select-input`)
      .select(1);

    // Forward Backward buttons
    cy.get(`.${prefix}--pagination__control-buttons`)
      .find(`button.${prefix}--pagination__button--forward`)
      .click();
  
    cy.get(`.${prefix}--pagination__right`)
      .find(`select.${prefix}--select-input`)
      .should('have.value', '2');

    cy.get(`.${prefix}--pagination__control-buttons`)
      .find(`button.${prefix}--pagination__button--backward`)
      .click();

    cy.get(`.${prefix}--pagination__right`)
      .find(`select.${prefix}--select-input`)
      .should('have.value', '1');
  });
});
