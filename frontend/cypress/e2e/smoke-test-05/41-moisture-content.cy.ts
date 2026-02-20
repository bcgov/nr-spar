import {
  HALF_SECOND, ONE_SECOND, TEN_SECONDS, TYPE_DELAY
} from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { mockMoistureContentApi } from '../../support/mockApiConsep';
import { MoistureContentType, SeedlotReplicateInfoType } from '../../definitions';

describe('Moisture Content Screen page', () => {
  let mcData: MoistureContentType;
  let seedlotData: SeedlotReplicateInfoType;
  beforeEach(() => {
    cy.fixture('moisture-content').then((jsonData) => {
      mcData = jsonData;
    });
    cy.fixture('seedlot-replicate-info').then((jsonData) => {
      seedlotData = jsonData;
    });
    mockMoistureContentApi();
    cy.login();
    cy.visit('/consep/manual-moisture-content/514330');
    cy.url().should('contains', '/consep/manual-moisture-content/514330');
  });

  it('should load and display manual moisture content page correctly', () => {
    // Check if the page title is displayed correctly
    cy.get('.consep-moisture-content-title')
      .find('h1')
      .contains(mcData.mc.title);

    // Check if the table title is displayed correctly
    cy.get('.activity-result-actions-title')
      .find('h3')
      .contains(mcData.table.title);
  });

  it('should display breadcrumbs correctly', () => {
    cy.get('.consep-moisture-content-breadcrumb')
      .find('li')
      .should('have.length', 3)
      .and('contain', 'CONSEP')
      .and('contain', 'Testing activities search')
      .and('contain', 'Testing list');
  });

  it('should display Activity summary section correctly', () => {
    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(0)
      .should('have.text', seedlotData.activityType);

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(1)
      .should('have.text', seedlotData.seedlotNumber);

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(2)
      .should('have.text', seedlotData.requestId);

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(3)
      .should('have.text', `${seedlotData.vegetationCode} | ${seedlotData.geneticClassCode}`);

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(4)
      .should('have.text', seedlotData.moisturePct);
  });

  it('Check Activity results table validation', () => {
    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    cy.get('.activity-result-container tbody tr')
      .should('have.length', 3);

    // Add a new row
    cy.contains('button', 'Add row').click();

    cy.get('.activity-result-container tbody tr')
      .should('have.length', 4);

    // Always re-query the last row
    const lastRow = () => cy.get('.activity-result-container tbody tr').last();

    // Container ID validation
    lastRow()
      .find('input[name="containerId"]')
      .clear()
      .type('10011', { delay: TYPE_DELAY });

    lastRow()
      .find('p.Mui-error')
      .should('contain', mcData.table.containerErrorMsg);

    lastRow()
      .find('input[name="containerId"]')
      .clear()
      .type('15', { delay: TYPE_DELAY });

    // Check validation of Container weight input
    lastRow()
      .find('input[name="containerWeight"]')
      .clear()
      .type('10011', { delay: TYPE_DELAY });

    lastRow()
      .find('p.Mui-error')
      .should('contain', mcData.table.containerWeightErrorMsg);

    lastRow()
      .find('input[name="containerWeight"]')
      .clear()
      .type('20', { delay: TYPE_DELAY });

    // Fresh seed validation
    lastRow()
      .find('input[name="freshSeed"]')
      .clear()
      .type('10011', { delay: TYPE_DELAY });

    lastRow()
      .find('p.Mui-error')
      .should('contain', mcData.table.containerWeightErrorMsg);

    lastRow()
      .find('input[name="freshSeed"]')
      .clear()
      .type('30', { delay: TYPE_DELAY });

    // Container + Dry seed validation
    lastRow()
      .find('input[name="containerAndDryWeight"]')
      .clear()
      .type('10011', { delay: TYPE_DELAY });

    lastRow()
      .find('p.Mui-error')
      .should('contain', mcData.table.containerWeightErrorMsg);

    lastRow()
      .find('input[name="containerAndDryWeight"]')
      .clear()
      .type('38', { delay: TYPE_DELAY });
  });

  it('Check Activity results table button functionality', () => {
    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Check if the table has the correct number of rows
    cy.get('.activity-result-container tbody tr')
      .should('have.length', 3);

    // Add row
    cy.contains('button', 'Add row').click();

    cy.get('.activity-result-container tbody tr')
      .should('have.length', 4);

    // Delete last row (re-query)
    cy.get('.activity-result-container tbody tr')
      .last()
      .find('td:nth-last-child(1) svg')
      .click();

    // Wait for the delete API to finish
    cy.wait('@deleteReplicate');

    // Assert row count stabilizes
    cy.get('.activity-result-container tbody tr')
      .should('have.length', 3);

    // Accept checkbox
    cy.get('.activity-result-container tbody tr')
      .first()
      .find('td:nth-child(8) input')
      .as('acceptCheckbox')
      .should('be.checked');

    cy.get('@acceptCheckbox').click();

    cy.get('@acceptCheckbox')
      .siblings('svg')
      .should('have.attr', 'data-testid', mcData.table.unCheckedBox);

    cy.get('@acceptCheckbox').click();

    cy.get('@acceptCheckbox')
      .siblings('svg')
      .should('have.attr', 'data-testid', mcData.table.checkedBox);

    // Accept all
    cy.contains('button', 'Accept all').click();

    cy.get('@acceptCheckbox')
      .siblings('svg')
      .should('have.attr', 'data-testid', mcData.table.checkedBox);

    // Comment input
    cy.get('.activity-result-container tbody tr')
      .first()
      .find('td:nth-child(9) input')
      .clear()
      .type(mcData.mc.testComment, { delay: TYPE_DELAY })
      .blur()
      .should('have.value', mcData.mc.testComment);

    // Clear data
    cy.contains('button', 'Clear data').click();

    cy.get('.activity-result-notification')
      .contains('Clear')
      .click();

    cy.get('.activity-result-container tbody tr')
      .should('contain.text', mcData.table.emptyTableMsg);
  });

  it('Check sorting by Replicate number', () => {
    let ascendingFirstRow: string;
    let descendingFirstRow: string;

    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Check descending sorting functionality of 'Replicate' column
    cy.get('.activity-result-container')
      .find('thead tr')
      .find('th div')
      .as('tableHeading')
      .contains(mcData.table.column1)
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(1)')
      .then(($replicateNum) => {
        descendingFirstRow = $replicateNum.text();
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(1)')
      .then(($replicateNum) => {
        const descendingSecondRow: string = $replicateNum.text();
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });

    // Check ascending sorting functionality of 'Replicate' column
    cy.get('@tableHeading')
      .contains(mcData.table.column1)
      .click();

    cy.get('@firstRow')
      .find('td:nth-child(1)')
      .then(($replicateNum) => {
        ascendingFirstRow = $replicateNum.text();
      });

    cy.get('@secondRow')
      .find('td:nth-child(1)')
      .then(($replicateNum) => {
        const ascendingSecondRow: string = $replicateNum.text();
        expect(parseInt(ascendingFirstRow, 10))
          .to.be.lessThan(parseInt(ascendingSecondRow, 10));
      });
  });

  it('Check sorting by Container number', () => {
    let ascendingFirstRow: string;
    let descendingFirstRow: string;

    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Check ascending sorting functionality of 'Container' column
    cy.get('.activity-result-container')
      .find('thead tr')
      .find('th div')
      .as('tableHeading')
      .contains(mcData.table.column2)
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(2) input')
      .invoke('val')
      .then(($containerNum: any) => {
        ascendingFirstRow = $containerNum;
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(2) input')
      .invoke('val')
      .then(($containerNum: any) => {
        const ascendingSecondRow: string = $containerNum;
        expect(parseInt(ascendingFirstRow, 10))
          .to.be.lessThan(parseInt(ascendingSecondRow, 10));
      });

    // Check descending sorting functionality of 'Container' column
    cy.get('@tableHeading')
      .contains(mcData.table.column2)
      .click();

    cy.get('@firstRow')
      .find('td:nth-child(2) input')
      .invoke('val')
      .then(($containerNum: any) => {
        descendingFirstRow = $containerNum;
      });

    cy.get('@secondRow')
      .find('td:nth-child(2) input')
      .invoke('val')
      .then(($containerNum: any) => {
        const descendingSecondRow: string = $containerNum;
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });
  });

  it('Check sorting by Container weight', () => {
    let ascendingFirstRow: string;
    let descendingFirstRow: string;

    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Check descending sorting functionality of 'Container weight' column
    cy.get('.activity-result-container')
      .find('thead tr')
      .find('th div')
      .as('tableHeading')
      .contains(mcData.table.column3)
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(3) input')
      .invoke('val')
      .then(($containerWt: any) => {
        descendingFirstRow = $containerWt;
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(3) input')
      .invoke('val')
      .then(($containerWt: any) => {
        const descendingSecondRow: string = $containerWt;
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });

    // Check ascending sorting functionality of 'Container weight' column
    cy.get('@tableHeading')
      .contains(mcData.table.column3)
      .click();

    cy.get('@firstRow')
      .find('td:nth-child(3) input')
      .invoke('val')
      .then(($containerWt: any) => {
        ascendingFirstRow = $containerWt;
      });

    cy.get('@secondRow')
      .find('td:nth-child(3) input')
      .invoke('val')
      .then(($containerWt: any) => {
        const ascendingSecondRow: string = $containerWt;
        expect(parseInt(ascendingFirstRow, 10))
          .to.be.lessThan(parseInt(ascendingSecondRow, 10));
      });
  });

  it('Check sorting by Fresh seed', () => {
    let ascendingFirstRow: string;
    let descendingFirstRow: string;

    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Check descending sorting functionality of 'Fresh seed' column
    cy.get('.activity-result-container')
      .find('thead tr')
      .find('th div')
      .as('tableHeading')
      .contains(mcData.table.column4)
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(4) input')
      .invoke('val')
      .then(($freshSeed: any) => {
        descendingFirstRow = $freshSeed;
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(4) input')
      .invoke('val')
      .then(($freshSeed: any) => {
        const descendingSecondRow: string = $freshSeed;
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });

    // Check ascending sorting functionality of 'Fresh seed' column
    cy.get('@tableHeading')
      .contains(mcData.table.column4)
      .click();

    cy.get('@firstRow')
      .find('td:nth-child(4) input')
      .invoke('val')
      .then(($freshSeed: any) => {
        ascendingFirstRow = $freshSeed;
      });

    cy.get('@secondRow')
      .find('td:nth-child(4) input')
      .invoke('val')
      .then(($freshSeed: any) => {
        const ascendingSecondRow: string = $freshSeed;
        expect(parseInt(ascendingFirstRow, 10))
          .to.be.lessThan(parseInt(ascendingSecondRow, 10));
      });
  });

  it('Check sorting by Cont + Dry seed', () => {
    let ascendingFirstRow: string;
    let descendingFirstRow: string;

    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Check descending sorting functionality of 'Cont + Dry seed' column
    cy.get('.activity-result-container')
      .find('thead tr')
      .find('th div')
      .as('tableHeading')
      .contains(mcData.table.column5)
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(5) input')
      .invoke('val')
      .then(($contDrySeed: any) => {
        descendingFirstRow = $contDrySeed;
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(5) input')
      .invoke('val')
      .then(($contDrySeed: any) => {
        const descendingSecondRow: string = $contDrySeed;
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });

    // Check ascending sorting functionality of 'Cont + Dry seed' column
    cy.get('@tableHeading')
      .contains(mcData.table.column5)
      .click();

    cy.get('@firstRow')
      .find('td:nth-child(5) input')
      .invoke('val')
      .then(($contDrySeed: any) => {
        ascendingFirstRow = $contDrySeed;
      });

    cy.get('@secondRow')
      .find('td:nth-child(5) input')
      .invoke('val')
      .then(($contDrySeed: any) => {
        const ascendingSecondRow: string = $contDrySeed;
        expect(parseInt(ascendingFirstRow, 10))
          .to.be.lessThan(parseInt(ascendingSecondRow, 10));
      });
  });

  it('Check sorting by Dry weight', () => {
    let ascendingFirstRow: string;
    let descendingFirstRow: string;

    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Check descending sorting functionality of 'Dry weight' column
    cy.get('.activity-result-container')
      .find('thead tr')
      .find('th div')
      .as('tableHeading')
      .contains(mcData.table.column6)
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(6)')
      .invoke('text')
      .then(($dryWt: any) => {
        descendingFirstRow = $dryWt;
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(6)')
      .invoke('text')
      .then(($dryWt: any) => {
        const descendingSecondRow: string = $dryWt;
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });

    // Check ascending sorting functionality of 'Dry weight' column
    cy.get('@tableHeading')
      .contains(mcData.table.column6)
      .click();

    cy.get('@firstRow')
      .find('td:nth-child(6)')
      .invoke('text')
      .then(($dryWt: any) => {
        ascendingFirstRow = $dryWt;
      });

    cy.get('@secondRow')
      .find('td:nth-child(6)')
      .invoke('text')
      .then(($dryWt: any) => {
        const ascendingSecondRow: string = $dryWt;
        expect(parseInt(ascendingFirstRow, 10))
          .to.be.lessThan(parseInt(ascendingSecondRow, 10));
      });
  });

  it('Check sorting by MC value (%)', () => {
    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Find the 'MC value (%)' column header dynamically
    cy.get('.activity-result-container thead tr')
      .find('th div')
      .contains(mcData.table.column7)
      .as('mcHeader');

    // ----- Ascending sort -----
    cy.get('@mcHeader').click(); // click to sort ascending

    // Re-query the first two rows after table re-render
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(7)')
      .invoke('text')
      .then((ascendingFirstRow) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(7)')
          .invoke('text')
          .then((ascendingSecondRow) => {
            expect(parseFloat(ascendingFirstRow)).to.be.lessThan(parseFloat(ascendingSecondRow));
          });
      });

    // ----- Descending sort -----
    cy.get('@mcHeader').click(); // click again to sort descending

    // Re-query the first two rows again after table re-render
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(7)')
      .invoke('text')
      .then((descendingFirstRow) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(7)')
          .invoke('text')
          .then((descendingSecondRow) => {
            expect(parseFloat(descendingFirstRow)).to.be.greaterThan(
              parseFloat(descendingSecondRow)
            );
          });
      });
  });

  it('Check Dry weight value', () => {
    let containerWt: string;
    let contDrySeed: string;

    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(3) input')
      .invoke('val')
      .then(($value: any) => {
        containerWt = $value;
      });

    cy.get('@firstRow')
      .find('td:nth-child(5) input')
      .invoke('val')
      .then(($value: any) => {
        contDrySeed = $value;
      });

    cy.get('@firstRow')
      .find('td:nth-child(6)')
      .invoke('text')
      .then(($text: any) => {
        const dryWt = $text;
        expect(parseInt(contDrySeed, 10) - parseInt(containerWt, 10))
          .to.be.equal(parseInt(dryWt, 10));
      });
  });

  it('Check MC value(%) calculation', () => {
    let freshSeed: string;
    let dryWt: string;

    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(4) input')
      .invoke('val')
      .then(($value: any) => {
        freshSeed = $value;
      });

    cy.get('@firstRow')
      .find('td:nth-child(6)')
      .invoke('text')
      .then(($value: any) => {
        dryWt = $value;
      });

    cy.get('@firstRow')
      .find('td:nth-child(7)')
      .invoke('text')
      .then(($text: any) => {
        const mcValue = $text;
        // eslint-disable-next-line max-len
        const expectedMcValue = ((parseInt(freshSeed, 10) - parseInt(dryWt, 10)) / parseInt(freshSeed, 10)) * 100;
        expect(Math.round(expectedMcValue))
          .to.be.equal(parseInt(mcValue, 10));
      });
  });

  it('Check Calculate average button functionality', () => {
    cy.intercept(
      'POST',
      '**/api/moisture-content-cone/514330/calculate-average'
    ).as('postCalcAvg');

    cy.waitForTableData('.activity-result-container');

    cy.get('.activity-result-container tbody tr').then(($rows) => {
      const mcValues: number[] = [];

      Cypress.$($rows).each((_, row) => {
        const mcText = Cypress.$(row)
          .find('td:nth-child(7)')
          .text()
          .trim();

        const mcNum = parseFloat(mcText);
        if (!Number.isNaN(mcNum)) {
          mcValues.push(mcNum);
        }
      });

      expect(mcValues.length, 'MC values should exist').to.be.greaterThan(0);

      const sum = mcValues.reduce((acc, val) => acc + val, 0);
      const averageMcValues = sum / mcValues.length;

      // Click AFTER calculation
      cy.contains('button', 'Calculate average').click();

      cy.wait('@postCalcAvg')
        .its('response.statusCode')
        .should('eq', 200);

      // Assert UI inside same chain
      cy.get('.activity-summary-info-value')
        .eq(4)
        .should('have.text', averageMcValues.toFixed(2));
    });
  });

  it('should have correct Date functionality and validations', () => {
    // Check if the date input has a placeholder
    cy.get(`.${prefix}--date-picker-container`)
      .find('input')
      .should('have.attr', 'placeholder', 'yyyy/mm/dd');

    cy.get('#moisture-content-end-date-picker')
      .click();

    cy.get('.flatpickr-calendar.open')
      .find('.flatpickr-days')
      .contains('11')
      .click();

    // Invalid start date
    cy.get('#moisture-content-start-date-picker')
      .click();

    cy.get('.flatpickr-calendar.open')
      .find('.flatpickr-days')
      .contains('15')
      .click();

    // Check invalid date error message
    cy.get(`.${prefix}--date-picker-container`)
      .find(`.${prefix}--form-requirement`)
      .should('contain.text', mcData.mc.invalidDateErrorMsg);

    // Valid start date
    cy.get('#moisture-content-start-date-picker')
      .click();

    cy.get('.flatpickr-calendar.open')
      .find('.flatpickr-days')
      .contains('10')
      .click();
  });

  it('should check comment box', () => {
    // Check if the comment input exists
    cy.get('#moisture-content-comments').should('be.visible');

    // Type a comment
    cy.get('#moisture-content-comments')
      .clear()
      .type(mcData.mc.testComment, { delay: TYPE_DELAY })
      .blur()
      .should('have.value', mcData.mc.testComment);
  });
});
