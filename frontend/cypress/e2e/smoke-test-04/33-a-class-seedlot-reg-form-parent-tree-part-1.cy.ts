import prefix from '../../../src/styles/classPrefix';
import { FIVE_SECONDS } from '../../constants';

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
    },
    orchard: {
      title: string;
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
        cy.intercept('GET', `**/api/seedlots/${seedlotNum}/a-class-form-progress`).as('tableStatus');
        cy.visit(url);
        cy.url().should('contains', url);
        // Wait for the page title to be visible before proceeding
        cy.get('.title-row').contains(regFormData.parentTree.title, { timeout: FIVE_SECONDS });
      });
    });
  });

  it('Check primary and secondary orchard values', () => {
    // Press next button
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Back')
      .click();

    // Wait for the page title to be visible before proceeding
    cy.get('.seedlot-orchard-title-row').contains(regFormData.orchard.title, { timeout: FIVE_SECONDS });

    //  Check primary orchard
    cy.get('#primary-orchard-selection')
      .then(($input) => {
        const value = $input.val();
        if (value === '') {
          cy.log('Primary input is empty');
          // Do something if the input is empty
          cy.get('#primary-orchard-selection')
            .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
            .click();

          cy.get(`.${prefix}--list-box--expanded`)
            .find('ul li')
            .contains('219 - VERNON - S - PRD')
            .click();

          // Add additional orchard
          cy.get('.seedlot-orchard-add-orchard')
            .find('button')
            .contains('Add additional orchard')
            .click();

          cy.get('#secondary-orchard-selection')
            .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
            .click();

          cy.get(`.${prefix}--list-box--expanded`)
            .find('ul li')
            .contains('222 - VERNON - S - PRD')
            .click();

          // Save changes
          cy.saveSeedlotRegFormProgress();
        }
      });

    //  Check secondary orchard
    cy.get('#secondary-orchard-selection')
      .then(($input) => {
        const value = $input.val();
        if (value === '') {
          cy.log('Secondary input is empty');
          // Do something if the input is empty
          cy.get('#secondary-orchard-selection')
            .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
            .click();

          cy.get(`.${prefix}--list-box--expanded`)
            .find('ul li')
            .contains('222 - VERNON - S - PRD')
            .click();

          // Save changes
          cy.saveSeedlotRegFormProgress();
        }
      });

    // Press next button
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Next')
      .click();

    cy.get('#parentTreeNumber').scrollIntoView();

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Page title and subtitles', () => {
    cy.get('.title-row')
      .find('h2')
      .should('have.text', regFormData.parentTree.title);

    cy.get('.title-row')
      .find('.subtitle-section')
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

    // Check template links
    cy.get('ul.donwload-templates-list')
      .find('li')
      .contains('Download cone and pollen count and SMP success on parent template.')
      .click();

    cy.readFile(`${Cypress.config('downloadsFolder')}/Seedlot_composition_template.csv`);

    cy.get('ul.donwload-templates-list')
      .find('li')
      .contains('Download calculation of SMP mix template.')
      .click();

    cy.readFile(`${Cypress.config('downloadsFolder')}/SMP_Mix_Volume_template.csv`);

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
    // Wait for the API call and check the response
    cy.wait('tableStatus').its('response.body.progressStatus.orchard.isComplete').should('eq', true);

    cy.closeMenuIfOpen();
    cy.get('#parentTreeNumber').scrollIntoView();

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
      .should('have.text', regFormData.parentTree.pollenErrorMsg);

    // Check error message for Pollen count value > 10 decimal places
    cy.get('#212-pollenCount-value-input')
      .clear()
      .type('0.00000000001')
      .blur();

    cy.get('@errorDialog')
      .should('have.text', regFormData.parentTree.pollenErrorMsg);

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

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Check \'Show/hide columns\' button functionality', () => {
    // Wait for the API call and check the response
    cy.wait('tableStatus').its('response.body.progressStatus.orchard.isComplete').should('eq', true);

    cy.closeMenuIfOpen();
    cy.get('#parentTreeNumber').scrollIntoView();

    cy.get(`.${prefix}--toolbar-content > span`)
      .eq(0)
      .find('button')
      .as('clickShowHideBtn');

    // Check 'Dothistroma needle blight (DFS)' checkbox
    cy.get('thead.table-header').find('#dfs').then(($element) => {
      if ($element.length) {
        // Element exists, do nothing
        cy.log('Table row DFS exists, no action taken.');
      } else {
        // Element does not exist, click the toggle button with DFS value
        cy.get('@clickShowHideBtn')
          .click({ force: true });

        cy.get('ul.parent-tree-table-toggle-menu')
          .find('li')
          .contains('Dothistroma needle blight (DFS)')
          .click();

        cy.get('.parent-tree-step-table-container')
          .find('h4')
          .as('closeShowHideDropdown')
          .click();
      }
    });

    cy.get('thead.table-header')
      .find('#dfs')
      .should('exist');

    // Check 'Comandra blister rust (DSC)' checkbox
    cy.get('thead.table-header').find('#dsc').then(($element) => {
      if ($element.length) {
        // Element exists, do nothing
        cy.log('Table row DSC exists, no action taken.');
      } else {
        // Element does not exist, click the toggle button with DSC value
        cy.get('@clickShowHideBtn')
          .click({ force: true });

        cy.get('ul.parent-tree-table-toggle-menu')
          .find('li')
          .contains('Comandra blister rust (DSC)')
          .click();

        cy.get('@closeShowHideDropdown')
          .click();
      }
    });

    cy.get('thead.table-header')
      .find('#dsc')
      .should('exist');

    // Check 'Western gall rust (DSG)' checkbox
    cy.get('thead.table-header').find('#dsg').then(($element) => {
      if ($element.length) {
        // Element exists, do nothing
        cy.log('Table row DSG exists, no action taken.');
      } else {
        // Element does not exist, click the toggle button with DSG value
        cy.get('@clickShowHideBtn')
          .click({ force: true });

        cy.get('ul.parent-tree-table-toggle-menu')
          .find('li')
          .contains('Western gall rust (DSG)')
          .click();

        cy.get('@closeShowHideDropdown')
          .click();
      }
    });

    cy.get('thead.table-header')
      .find('#dsg')
      .should('exist');

    // Check 'Volume growth (GVO)' checkbox
    cy.get('thead.table-header').find('#gvo').then(($element) => {
      if ($element.length) {
        // Element exists, do nothing
        cy.log('Table row GVO exists, no action taken.');
      } else {
        // Element does not exist, click the toggle button with GVO value
        cy.get('@clickShowHideBtn')
          .click({ force: true });

        cy.get('ul.parent-tree-table-toggle-menu')
          .find('li')
          .contains('Volume growth (GVO)')
          .click();

        cy.get('@closeShowHideDropdown')
          .click();
      }
    });

    cy.get('thead.table-header')
      .find('#gvo')
      .should('exist');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Check \'More Options\' button functionality', () => {
    // Wait for the API call and check the response
    cy.wait('tableStatus').its('response.body.progressStatus.orchard.isComplete').should('eq', true);

    cy.closeMenuIfOpen();
    cy.get('#parentTreeNumber').scrollIntoView();
    // Check Download file option
    cy.get(`.${prefix}--toolbar-content > span`)
      .eq(1)
      .find('button')
      .as('clickMoreOptionsBtn')
      .click({ force: true });

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
      .find('button')
      .contains('Cancel')
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

    // Check values in Cone count and Pollen count columns of the table
    cy.get('#212-coneCount-value-input')
      .should('have.value', '');

    cy.get('#212-pollenCount-value-input')
      .should('have.value', '');

    cy.get('#219-coneCount-value-input')
      .should('have.value', '');

    cy.get('#219-pollenCount-value-input')
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
      .click({ force: true });

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .should('be.visible');

    cy.get(`.${prefix}--file`)
      .find(`input.${prefix}--file-input`)
      .selectFile('cypress/fixtures/Seedlot_composition_template.csv', { force: true });

    cy.get('button')
      .contains('Import file and continue')
      .click();

    // Compare values in Cone count and Pollen count columns of the table with the csv file
    cy.get('#212-coneCount-value-input')
      .should('have.value', '1');

    cy.get('#212-pollenCount-value-input')
      .should('have.value', '46');

    cy.get('#219-coneCount-value-input')
      .should('have.value', '2');

    cy.get('#219-pollenCount-value-input')
      .should('have.value', '22');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Pagination', () => {
    // Wait for the API call and check the response
    cy.wait('tableStatus').its('response.body.progressStatus.orchard.isComplete').should('eq', true);
    cy.get(`.${prefix}--pagination`).scrollIntoView();

    const dropdownNumber = '20';
    // Number of item dropdown
    cy.get(`.${prefix}--pagination__left`)
      .find('select')
      .select(dropdownNumber);

    // Wait for the table to load
    cy.get('#parentTreeNumber');

    cy.get(`.${prefix}--pagination__left`)
      .find(`.${prefix}--pagination__items-count`)
      .should('include.text', '1–20');

    // Check total number of rows are 20
    cy.get(`table.${prefix}--data-table tbody`)
      .find('tr')
      .then(($row) => {
        expect($row.length).equal(parseInt(dropdownNumber, 10));
      });

    // Page number dropdown
    cy.get(`.${prefix}--pagination__right`)
      .find(`select.${prefix}--select-input`)
      .select('2');

    cy.get(`.${prefix}--pagination__left`)
      .find(`.${prefix}--pagination__items-count`)
      .should('include.text', '21–40');

    cy.get(`.${prefix}--pagination__right`)
      .find(`select.${prefix}--select-input`)
      .select('1');

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

  it('Calculate Metrics button', () => {
    // Wait for the API call and check the response
    cy.wait('tableStatus').its('response.body.progressStatus.orchard.isComplete').should('eq', true);
    cy.get('.info-sections-row').scrollIntoView();

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
      .contains('Genetic worth and percent of tested parent tree contribution')
      .should('be.visible');

    cy.get('.info-section-sub-title')
      .find(`.${prefix}--col`)
      .contains('Effective population size and diversity')
      .should('be.visible');

    cy.get('.info-section-sub-title')
      .find(`.${prefix}--col`)
      .contains('Orchard parent tree geospatial summary')
      .should('be.visible');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });
});
