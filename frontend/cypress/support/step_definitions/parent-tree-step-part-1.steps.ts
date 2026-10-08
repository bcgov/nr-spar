import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';

const modal = (label: string) => cy.get(`.${prefix}--modal-container[aria-label="${label}"]`);
const parentTreeField = (parentTreeNumber: string, field: string) => cy.get(`#${parentTreeNumber}-${field}-value-input`);

When('I ensure primary and secondary orchards are selected', () => {
  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .contains('Back')
    .click();

  const chooseOrchard = (inputId: string, orchard: string) => {
    cy.get(`#${inputId}`).then(($input) => {
      if (!$input.val()) {
        cy.get(`#${inputId}`).click();
        cy.get(`.${prefix}--list-box--expanded`)
          .find('ul li')
          .contains(orchard)
          .click();
      }
    });
  };

  chooseOrchard('primary-orchard-selection', '219 - VERNON - S - PRD');
  cy.get('#secondary-orchard-selection').then(($input) => {
    if (!$input.length) {
      cy.get('.seedlot-orchard-add-orchard')
        .find('button')
        .contains('Add additional orchard')
        .click();
    }
  });
  chooseOrchard('secondary-orchard-selection', '222 - VERNON - S - PRD');

  cy.saveSeedlotRegFormProgress();
  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .contains('Next')
    .click();
  cy.get('#parentTreeNumber').scrollIntoView();
  cy.saveSeedlotRegFormProgress();
});

Then('the parent tree page title should be {string}', (text: string) => {
  cy.get('.title-row').find('h2').should('have.text', text);
});

Then('the parent tree page subtitle should be {string}', (text: string) => {
  cy.get('.title-row').find('.subtitle-section').should(($el) => {
    expect($el.text().trim()).to.equal(text);
  });
});

Then('the cone and pollen table heading should be {string}', (text: string) => {
  cy.get('.parent-tree-step-table-container').find('h2').should('have.text', text);
});

Then('the cone and pollen table subtitle should be {string}', (text: string) => {
  cy.get('.parent-tree-step-table-container')
    .find(`p.${prefix}--data-table-header__description`)
    .should('have.text', text);
});

Then('the parent tree accordion should be visible', () => {
  cy.get(`.${prefix}--accordion__wrapper`).should('be.visible');
});

When('I download the parent tree template {string} as {string}', (label: string, fileName: string) => {
  cy.get('ul.donwload-templates-list').find('li').contains(label).click();
  cy.readFile(`${Cypress.config('downloadsFolder')}/${fileName}`);
});

When('I collapse parent tree accordion {int}', (index: number) => {
  cy.get(`ul.${prefix}--accordion > li`)
    .eq(index - 1)
    .find(`button.${prefix}--accordion__heading`)
    .click();
  cy.get(`ul.${prefix}--accordion > li`)
    .eq(index - 1)
    .find(`.${prefix}--accordion__wrapper`)
    .should('not.be.visible');
});

When('I enter {string} in parent tree field {string}', (value: string, field: string) => {
  cy.get(`#212-${field}-value-input`).clear().type(value).blur();
});

Then('the parent tree validation message should be {string}', (message: string) => {
  cy.get(`.${prefix}--actionable-notification--error`)
    .find(`.${prefix}--actionable-notification__title`)
    .should('have.text', message);
});

Then('the parent tree validation message should be cleared', () => {
  cy.get(`.${prefix}--actionable-notification--error`).should('not.exist');
});

When('I clear the cone and pollen count fields for parent tree {string}', (parentTreeNumber: string) => {
  parentTreeField(parentTreeNumber, 'pollenCount').clear().blur();
  parentTreeField(parentTreeNumber, 'coneCount').clear().blur();
});

Then('the parent tree validation message should not be visible', () => {
  cy.get(`.${prefix}--actionable-notification--error`).should('not.exist');
});

When('I make parent tree column {string} visible as {string}', (id: string, label: string) => {
  cy.get('#parentTreeNumber');
  cy.get('thead.table-header').then(($header) => {
    if (!$header.find(`#${id}`).length) {
      cy.get(`.${prefix}--toolbar-content > span`).eq(0).find('button').click();
      cy.get('ul.parent-tree-table-toggle-menu').find('li').contains(label).click();
      cy.get('.parent-tree-step-table-container').find('h2').click();
    }
  });
});

Then('parent tree column {string} should be visible', (id: string) => {
  cy.get('thead.table-header').find(`#${id}`).should('exist');
});

When('I open parent tree table options', () => {
  cy.get('#parentTreeNumber').scrollIntoView();
  cy.get(`.${prefix}--toolbar-content > span`).eq(1).find('button').click();
});

When('I download the parent tree table template', () => {
  cy.get('ul.parent-tree-table-option-menu').find('li').contains('Download table template').click();
  cy.readFile(`${Cypress.config('downloadsFolder')}/Seedlot_composition_template.csv`);
});

When('I enter sample values into cone and pollen counts', () => {
  parentTreeField('212', 'coneCount').clear().type('16').blur();
  parentTreeField('212', 'pollenCount').clear().type('17').blur();
  parentTreeField('219', 'coneCount').clear().type('23').blur();
  parentTreeField('219', 'pollenCount').clear().type('28').blur();
});

When('I cancel cleaning the parent tree table', () => {
  cy.get(`.${prefix}--toolbar-content > span`).eq(1).find('button').click();
  cy.get('ul.parent-tree-table-option-menu li').contains('Clean table data').click();
  modal('Clean table data')
    .should('be.visible')
    .find('button')
    .contains('Cancel')
    .click();
  modal('Clean table data').should('not.be.visible');
  cy.get(`.${prefix}--toolbar-content > span`).eq(1).find('button').click();
  cy.get('ul.parent-tree-table-option-menu').find('li').contains('Clean table data').click();
  modal('Clean table data').find('button').contains('Cancel').click();
  modal('Clean table data').should('not.be.visible');
});

When('I clean the parent tree table', () => {
  cy.get(`.${prefix}--toolbar-content > span`).eq(1).find('button').click();
  cy.get('ul.parent-tree-table-option-menu').find('li').contains('Clean table data').click();
  modal('Clean table data').find('button').contains('Clean table data').click();
});

Then('the cone and pollen counts for parent trees {string} and {string} should be empty', (first: string, second: string) => {
  [first, second].forEach((parentTreeNumber) => {
    parentTreeField(parentTreeNumber, 'coneCount').should('have.value', '');
    parentTreeField(parentTreeNumber, 'pollenCount').should('have.value', '');
  });
});

When('I cancel the parent tree CSV upload', () => {
  cy.get('button.upload-button').click();
  modal('Seedlot registration').should('be.visible');
  cy.get('button').contains('Cancel').click();
  modal('Seedlot registration').should('not.be.visible');
});

When('I import parent tree CSV file {string}', (fileName: string) => {
  cy.get('button.upload-button').click();
  modal('Seedlot registration').should('be.visible');
  cy.get(`.${prefix}--file`)
    .find(`input.${prefix}--file-input`)
    .selectFile(`cypress/fixtures/${fileName}`, { force: true });
  cy.get('button').contains('Import file and continue').click();
});

Then('parent tree {string} should have cone count {string} and pollen count {string}', (number: string, cone: string, pollen: string) => {
  parentTreeField(number, 'coneCount').should('have.value', cone);
  parentTreeField(number, 'pollenCount').should('have.value', pollen);
});

When('I set the parent tree page size to {string}', (size: string) => {
  cy.get(`.${prefix}--pagination`).scrollIntoView();
  cy.get(`.${prefix}--pagination__left`).find('select').select(size);
});

Then('the parent tree pagination range should be {string}', (range: string) => {
  cy.get(`.${prefix}--pagination__left`)
    .find(`.${prefix}--pagination__items-count`)
    .should('include.text', range);
});

Then('the parent tree table should contain {int} rows', (count: number) => {
  cy.get(`table.${prefix}--data-table tbody tr`).should('have.length', count);
});

When('I select parent tree page {string}', (page: string) => {
  cy.get(`.${prefix}--pagination__right`).find(`select.${prefix}--select-input`).select(page);
});

When('I move forward one parent tree page', () => {
  cy.get(`.${prefix}--pagination__control-buttons`)
    .find(`button.${prefix}--pagination__button--forward`)
    .click();
});

When('I move backward one parent tree page', () => {
  cy.get(`.${prefix}--pagination__control-buttons`)
    .find(`button.${prefix}--pagination__button--backward`)
    .click();
});

Then('the selected parent tree page should be {string}', (page: string) => {
  cy.get(`.${prefix}--pagination__right`)
    .find(`select.${prefix}--select-input`)
    .should('have.value', page);
});

Then('the parent tree metric summaries should be visible', () => {
  [
    'Genetic worth and percent of tested parent tree contribution',
    'Effective population size and diversity',
    'Orchard parent tree geospatial summary'
  ].forEach((summary) => {
    cy.get('.info-section-sub-title')
      .find(`.${prefix}--col`)
      .contains(summary)
      .should('be.visible');
  });
});
