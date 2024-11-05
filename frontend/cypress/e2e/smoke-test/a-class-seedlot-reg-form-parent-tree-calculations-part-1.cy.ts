import prefix from '../../../src/styles/classPrefix';

describe('A Class Seedlot Registration form, Parent Tree Calculations Part 1', () => {
  let seedlotNum: string;
  const speciesKey = 'fdi';
  let totalParentTrees: number;
  let totalConeCount: number;
  let totalPollenCount: number;
  let effectivePopulationSize: number;
  let firstConeValue: number;
  let firstPollenValue: number;

  beforeEach(() => {
    // Login
    cy.login();

    cy.fixture('aclass-seedlot').then((fData) => {
      cy.task('getData', fData[speciesKey].species).then((sNumber) => {
        seedlotNum = sNumber as string;
        const url = `/seedlots/a-class-registration/${seedlotNum}/?step=5`;
        cy.visit(url);
        cy.url().should('contains', url);
      });
    });
  });

  it('Orchard selection', () => {
    const url = `/seedlots/a-class-registration/${seedlotNum}/?step=4`;
    cy.visit(url);

    cy.get('#primary-orchard-selection')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    // Select primary orchard
    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .as('orchardDropdown')
      .contains('324 - BAILEY - S - PRD')
      .click();

    // Select female gametic contribution methodology
    cy.get('#orchard-female-gametic')
      .siblings()
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('F1 - Visual Estimate')
      .click();

    // Select male gametic contribution methodology
    cy.get('#orchard-male-gametic')
      .siblings()
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('M2 - Pollen Volume Estimate by Partial Survey')
      .click();

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Upload csv file', () => {
    // Wait for the table to load
    cy.get('#parentTreeNumber', { timeout: 10000 });

    // Upload csv file
    cy.get('button.upload-button')
      .click({force: true});

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .should('be.visible');

    cy.get(`.${prefix}--file`)
      .find(`input.${prefix}--file-input`)
      .selectFile('cypress/fixtures/Seedlot_composition_template_FDI.csv', {force: true});

    cy.get('button')
      .contains('Import file and continue')
      .click();

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Check Parent tree contribution summary', () => {
    // Wait for the table to load
    cy.get('#parentTreeNumber', { timeout: 10000 });

    cy.get(`table.${prefix}--data-table > tbody`)
      .find('tr')
      .then((row) => {
        totalParentTrees = row.length;
      });

    cy.get('input[id$="-coneCount-value-input"]') // Select all inputs in coneCount column
      .then($inputs => {
        // Extract values, convert them to numbers, and calculate the sum using Lodash
        const sum = Cypress._.sum(
          $inputs.toArray().map(input => Number(input.innerText))
        );
    
        totalConeCount = sum;
        cy.log('Sum of coneCount column:', sum);
      });

    cy.get('input[id$="-pollenCount-value-input"]') // Select all inputs in pollenCount column
      .then($inputs => {
        // Extract values, convert them to numbers, and calculate the sum using Lodash
        const sum = Cypress._.sum(
          $inputs.toArray().map(input => Number(input.innerText))
        );
    
        totalPollenCount = sum;
        cy.log('Sum of pollenCount column:', sum);
      });

    cy.get('#totalnumber of parent trees')
      .should('have.value', totalParentTrees);

    cy.get('#totalnumber of cone count')
      .should('have.value', totalConeCount);

    cy.get('#totalnumber of pollen count')
      .should('have.value', totalPollenCount);

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Remove a single Parent tree contribution', () => {
    // Wait for the table to load
    cy.get('#parentTreeNumber', { timeout: 10000 });

    // Click 'Calculate metrics' button
    cy.get('.gen-worth-cal-row')
      .find('button')
      .contains('Calculate metrics')
      .click();

    // Store Ne value to a variable
    cy.get('#effectivepopulation size (ne)')
      .invoke('val')
      .then(($input: any) => {
        effectivePopulationSize = $input;
      });

    // Store first cone count to a variable
    cy.get('#8021-coneCount-value-input')
      .invoke('val')
      .then(($input: any) => {
        firstConeValue = $input;
      });

    // Store first pollen count to a variable
    cy.get('#8021-pollenCount-value-input')
      .invoke('val')
      .then(($input: any) => {
        firstPollenValue = $input;
      });

    // Clear cone count and pollen count of first row
    cy.get('#8021-coneCount-value-input')
      .clear()
      .type('0');

    cy.get('#8021-pollenCount-value-input')
      .clear()
      .type('0');

    cy.get('#totalnumber of parent trees')
      .should('have.value', (totalParentTrees - 1));

    cy.get('#totalnumber of cone count')
      .should('have.value', (totalConeCount - firstConeValue));

    cy.get('#totalnumber of pollen count')
      .should('have.value', (totalPollenCount - firstPollenValue));

    // Click 'Calculate metrics' button again
    cy.get('.gen-worth-cal-row')
      .find('button')
      .contains('Calculate metrics')
      .click();

    // Check Ne value after clearing first parent tree row
    cy.get('#effectivepopulation size (ne)')
      .should('be.lessThan', effectivePopulationSize);
  });
});
