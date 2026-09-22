import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { THREE_SECONDS } from '../../constants';
import prefix from '../../../src/styles/classPrefix';

// Shared variables for parent tree calculations state
let seedlotNum: string;
let totalParentTrees: number = 0;
let totalConeCount: number = 0;
let totalPollenCount: number = 0;
let firstConeValue: number = 0;
let firstPollenValue: number = 0;
let effectivePopulationSize: number = 0;

// Reusable element helpers
const parentTreeRows = () => cy.get('.parent-tree-step-table-container-col').find('table tbody tr');

const parentTreeTotalInput = () => cy.get('#totalnumber\\ of\\ parent\\ trees');

const coneTotalInput = () => cy.get('#totalnumber\\ of\\ cone\\ count');

const pollenTotalInput = () => cy.get('#totalnumber\\ of\\ pollen\\ count');

const neInput = () => cy.get('#effectivepopulation\\ size\\ \\(ne\\)');

// Helper: sum a column of inputs across all parent tree rows
const sumColumn = (column: number) => {
  let total = 0;
  return parentTreeRows().each(($row) => {
    cy.wrap($row)
      .find(`td:nth-child(${column}) input`)
      .invoke('val')
      .then((value) => {
        total += Number(value);
      });
  }).then(() => total);
};

// Background steps
Given('I open the A-class registration parent tree step for species {string}', (speciesKey: string) => {
  cy.fixture('aclass-seedlot').then((fData) => {
    cy.task('getData', fData[speciesKey].species).then((sNumber) => {
      seedlotNum = sNumber as string;

      const url = `/seedlots/a-class-registration/${seedlotNum}/?step=5`;
      cy.visit(url);
      cy.url().should('contains', url);

      // Wait for the page title to be visible before proceeding
      cy.get('.title-section h1')
        .should('have.text', `Registration for seedlot ${seedlotNum}`);
    });
  });
});

// Orchard selection
When('I go back to the orchard selection step', () => {
  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .contains('Back')
    .click();
});

When('I select primary orchard {string}', (orchardName: string) => {
  cy.get('#primary-orchard-selection')
    .click();

  cy.get(`.${prefix}--list-box--expanded`)
    .find('ul li')
    .contains(orchardName)
    .click();
});

When('I select female gametic contribution method {string}', (method: string) => {
  cy.get('#orchard-female-gametic')
    .siblings()
    .click();

  cy.get(`.${prefix}--list-box--expanded`)
    .find('ul li')
    .contains(method)
    .click();
});

When('I select male gametic contribution method {string}', (method: string) => {
  cy.get('#orchard-male-gametic')
    .siblings()
    .click();

  cy.get(`.${prefix}--list-box--expanded`)
    .find('ul li')
    .contains(method)
    .click();
});

// Upload CSV file
When('I upload parent tree CSV file {string}', (fileName: string) => {
  // Wait for the table to load
  cy.get('#parentTreeNumber');

  cy.get('button.upload-button')
    .click({ force: true });

  cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
    .should('be.visible');

  cy.get(`.${prefix}--file`)
    .find(`input.${prefix}--file-input`)
    .selectFile(`cypress/fixtures/${fileName}`, { force: true });

  cy.get('button')
    .contains('Import file and continue')
    .click();
});

// Check parent tree contribution summary
Then('the parent tree table should be loaded', () => {
  cy.get(`.${prefix}--data-table > tbody > tr:first-child > td:first-child`)
    .should(($td) => {
      const value = $td.text().trim();
      expect(value, 'cell value should be a number').to.match(/^\d+$/);
    });
});

Then('the total number of parent trees should match the table rows', () => {
  parentTreeRows().then(($rows) => {
    totalParentTrees = $rows.length;

    parentTreeTotalInput()
      .should('have.value', String(totalParentTrees));
  });
});

Then('the total cone count should match the table values', () => {
  sumColumn(2).then((total) => {
    totalConeCount = total;

    coneTotalInput()
      .should('have.value', String(total));
  });
});

Then('the total pollen count should match the table values', () => {
  sumColumn(3).then((total) => {
    totalPollenCount = total;

    pollenTotalInput()
      .should('have.value', String(total));
  });
});

// Calculate metrics
When('I calculate parent tree metrics', () => {
  cy.get('.gen-worth-cal-row')
    .find('button')
    .contains('Calculate metrics')
    .click();

  cy.wait(THREE_SECONDS);
});

Then('I store the effective population size', () => {
  neInput()
    .invoke('val')
    .then((value) => {
      effectivePopulationSize = Number(value);
    });
});

Then('the effective population size should be lower than before', () => {
  neInput()
    .invoke('val')
    .then((value) => {
      expect(Number(value)).to.be.lessThan(effectivePopulationSize);
    });
});

// Remove a single parent tree contribution
When('I clear cone and pollen counts for parent tree {string}', (parentTreeNumber: string) => {
  // Store and clear cone count
  cy.get(`#${parentTreeNumber}-coneCount-value-input`)
    .invoke('val')
    .then((value) => {
      firstConeValue = Number(value);

      cy.get(`#${parentTreeNumber}-coneCount-value-input`)
        .clear()
        .type('0')
        .blur();
    });

  // Store and clear pollen count
  cy.get(`#${parentTreeNumber}-pollenCount-value-input`)
    .invoke('val')
    .then((value) => {
      firstPollenValue = Number(value);

      cy.get(`#${parentTreeNumber}-pollenCount-value-input`)
        .clear()
        .type('0')
        .blur();
    });
});

Then('the parent tree contribution totals should decrease for parent tree {string}', () => {
  // Check new total parent trees
  parentTreeTotalInput()
    .should('have.value', String(totalParentTrees - 1));

  // Check new total cone count
  coneTotalInput()
    .should('have.value', String(totalConeCount - firstConeValue));

  // Check new total pollen count
  pollenTotalInput()
    .should('have.value', String(totalPollenCount - firstPollenValue));
});
