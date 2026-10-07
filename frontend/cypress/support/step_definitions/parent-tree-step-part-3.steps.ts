import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';

const mixField = (row: string, field: string) => cy.get(`#${row}-${field}-value-input`);
const cleanTableModal = () => cy.get(`.${prefix}--modal-container[aria-label="Clean table data"]`);
const registrationModal = () => cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`);
const mixTableOptions = () => cy.get(`.${prefix}--toolbar-content > span`).eq(2).find('button');

Then('the SMP mix table heading should be {string}', (text: string) => {
  cy.get(`.${prefix}--data-table-header__title`).should('have.text', text);
});

Then('the SMP mix table subtitle should be {string}', (text: string) => {
  cy.get(`.${prefix}--data-table-header__description`).should('have.text', text);
});

Then('the SMP mix table should contain {string}', (text: string) => {
  cy.get(`.${prefix}--pagination__items-count`).should('include.text', text);
});

When('I add an SMP mix row', () => {
  cy.get(`.${prefix}--toolbar-content > span`).eq(0).find('button').click();
});

When('I delete SMP mix row {string}', (row: string) => {
  cy.get(`#${row}-action-btn-del`).find('button').click();
});

When('I open the SMP mix table options', () => {
  cy.get('#parentTreeNumber').scrollIntoView();
  mixTableOptions().click();
});

When('I download the SMP mix template', () => {
  cy.get('ul.parent-tree-table-option-menu').find('li').contains('Download table template').click();
  cy.readFile(`${Cypress.config('downloadsFolder')}/SMP_Mix_Volume_template.csv`);
});

When('I cancel cleaning the SMP mix table', () => {
  mixTableOptions().click();
  cy.get('ul.parent-tree-table-option-menu').find('li').contains('Clean table data').click();
  cleanTableModal()
    .should('be.visible')
    .find('button')
    .contains('Cancel')
    .click();
  cleanTableModal().should('not.be.visible');
});

When('I clean the SMP mix table', () => {
  mixTableOptions().click();
  cy.get('ul.parent-tree-table-option-menu').find('li').contains('Clean table data').click();
  cleanTableModal().find('button').contains('Clean table data').click();
});

Then('SMP mix volumes in rows {string} and {string} should be empty', (first: string, second: string) => {
  mixField(first, 'volume').should('have.value', '');
  mixField(second, 'volume').should('have.value', '');
});

When('I cancel the SMP mix CSV upload', () => {
  cy.get('button.upload-button').click();
  registrationModal().should('be.visible');
  cy.get('button').contains('Cancel').click();
  registrationModal().should('not.be.visible');
});

When('I import SMP mix CSV file {string}', (fileName: string) => {
  cy.get('button.upload-button').click();
  registrationModal().should('be.visible');
  cy.get(`.${prefix}--file`)
    .find(`input.${prefix}--file-input`)
    .selectFile(`cypress/fixtures/${fileName}`, { force: true });
  cy.get('button').contains('Import file and continue').click();
});

Then('SMP mix row {string} should contain parent tree {string} with volume {string}', (row: string, parentTreeNumber: string, volume: string) => {
  mixField(row, 'parentTreeNumber').should('have.value', parentTreeNumber);
  mixField(row, 'volume').should('have.value', volume);
});

When('I enter {string} in SMP mix field {string} at row {int}', (value: string, field: string, row: number) => {
  const selectorField = field === 'parentTreeNumber' ? 'parentTreeNumber' : 'volume';
  const selector = `#${row}-${selectorField}-value-input`;
  cy.get(selector).clear();
  cy.get(selector).type(value);
  cy.get(selector).blur();
});

Then('the SMP mix validation error should be {string}', (text: string) => {
  cy.get(`.${prefix}--actionable-notification[role="alertdialog"]`)
    .should('be.visible')
    .find(`.${prefix}--actionable-notification__title`)
    .should('have.text', text);
});

Then('the SMP mix validation error should be cleared', () => {
  cy.get(`.${prefix}--actionable-notification[role="alertdialog"]`).should('not.exist');
});

Then('SMP mix row {string} should have proportion {string}', (row: string, proportion: string) => {
  cy.get(`#${row}-proportion-value`).should('have.text', proportion);
});

Then('the mean latitude should be visible', () => {
  cy.get(`label.${prefix}--label[for="meanlatitude"]`).contains('Mean latitude').should('be.visible');
});

Then('the mean longitude should be visible', () => {
  cy.get(`label.${prefix}--label[for="meanlongitude"]`).contains('Mean longitude').should('be.visible');
});

Then('the mean elevation should be visible', () => {
  cy.get(`label.${prefix}--label[for="meanelevation"]`).contains('Mean elevation').should('be.visible');
});
