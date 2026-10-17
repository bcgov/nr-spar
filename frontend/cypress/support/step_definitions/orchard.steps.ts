import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';
import { THIRTY_SECONDS, TYPE_DELAY } from '../../constants';

const PARENT_TREE_COUNT = 6;
const storedParentTrees = new Set<string>();

// Orchard/gamete selection steps are reused from parent-tree-calculations-part-1.steps.ts

Given('I open A-class registration step {int} for species {string}', (step: number, speciesKey: string) => {
  cy.fixture('aclass-seedlot').then((fData) => {
    cy.task('getData', fData[speciesKey].species).then((sNumber) => {
      const url = `/seedlots/a-class-registration/${sNumber}/?step=${step}`;
      cy.visit(url);
      cy.url().should('contains', url);
    });
  });
});

Then('the orchard step title should be {string}', (title: string) => {
  cy.get('.seedlot-orchard-title-row').find('h2').eq(0).should('have.text', title);
});

Then('the orchard step subtitle should be {string}', (subtitle: string) => {
  cy.get('.seedlot-orchard-title-row').find('.subtitle-section').eq(0).should('have.text', subtitle);
});

When('I clear the primary orchard', () => {
  cy.get('#primary-orchard-selection')
    .siblings(`button.${prefix}--list-box__selection[title="Clear selected item"]`)
    .click();
});

Then('the {string} modal should be visible', (label: string) => {
  cy.get(`.${prefix}--modal-container[aria-label="${label}"]`).should('be.visible');
});

When('I click {string} in the {string} modal', (button: string, label: string) => {
  cy.get(`.${prefix}--modal-container[aria-label="${label}"]`)
    .find(`button.${prefix}--btn`)
    .contains(button)
    .click();
});

Then('the primary orchard should be empty', () => {
  cy.get('#primary-orchard-selection').should('have.value', '');
});

Then('the female and male gametic methods should be empty', () => {
  cy.get('#orchard-female-gametic').should('have.value', '');
  cy.get('#orchard-male-gametic').should('have.value', '');
});

Then('the controlled cross and biotech options should be {string}', (option: string) => {
  cy.get(`#controlled-cross-${option}`).should('be.checked');
  cy.get(`#biotech-${option}`).should('be.checked');
});

Then('the female gametic method should be {string}', (method: string) => {
  cy.get('#orchard-female-gametic').should('have.value', method);
});

Then('the male gametic method should be {string}', (method: string) => {
  cy.get('#orchard-male-gametic').should('have.value', method);
});

Then('the gamete section title should be {string}', (text: string) => {
  cy.get('.seedlot-gamete-title-row').find('h2').should('have.text', text);
});

Then('the gamete section subtitle should be {string}', (text: string) => {
  cy.get('.seedlot-gamete-title-row').find('.subtitle-section').should('have.text', text);
});

Then('the pollen section title should be {string}', (text: string) => {
  cy.get('.seedlot-orchard-title-row').find('h2').eq(1).should('have.text', text);
});

Then('the pollen section subtitle should be {string}', (text: string) => {
  cy.get('.seedlot-orchard-title-row').find('.subtitle-section').eq(1).should('have.text', text);
});

Then('the {string} modal heading should be {string}', (label: string, text: string) => {
  cy.get(`.${prefix}--modal-container[aria-label="${label}"]`)
    .find(`h2.${prefix}--modal-header__heading`)
    .should('have.text', text);
});

// Secondary orchard
When('I add an additional orchard', () => {
  cy.get('.seedlot-orchard-add-orchard')
    .find('button')
    .contains('Add additional orchard')
    .click();
});

Then('the secondary orchard label should be {string}', (text: string) => {
  cy.get(`label.${prefix}--label[for="secondary-orchard-selection"]`).should('have.text', text);
});

When('I select secondary orchard {string}', (orchardName: string) => {
  cy.get('#secondary-orchard-selection').click();

  cy.get(`.${prefix}--list-box--expanded`)
    .find('ul li')
    .contains(orchardName)
    .click();
});

When('I delete the secondary orchard', () => {
  cy.get('.seedlot-orchard-add-orchard')
    .find('button')
    .contains('Delete secondary orchard')
    .click();
});

Then('the secondary orchard should not exist', () => {
  cy.get('#secondary-orchard-selection').should('not.exist');
});

// Progress bar navigation and parent tree linkage
When('I go to the {string} step from the progress bar', (stepName: string) => {
  const isParentTree = stepName === 'Parent tree and SMP';
  if (isParentTree) {
    cy.intercept('GET', '**/api/parent-trees/vegetation-codes/*').as('parentTreesUnderVegCode');
  }

  cy.get('.seedlot-registration-progress')
    .find(`button.${prefix}--progress-step-button`)
    .contains(stepName)
    .click();

  if (isParentTree) {
    cy.wait('@parentTreesUnderVegCode', { timeout: THIRTY_SECONDS })
      .its('response.statusCode')
      .should('equal', 200);
    cy.get('#parentTreeNumber');
  }
});

const readFirstParentTrees = () => {
  const numbers: string[] = [];
  for (let i = 0; i < PARENT_TREE_COUNT; i += 1) {
    cy.get('.parent-tree-step-table-container-col')
      .find('table tbody tr')
      .eq(i)
      .find('td:nth-child(1)')
      .invoke('text')
      .then((text) => numbers.push(text));
  }
  return cy.wrap(numbers);
};

When('I store the first 6 parent tree numbers', () => {
  readFirstParentTrees().then((numbers) => {
    numbers.forEach((n) => storedParentTrees.add(n));
  });
});

Then('the first 6 parent trees should match the combined stored parent trees', () => {
  readFirstParentTrees().then((numbers) => {
    const expected = Array.from(storedParentTrees)
      .sort((a, b) => Number(a) - Number(b))
      .slice(0, PARENT_TREE_COUNT);
    storedParentTrees.clear();
    expect(numbers).to.deep.eq(expected);
  });
});

// Gamete options
When('I choose {string} for controlled cross and biotech', (option: string) => {
  cy.get(`#controlled-cross-${option}`).check({ force: true });
  cy.get(`#biotech-${option}`).check({ force: true });
});

When('I clear the {string} gametic method', (gamete: string) => {
  cy.get(`#orchard-${gamete}-gametic`)
    .siblings('button[title="Clear selected item"]')
    .click();
});

Then('the {string} gametic method should be empty', (gamete: string) => {
  cy.get(`#orchard-${gamete}-gametic`).should('have.value', '');
});

// Pollen information
Then('the pollen contaminant option should be {string}', (option: string) => {
  cy.get(`#pollen-contam-${option}`).should('be.checked');
});

Then('the pollen breeding percentage fields should not exist', () => {
  cy.get('#orchard-breading-perc').should('not.exist');
  cy.get('#orchard-is-regional').should('not.exist');
});

When('I choose {string} for pollen contaminant', (option: string) => {
  cy.get(`#pollen-contam-${option}`).check({ force: true }).should('be.checked');
});

Then('the pollen breeding percentage fields should be visible', () => {
  cy.get('#orchard-breading-perc').should('be.visible');
  cy.get('#orchard-is-regional').should('be.visible').and('be.checked');
});

Then('the pollen helper text should be {string}', (text: string) => {
  cy.get('#orchard-breading-perc-helper-text').should('have.text', text);
});

When('I enter pollen breeding percentage {string}', (value: string) => {
  cy.get('#orchard-breading-perc').clear().type(value, { delay: TYPE_DELAY }).blur();
});

Then('the pollen error should be {string}', (text: string) => {
  cy.get('#orchard-breading-perc-error-msg').should('have.text', text);
});

// Step completion
Then('the {string} progress step should be marked complete', (stepName: string) => {
  cy.contains(`.${prefix}--progress-step-button`, stepName)
    .find(`.${prefix}--assistive-text`)
    .should('contain.text', 'Complete');
});

When('I go to the next registration step', () => {
  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .contains('Next')
    .click();
});

Then('the {string} progress step should be completed', (stepName: string) => {
  cy.get(`.${prefix}--progress-step--complete`)
    .contains(stepName)
    .should('be.visible');
});
