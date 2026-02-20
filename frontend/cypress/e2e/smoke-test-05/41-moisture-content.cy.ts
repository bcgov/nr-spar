import { TYPE_DELAY } from '../../constants';
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
    cy.wait('@DELETE_replicate');

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
    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Click header to sort descending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column1)
      .click();

    // Re-query first two rows after descending sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($first) => {
        const descendingFirstRow = $first.text();
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(1)')
          .then(($second) => {
            const descendingSecondRow = $second.text();
            expect(parseInt(descendingFirstRow, 10))
              .to.be.greaterThan(parseInt(descendingSecondRow, 10));
          });
      });

    // Click header again to sort ascending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column1)
      .click();

    // Re-query first two rows after ascending sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($first) => {
        const ascendingFirstRow = $first.text();
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(1)')
          .then(($second) => {
            const ascendingSecondRow = $second.text();
            expect(parseInt(ascendingFirstRow, 10))
              .to.be.lessThan(parseInt(ascendingSecondRow, 10));
          });
      });
  });

  it('Check sorting by Container number', () => {
    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Click header to sort ascending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column2)
      .click();

    // Re-query the first two rows after sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(2) input')
      .invoke('val')
      .then((firstVal: any) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(2) input')
          .invoke('val')
          .then((secondVal: any) => {
            expect(parseInt(firstVal, 10)).to.be.lessThan(parseInt(secondVal, 10));
          });
      });

    // Click header again to sort descending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column2)
      .click();

    // Re-query the first two rows after descending sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(2) input')
      .invoke('val')
      .then((firstVal: any) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(2) input')
          .invoke('val')
          .then((secondVal: any) => {
            expect(parseInt(firstVal, 10)).to.be.greaterThan(parseInt(secondVal, 10));
          });
      });
  });

  it('Check sorting by Container weight', () => {
    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Click header to sort descending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column3)
      .click();

    // Re-query first two rows after descending sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(3) input')
      .invoke('val')
      .then((descendingFirstRow: any) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(3) input')
          .invoke('val')
          .then((descendingSecondRow: any) => {
            expect(parseInt(descendingFirstRow, 10))
              .to.be.greaterThan(parseInt(descendingSecondRow, 10));
          });
      });

    // Click header again to sort ascending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column3)
      .click();

    // Re-query first two rows after ascending sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(3) input')
      .invoke('val')
      .then((ascendingFirstRow: any) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(3) input')
          .invoke('val')
          .then((ascendingSecondRow: any) => {
            expect(parseInt(ascendingFirstRow, 10))
              .to.be.lessThan(parseInt(ascendingSecondRow, 10));
          });
      });
  });

  it('Check sorting by Fresh seed', () => {
    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Click header to sort descending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column4)
      .click();

    // Re-query first two rows after descending sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(4) input')
      .invoke('val')
      .then((descendingFirstRow: any) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(4) input')
          .invoke('val')
          .then((descendingSecondRow: any) => {
            expect(parseInt(descendingFirstRow, 10))
              .to.be.greaterThan(parseInt(descendingSecondRow, 10));
          });
      });

    // Click header again to sort ascending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column4)
      .click();

    // Re-query first two rows after ascending sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(4) input')
      .invoke('val')
      .then((ascendingFirstRow: any) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(4) input')
          .invoke('val')
          .then((ascendingSecondRow: any) => {
            expect(parseInt(ascendingFirstRow, 10))
              .to.be.lessThan(parseInt(ascendingSecondRow, 10));
          });
      });
  });

  it('Check sorting by Cont + Dry seed', () => {
    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Click header to sort descending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column5)
      .click();

    // Re-query first two rows after descending sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(5) input')
      .invoke('val')
      .then((descendingFirstRow: any) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(5) input')
          .invoke('val')
          .then((descendingSecondRow: any) => {
            expect(parseInt(descendingFirstRow, 10))
              .to.be.greaterThan(parseInt(descendingSecondRow, 10));
          });
      });

    // Click header again to sort ascending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column5)
      .click();

    // Re-query first two rows after ascending sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(5) input')
      .invoke('val')
      .then((ascendingFirstRow: any) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(5) input')
          .invoke('val')
          .then((ascendingSecondRow: any) => {
            expect(parseInt(ascendingFirstRow, 10))
              .to.be.lessThan(parseInt(ascendingSecondRow, 10));
          });
      });
  });

  it('Check sorting by Dry weight', () => {
    // Wait for table to have at least one row with content
    cy.waitForTableData('.activity-result-container');

    // Click header to sort descending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column6)
      .click();

    // Re-query first two rows after descending sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(6)')
      .invoke('text')
      .then((descendingFirstRow: any) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(6)')
          .invoke('text')
          .then((descendingSecondRow: any) => {
            expect(parseInt(descendingFirstRow, 10))
              .to.be.greaterThan(parseInt(descendingSecondRow, 10));
          });
      });

    // Click header again to sort ascending
    cy.get('.activity-result-container thead tr th div')
      .contains(mcData.table.column6)
      .click();

    // Re-query first two rows after ascending sort
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .find('td:nth-child(6)')
      .invoke('text')
      .then((ascendingFirstRow: any) => {
        cy.get('.activity-result-container tbody tr')
          .eq(1)
          .find('td:nth-child(6)')
          .invoke('text')
          .then((ascendingSecondRow: any) => {
            expect(parseInt(ascendingFirstRow, 10))
              .to.be.lessThan(parseInt(ascendingSecondRow, 10));
          });
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
    // Wait for table to have at least one row
    cy.waitForTableData('.activity-result-container');

    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .as('firstRow');

    // Capture container weight
    cy.get('@firstRow')
      .find('td:nth-child(3) input')
      .invoke('val')
      .as('containerWt');

    // Capture container + dry seed weight
    cy.get('@firstRow')
      .find('td:nth-child(5) input')
      .invoke('val')
      .as('contDrySeed');

    // Capture dry weight displayed
    cy.get('@firstRow')
      .find('td:nth-child(6)')
      .invoke('text')
      .then((dryWtText) => {
        // Use aliases to get the values
        cy.get('@containerWt').then((containerWt: any) => {
          cy.get('@contDrySeed').then((contDrySeed: any) => {
            const expectedDry = parseFloat(contDrySeed) - parseFloat(containerWt);
            const actualDry = parseFloat(dryWtText);

            expect(actualDry, 'Dry weight calculation').to.eq(expectedDry);
          });
        });
      });
  });

  it('Check MC value(%) calculation', () => {
    // Wait for table to have at least one row
    cy.waitForTableData('.activity-result-container');

    // Get first row
    cy.get('.activity-result-container tbody tr')
      .eq(0)
      .as('firstRow');

    // Capture freshSeed value (column 4)
    cy.get('@firstRow')
      .find('td:nth-child(4) input')
      .invoke('val')
      .as('freshSeed');

    // Capture dry weight (column 6)
    cy.get('@firstRow')
      .find('td:nth-child(6)')
      .invoke('text')
      .as('dryWt');

    // Capture MC value (column 7) and assert calculation
    cy.get('@firstRow')
      .find('td:nth-child(7)')
      .invoke('text')
      .then((mcValueText) => {
        cy.get('@freshSeed').then((freshSeed: any) => {
          cy.get('@dryWt').then((dryWt: any) => {
            const fresh = parseFloat(freshSeed);
            const dry = parseFloat(dryWt);
            const expectedMcValue = ((fresh - dry) / fresh) * 100;
            const actualMcValue = parseFloat(mcValueText);

            expect(Math.round(actualMcValue), 'MC value (%)').to.eq(Math.round(expectedMcValue));
          });
        });
      });
  });

  it('Check Calculate average button functionality', () => {
    // Ensure table is loaded
    cy.waitForTableData('.activity-result-container');

    // Check all rows so they are included in the average calculation
    cy.get('.activity-result-container tbody tr').each(($row) => {
      cy.wrap($row)
        .find('td[data-index="7"] input[type="checkbox"]')
        .check()
        .should('be.checked'); // verify natural check
    });

    // Click Calculate Average
    cy.contains('button', 'Calculate average').click();

    // Wait for API response
    cy.wait('@POST_calculate_average').then(({ response }) => {
      expect(response?.statusCode).to.eq(200);

      // Backend returns a number directly
      const averageMc = response!.body as number;

      // Assert UI shows this value
      cy.get('.activity-summary-info-value')
        .eq(4)
        .invoke('text')
        .then((text) => {
          expect(parseFloat(text)).to.eq(averageMc);
        });
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
