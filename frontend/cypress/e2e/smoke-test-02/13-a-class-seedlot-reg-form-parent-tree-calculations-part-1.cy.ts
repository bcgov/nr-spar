/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable prefer-const */
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
    cy.get('#orchard-female-gametic').siblings().click();

    cy.get(`.${prefix}--list-box--expanded`).find('ul li').contains('F1 - Visual Estimate').click();

    // Select male gametic contribution methodology
    cy.get('#orchard-male-gametic').siblings().click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('M2 - Pollen Volume Estimate by Partial Survey')
      .click();

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Upload csv file', () => {
    // Wait for the table to load
    cy.get('#parentTreeNumber', { timeout: 15000 });

    // Upload csv file
    cy.get('button.upload-button').click({ force: true });

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`).should('be.visible');

    cy.get(`.${prefix}--file`)
      .find(`input.${prefix}--file-input`)
      .selectFile('cypress/fixtures/Seedlot_composition_template_FDI.csv', { force: true });

    cy.get('button').contains('Import file and continue').click();

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Check Parent tree contribution summary', () => {
    // Wait for the table to load
    cy.get(`.${prefix}--data-table > tbody > tr:first-child > td:first-child`, {
      timeout: 10000
    }).should(($td) => {
      const value = $td.text().trim();
      expect(value, 'cell value should be a number').to.match(/^\d+$/);
    });

    // Get all rows
    cy.get(`table.${prefix}--data-table tbody tr`).then((rows) => {
      totalParentTrees = rows.length;

      // Assert total parent trees
      cy.get('#totalnumber\\ of\\ parent\\ trees').should('have.value', totalParentTrees);

      // Reset totals
      coneCount[0] = 0;
      pollenCount[0] = 0;

      // Calculate cone counts
      cy.get('.parent-tree-step-table-container-col table tbody tr')
        .each(($row) => {
          cy.wrap($row)
            .find('td:nth-child(2) input')
            .invoke('val')
            .then((val: any) => {
              coneCount[0] += Number(val);
            });

          cy.wrap($row)
            .find('td:nth-child(3) input')
            .invoke('val')
            .then((val: any) => {
              pollenCount[0] += Number(val);
            });
        })
        .then(() => {
          // Assert totals after all rows are processed
          cy.get('#totalnumber\\ of\\ cone\\ count').should('have.value', coneCount[0]);
          cy.get('#totalnumber\\ of\\ pollen\\ count').should('have.value', pollenCount[0]);
        });
    });

    // Click 'Calculate metrics' button
    cy.get('.gen-worth-cal-row').find('button').contains('Calculate metrics').click();

    // Wait for calculation (adjust if needed)
    cy.wait(3000);

    // Store Ne value to a variable
    cy.get('#effectivepopulation\\ size\\ \\(ne\\)')
      .invoke('val')
      .then(($input: any) => {
        effectivePopulationSize = Number($input);
      });

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Remove a single Parent tree contribution', () => {
    // Wait for the table to load
    cy.get(`.${prefix}--data-table > tbody > tr:first-child > td:first-child`, {
      timeout: 10000
    }).should(($td) => {
      const value = $td.text().trim();
      expect(value, 'cell value should be a number').to.match(/^\d+$/);
    });

    // Store initial total counts
    cy.get('#totalnumber\\ of\\ cone\\ count')
      .invoke('val')
      .then((val: any) => {
        coneCount[0] = Number(val);
      });
    cy.get('#totalnumber\\ of\\ pollen\\ count')
      .invoke('val')
      .then((val: any) => {
        pollenCount[0] = Number(val);
      });

    // Store first row values and clear them
    cy.get('#8021-coneCount-value-input')
      .invoke('val')
      .then((val: any) => {
        firstConeValue = Number(val);
        cy.get('#8021-coneCount-value-input').clear().type('0').blur();
      });

    cy.get('#8021-pollenCount-value-input')
      .invoke('val')
      .then((val: any) => {
        firstPollenValue = Number(val);
        cy.get('#8021-pollenCount-value-input').clear().type('0').blur();
      });

    // After clearing, wait for recalculation (or adjust if app emits event)
    cy.wait(500);

    // Assert totals updated
    cy.get('#totalnumber\\ of\\ cone\\ count').should('have.value', coneCount[0] - firstConeValue);
    cy.get('#totalnumber\\ of\\ pollen\\ count').should(
      'have.value',
      pollenCount[0] - firstPollenValue
    );
    cy.get('#totalnumber\\ of\\ parent\\ trees').should('have.value', totalParentTrees - 1);

    // Click 'Calculate metrics' button again
    cy.get('.gen-worth-cal-row').find('button').contains('Calculate metrics').click();
    cy.wait(3000);

    // Check Ne value after clearing first row
    cy.get('#effectivepopulation\\ size\\ \\(ne\\)')
      .invoke('val')
      .then(($value) => {
        expect(Number($value)).to.be.lessThan(Number(effectivePopulationSize));
      });
  });
});
