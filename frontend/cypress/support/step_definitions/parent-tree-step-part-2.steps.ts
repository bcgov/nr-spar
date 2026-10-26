import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

const smpField = (parentTreeNumber: string, field: string) => cy.get(`#${parentTreeNumber}-${field}-value-input`);

When('I open the {string} tab', (tabName: string) => {
  cy.get('#parent-tree-step-tab-list-id')
    .find('button')
    .contains(tabName)
    .click();
  cy.get('#parentTreeNumber', { timeout: 10000 });
});

Then('the shared SMP default label should be {string}', (text: string) => {
  cy.get('[for="smp-default-vals-checkbox"]')
    .should('have.text', text);
});

Then('shared SMP defaults should be disabled', () => {
  cy.get('#smp-default-vals-checkbox')
    .should('not.be.checked');
});

When('I enable shared SMP defaults', () => {
  cy.get('[for="smp-default-vals-checkbox"]')
    .click();
});

Then('the shared SMP default fields should be visible', () => {
  cy.get('.smp-default-input-row')
    .should('be.visible');
});

When('I enter {string} into the shared {string} default', (value: string, field: string) => {
  const inputId = field === 'smp-success' ? '#default-smp-success-input' : '#default-pollen-contam-input';
  cy.get(inputId)
    .clear();
  cy.get(inputId)
    .type(value)
    .blur();
});

When('I set the shared {string} default to {string}', (field: string, value: string) => {
  const inputId = field === 'smp-success' ? '#default-smp-success-input' : '#default-pollen-contam-input';
  cy.get(inputId)
    .clear();
  cy.get(inputId)
    .type(value)
    .blur();
});

Then('the first five parent trees should have SMP success {string} and pollen contamination {string}', (success: string, pollen: string) => {
  ['212', '219', '222', '223', '224'].forEach((number) => {
    smpField(number, 'smpSuccessPerc')
      .should('have.value', success);
    smpField(number, 'nonOrchardPollenContam')
      .should('have.value', pollen);
  });
});

Then('the SMP success and pollen contamination values for parent trees {string} and {string} should be empty', (first: string, second: string) => {
  [first, second].forEach((number) => {
    smpField(number, 'smpSuccessPerc')
      .should('have.value', '');
    smpField(number, 'nonOrchardPollenContam')
      .should('have.value', '');
  });
});

Then('parent tree {string} should have SMP success {string} and pollen contamination {string}', (number: string, success: string, pollen: string) => {
  smpField(number, 'smpSuccessPerc')
    .should('have.value', success);
  smpField(number, 'nonOrchardPollenContam')
    .should('have.value', pollen);
});

When('I set parent tree {string} SMP success and pollen contamination to {string}', (number: string, value: string) => {
  smpField(number, 'smpSuccessPerc')
    .clear();
  smpField(number, 'smpSuccessPerc')
    .type(value)
    .blur();
  smpField(number, 'nonOrchardPollenContam')
    .clear();
  smpField(number, 'nonOrchardPollenContam')
    .type(value)
    .blur();
});
