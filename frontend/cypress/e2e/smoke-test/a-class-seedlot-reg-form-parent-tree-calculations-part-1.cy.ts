import prefix from '../../../src/styles/classPrefix';

describe('A Class Seedlot Registration form, Parent Tree Calculations Part 1', () => {
  let seedlotNum: string;
  const speciesKey = 'fdi';
  let totalParentTrees: Number = 0;
  let totalConeCount: Number = 0;
  let totalPollenCount: Number = 0;

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

  it('Check Parent tree contribution summary', () => {
    // Wait for the table to load
    cy.get('#parentTreeNumber', { timeout: 10000 });

    cy.get(`table.${prefix}--data-table > tbody`)
    .find('tr')
    .then((row) => {
      totalParentTrees = row.length;
    });

    cy.get(`table.${prefix}--data-table > tbody`)
      .find('tr > td:nth-child(2)')
      .then($cells => {
        // Map each cell text to a number and calculate the sum using Lodash
        const sum = Cypress._.sum(
          $cells.toArray().map(cell => Number(cell.innerText))
        );
        totalConeCount = sum;
        cy.log('Sum of row:', sum);
      });

    cy.get(`table.${prefix}--data-table > tbody`)
      .find('tr > td:nth-child(3)')
      .then($cells => {
        // Map each cell text to a number and calculate the sum using Lodash
        const sum = Cypress._.sum(
          $cells.toArray().map(cell => Number(cell.innerText))
        );
        totalPollenCount = sum;
        cy.log('Sum of row:', sum);
      });

    cy.get('#totalnumber of parent trees')
      .should('have.value', totalParentTrees);

    cy.get('#totalnumber of cone count')
      .should('have.value', totalConeCount);

    cy.get('#totalnumber of pollen count')
      .should('have.value', totalPollenCount);
  });
});
