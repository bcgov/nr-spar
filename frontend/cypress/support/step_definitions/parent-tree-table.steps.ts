import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';

const modal = (label: string) => cy.get(`.${prefix}--modal-container[aria-label="${label}"]`);
// The upload button is not wrapped in a span, so the last span is "More options" on every tab
const moreOptionsButton = () => cy.get(`.${prefix}--toolbar-content > span`).last().find('button');
const errorNotification = () => cy.get(
  `.${prefix}--actionable-notification--error, .${prefix}--actionable-notification[role="alertdialog"]`
);

const openMoreOptions = () => {
  cy.get('#parentTreeNumber')
    .scrollIntoView();
  moreOptionsButton()
    .click({ force: true });
};

const openCleanTableModal = () => {
  openMoreOptions();
  cy.get('ul.parent-tree-table-option-menu')
    .find('li')
    .contains('Clean table data')
    .click();
};

const openUploadModal = () => {
  cy.get('button.upload-button')
    .scrollIntoView()
    .click({ force: true });
  modal('Seedlot registration')
    .should('be.visible');
};

// Shared by the cone/pollen, SMP success and SMP mix tabs, which render the same table container
Then('the parent tree table heading should be {string}', (text: string) => {
  cy.get('.parent-tree-step-table-container')
    .find(`.${prefix}--data-table-header__title`)
    .should('have.text', text);
});

Then('the parent tree table subtitle should be {string}', (text: string) => {
  cy.get('.parent-tree-step-table-container')
    .find(`.${prefix}--data-table-header__description`)
    .should('have.text', text);
});

When('I make parent tree column {string} visible as {string}', (id: string, label: string) => {
  cy.get('#parentTreeNumber');
  cy.get('thead.table-header').then(($header) => {
    if (!$header.find(`#${id}`).length) {
      // "Show/hide columns" sits right before "More options" on every tab
      cy.get(`.${prefix}--toolbar-content > span`)
        .eq(-2)
        .find('button')
        .click();

      cy.get('ul.parent-tree-table-toggle-menu')
        .find('li')
        .contains(label)
        .click();

      cy.get('.parent-tree-step-table-container')
        .find('h2')
        .click();
    }
  });
});

Then('parent tree column {string} should be visible', (id: string) => {
  cy.get('thead.table-header')
    .find(`#${id}`)
    .should('exist');
});

When('I open parent tree table options', () => {
  openMoreOptions();
});

When('I download the parent tree table template as {string}', (fileName: string) => {
  cy.get('ul.parent-tree-table-option-menu')
    .find('li')
    .contains('Download table template')
    .click();

  cy.readFile(`${Cypress.config('downloadsFolder')}/${fileName}`);
});

When('I cancel cleaning the parent tree table', () => {
  openCleanTableModal();

  modal('Clean table data')
    .should('be.visible')
    .find('button')
    .contains('Cancel')
    .click();

  modal('Clean table data')
    .should('not.be.visible');
});

When('I clean the parent tree table', () => {
  openCleanTableModal();

  modal('Clean table data')
    .find('button')
    .contains('Clean table data')
    .click();
});

When('I cancel the parent tree CSV upload', () => {
  openUploadModal();

  cy.get('button')
    .contains('Cancel')
    .click();

  modal('Seedlot registration')
    .should('not.be.visible');
});

When('I import parent tree CSV file {string}', (fileName: string) => {
  openUploadModal();

  cy.get(`.${prefix}--file`)
    .find(`input.${prefix}--file-input`)
    .selectFile(`cypress/fixtures/${fileName}`, { force: true });

  cy.get('button')
    .contains('Import file and continue')
    .click();
});

Then('the parent tree validation message should be {string}', (message: string) => {
  errorNotification()
    .find(`.${prefix}--actionable-notification__title`)
    .should('have.text', message);
});

Then('the parent tree validation message should be cleared', () => {
  errorNotification()
    .should('not.exist');
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
