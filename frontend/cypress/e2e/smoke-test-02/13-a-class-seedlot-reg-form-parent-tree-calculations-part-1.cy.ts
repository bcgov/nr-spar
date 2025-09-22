/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable prefer-const */
import { FIVE_SECONDS, TEN_SECONDS, THREE_SECONDS } from '../../constants';
import prefix from '../../../src/styles/classPrefix';

describe('A Class Seedlot Registration form, Parent Tree Calculations Part 1', () => {
  let seedlotNum: string;
  const speciesKey = 'fdi';
  let totalParentTrees: number = 0;
  let coneCount: number[] = [0];
  let pollenCount: number[] = [0];
  let effectivePopulationSize: number = 0;
  let firstConeValue: number = 0;
  let firstPollenValue: number = 0;

  beforeEach(() => {
    // Login
    cy.login();

    cy.fixture('aclass-seedlot').then((fData) => {
      cy.task('getData', fData[speciesKey].species).then((sNumber) => {
        seedlotNum = sNumber as string;
        const url = `/seedlots/a-class-registration/${seedlotNum}/?step=5`;
        cy.visit(url);
        cy.url().should('contains', url);
        // Wait for the page title to be visible before proceeding
        cy.get('.title-section h1')
          .should('have.text', `Registration for seedlot ${seedlotNum}`, { timeout: FIVE_SECONDS });
      });
    });
  });

  it('Orchard selection', () => {
    // Press next button
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Back')
      .click();

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
    cy.get('#parentTreeNumber', { timeout: TEN_SECONDS });

    // Upload csv file
    cy.get('button.upload-button')
      .click({ force: true });

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .should('be.visible');

    cy.get(`.${prefix}--file`)
      .find(`input.${prefix}--file-input`)
      .selectFile('cypress/fixtures/Seedlot_composition_template_FDI.csv', { force: true });

    cy.get('button')
      .contains('Import file and continue')
      .click();

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Check Parent tree contribution summary', () => {
    // Wait for the table to load
    cy.get(`.${prefix}--data-table > tbody > tr:first-child > td:first-child`, { timeout: TEN_SECONDS })
      .should(($td) => {
        const value = $td.text().trim();
        expect(value, 'cell value should be a number').to.match(/^\d+$/);
      });

    cy.get(`table.${prefix}--data-table`)
      .find('tbody')
      .children('tr')
      .then((row) => {
        totalParentTrees = row.length;
        cy.get('#totalnumber\\ of\\ parent\\ trees')
          .should('have.value', totalParentTrees);
        // Get total cone counts
        for (let i = 0; i < totalParentTrees; i += 1) {
          // Initialize total cone count
          const localParentTreeTotal = totalParentTrees;
          cy.get('.parent-tree-step-table-container-col')
            .find('table tbody tr')
            .eq(i)
            .find('td:nth-child(2) input')
            .invoke('val')
            .then(($value: any) => {
              coneCount[0] += Number($value);
              if (i === (localParentTreeTotal - 1)) {
                // Check total cone counts
                cy.get('#totalnumber\\ of\\ cone\\ count')
                  .should('have.value', coneCount[0]);
              }
            });
        }
        // Get total pollen counts
        for (let i = 0; i < totalParentTrees; i += 1) {
          // Initialize total pollen count
          const localParentTreeTotal = totalParentTrees;
          cy.get('.parent-tree-step-table-container-col')
            .find('table tbody tr')
            .eq(i)
            .find('td:nth-child(3) input') // Assuming pollen count is in the 3rd column
            .invoke('val')
            .then(($value: any) => {
              pollenCount[0] += Number($value);
              if (i === (localParentTreeTotal - 1)) {
                // Check total pollen counts
                cy.get('#totalnumber\\ of\\ pollen\\ count')
                  .should('have.value', pollenCount[0]);
              }
            });
        }
      });

    // Click 'Calculate metrics' button
    cy.get('.gen-worth-cal-row')
      .find('button')
      .contains('Calculate metrics')
      .click();

    cy.wait(THREE_SECONDS);

    // Store Ne value to a variable
    cy.get('#effectivepopulation\\ size\\ \\(ne\\)')
      .invoke('val')
      .then(($input: any) => {
        effectivePopulationSize = $input;
      });

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Remove a single Parent tree contribution', () => {
    // Wait for the table to load
    cy.get(`.${prefix}--data-table > tbody > tr:first-child > td:first-child`, { timeout: TEN_SECONDS })
      .should(($td) => {
        const value = $td.text().trim();
        expect(value, 'cell value should be a number').to.match(/^\d+$/);
      });

    // Store initial value of total cone count
    cy.get('#totalnumber\\ of\\ cone\\ count')
      .invoke('val')
      .then(($input: any) => {
        coneCount[0] = Number($input);
      });

    cy.get('#8021-coneCount-value-input')
      .invoke('val')
      .then(($input: any) => {
        // Store first cone count to a variable
        firstConeValue = $input;

        // Clear cone count of first row
        cy.get('#8021-coneCount-value-input')
          .clear()
          .type('0')
          .blur();

        // Check new total cone count
        cy.get('#totalnumber\\ of\\ cone\\ count')
          .should('have.value', (coneCount[0] - firstConeValue));
      });

    // Store initial value of total pollen count
    cy.get('#totalnumber\\ of\\ pollen\\ count')
      .invoke('val')
      .then(($input: any) => {
        pollenCount[0] = Number($input);
      });

    cy.get('#8021-pollenCount-value-input')
      .invoke('val')
      .then(($input: any) => {
        // Store first pollen count to a variable
        firstPollenValue = $input;

        // Clear pollen count of first row
        cy.get('#8021-pollenCount-value-input')
          .clear()
          .type('0')
          .blur();

        // Check new total parent trees
        cy.get('#totalnumber\\ of\\ parent\\ trees')
          .should('have.value', (totalParentTrees - 1));

        // Check new total pollen count
        cy.get('#totalnumber\\ of\\ pollen\\ count')
          .should('have.value', (pollenCount[0] - firstPollenValue));
      });

    // Click 'Calculate metrics' button again
    cy.get('.gen-worth-cal-row')
      .find('button')
      .contains('Calculate metrics')
      .click();

    cy.wait(THREE_SECONDS);

    // Check Ne value after clearing first parent tree row
    cy.get('#effectivepopulation\\ size\\ \\(ne\\)')
      .invoke('val')
      .then(($value) => {
        expect(Number($value)).to.be.lessThan(Number(effectivePopulationSize));
      });
  });
});
