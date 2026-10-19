import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';

const mixField = (row: string, field: string) => cy.get(`#${row}-${field}-value-input`);

Then('the SMP mix table should contain {string}', (text: string) => {
  cy.get(`.${prefix}--pagination__items-count`)
    .should('include.text', text);
});

When('I add an SMP mix row', () => {
  cy.get(`.${prefix}--toolbar-content > span`)
    .eq(0)
    .find('button')
    .click();
});

When('I delete SMP mix row {string}', (row: string) => {
  cy.get(`#${row}-action-btn-del`)
    .find('button')
    .click();
});

Then('SMP mix volumes in rows {string} and {string} should be empty', (first: string, second: string) => {
  mixField(first, 'volume')
    .should('have.value', '');
  mixField(second, 'volume')
    .should('have.value', '');
});

Then('SMP mix row {string} should contain parent tree {string} with volume {string}', (row: string, parentTreeNumber: string, volume: string) => {
  mixField(row, 'parentTreeNumber')
    .should('have.value', parentTreeNumber);
  mixField(row, 'volume')
    .should('have.value', volume);
});

When('I enter {string} in SMP mix field {string} at row {int}', (value: string, field: string, row: number) => {
  const selectorField = field === 'parentTreeNumber' ? 'parentTreeNumber' : 'volume';
  const selector = `#${row}-${selectorField}-value-input`;
  cy.get(selector)
    .clear();
  cy.get(selector)
    .type(value);
  cy.get(selector)
    .blur();
});

Then('SMP mix row {string} should have proportion {string}', (row: string, proportion: string) => {
  cy.get(`#${row}-proportion-value`)
    .should('have.text', proportion);
});

Then('the mean latitude should be visible', () => {
  cy.get(`label.${prefix}--label[for="meanlatitude"]`)
    .contains('Mean latitude')
    .should('be.visible');
});

Then('the mean longitude should be visible', () => {
  cy.get(`label.${prefix}--label[for="meanlongitude"]`)
    .contains('Mean longitude')
    .should('be.visible');
});

Then('the mean elevation should be visible', () => {
  cy.get(`label.${prefix}--label[for="meanelevation"]`)
    .contains('Mean elevation')
    .should('be.visible');
});
