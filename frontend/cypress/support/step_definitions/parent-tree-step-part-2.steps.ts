import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';

const smpField = (parentTreeNumber: string, field: string) => cy.get(`#${parentTreeNumber}-${field}-value-input`);

const cleanTableModal = () => cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`);
const registrationModal = () => cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`);
const openTableOptions = () => cy.get(`.${prefix}--toolbar-content > span`).eq(1).find('button');

When('I open the {string} tab', (tabName: string) => {
  cy.get('#parent-tree-step-tab-list-id')
    .find('button')
    .contains(tabName)
    .click();
  cy.get('#parentTreeNumber', { timeout: 10000 });
});

Then('the SMP success table heading should be {string}', (text: string) => {
  cy.get('.parent-tree-step-table-container').find('h2').should('have.text', text);
});

Then('the SMP success table subtitle should be {string}', (text: string) => {
  cy.get('.parent-tree-step-table-container')
    .find(`p.${prefix}--data-table-header__description`)
    .should('have.text', text);
});

Then('the shared SMP default label should be {string}', (text: string) => {
  cy.get('[for="smp-default-vals-checkbox"]').should('have.text', text);
});

Then('shared SMP defaults should be disabled', () => {
  cy.get('#smp-default-vals-checkbox').should('not.be.checked');
});

When('I enable shared SMP defaults', () => {
  cy.get('[for="smp-default-vals-checkbox"]').click();
});

Then('the shared SMP default fields should be visible', () => {
  cy.get('.smp-default-input-row').should('be.visible');
});

When('I enter {string} into the shared {string} default', (value: string, field: string) => {
  const inputId = field === 'smp-success' ? '#default-smp-success-input' : '#default-pollen-contam-input';
  cy.get(inputId).clear();
  cy.get(inputId).type(value).blur();
});

When('I set the shared {string} default to {string}', (field: string, value: string) => {
  const inputId = field === 'smp-success' ? '#default-smp-success-input' : '#default-pollen-contam-input';
  cy.get(inputId).clear();
  cy.get(inputId).type(value).blur();
});

Then('the shared SMP default error should be {string}', (text: string) => {
  cy.get(`.${prefix}--actionable-notification--error`)
    .find(`.${prefix}--actionable-notification__title`)
    .should('have.text', text);
});

Then('the shared SMP default error should be cleared', () => {
  cy.get(`.${prefix}--actionable-notification--error`).should('not.exist');
});

Then('the first five parent trees should have SMP success {string} and pollen contamination {string}', (success: string, pollen: string) => {
  ['212', '219', '222', '223', '224'].forEach((number) => {
    smpField(number, 'smpSuccessPerc').should('have.value', success);
    smpField(number, 'nonOrchardPollenContam').should('have.value', pollen);
  });
});

When('I open the SMP success table options', () => {
  cy.get('#parentTreeNumber').scrollIntoView();
  openTableOptions().click();
});

When('I download the SMP success table template', () => {
  cy.get('ul.parent-tree-table-option-menu').find('li').contains('Download table template').click();
  cy.readFile(`${Cypress.config('downloadsFolder')}/Seedlot_composition_template.csv`);
});

When('I cancel cleaning the SMP success table', () => {
  openTableOptions().click();
  cy.get('ul.parent-tree-table-option-menu').find('li').contains('Clean table data').click();
  cleanTableModal()
    .should('be.visible')
    .find('button')
    .contains('Cancel')
    .click();
  cleanTableModal().should('not.be.visible');

  openTableOptions().click();
  cy.get('ul.parent-tree-table-option-menu').find('li').contains('Clean table data').click();
  cleanTableModal().find('button').contains('Cancel').click();
  cleanTableModal().should('not.be.visible');
});

When('I clean the SMP success table', () => {
  openTableOptions().click();
  cy.get('ul.parent-tree-table-option-menu').find('li').contains('Clean table data').click();
  cleanTableModal().find('button').contains('Clean table data').click();
});

Then('the SMP success and pollen contamination values for parent trees {string} and {string} should be empty', (first: string, second: string) => {
  [first, second].forEach((number) => {
    smpField(number, 'smpSuccessPerc').should('have.value', '');
    smpField(number, 'nonOrchardPollenContam').should('have.value', '');
  });
});

When('I cancel the SMP success CSV upload', () => {
  cy.get('button.upload-button').click();
  registrationModal().should('be.visible');
  cy.get('button').contains('Cancel').click();
  registrationModal().should('not.be.visible');
});

When('I import SMP success CSV file {string}', (fileName: string) => {
  cy.get('button.upload-button').click();
  registrationModal().should('be.visible');
  cy.get(`.${prefix}--file`)
    .find(`input.${prefix}--file-input`)
    .selectFile(`cypress/fixtures/${fileName}`, { force: true });
  cy.get('button').contains('Import file and continue').click();
});

Then('parent tree {string} should have SMP success {string} and pollen contamination {string}', (number: string, success: string, pollen: string) => {
  smpField(number, 'smpSuccessPerc').should('have.value', success);
  smpField(number, 'nonOrchardPollenContam').should('have.value', pollen);
});

When('I set parent tree {string} SMP success and pollen contamination to {string}', (number: string, value: string) => {
  smpField(number, 'smpSuccessPerc').clear();
  smpField(number, 'smpSuccessPerc').type(value).blur();
  smpField(number, 'nonOrchardPollenContam').clear();
  smpField(number, 'nonOrchardPollenContam').type(value).blur();
});
