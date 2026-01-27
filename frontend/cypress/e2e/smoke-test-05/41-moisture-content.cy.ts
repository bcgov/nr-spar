import { HALF_SECOND, TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { mockMoistureContentApi } from '../../support/mockApiConsep';
import { MoistureContentType } from '../../definitions';

describe('Moisture Content Screen page', () => {
  let mcData: MoistureContentType;
  beforeEach(() => {
    cy.fixture('moisture-content').then((jsonData) => {
      mcData = jsonData;
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

  it('Check breadcrumbs section', () => {
    // Check if the breadcrumbs are displayed correctly
    cy.get('.consep-moisture-content-breadcrumb')
      .find('li')
      .should('have.length', 3)
      .and('contain', 'CONSEP')
      .and('contain', 'Testing activities search')
      .and('contain', 'Testing list');
  });

  it('Check Activity summary section', () => {
    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(0)
      .should('have.text', 'MC');

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(1)
      .should('have.text', '60662');

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(2)
      .should('have.text', 'SSP20000093');

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(3)
      .should('have.text', 'FDC | A');

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(4)
      .should('have.text', '0.5');
  });

  it('Check Activity results table validation', () => {
    cy.intercept('GET', '**/api/seedlots/60662').as('getSeedlotDetail');
    cy.wait('@getSeedlotDetail').its('response.statusCode').should('eq', 200);

    // Add a new row
    cy.get('.activity-result-action-buttons')
      .find('button')
      .contains('Add row')
      .click();

    // Check validation of Container input
    cy.get('.activity-result-container')
      .find('tbody tr')
      .as('totalRows')
      .eq(3)
      .find('input[name="containerId"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', mcData.table.containerErrorMsg);

    cy.get('@totalRows')
      .eq(3)
      .find('input[name="containerId"]')
      .click()
      .clear()
      .type('15', { delay: TYPE_DELAY });

    // Check validation of Container weight input
    cy.get('@totalRows')
      .eq(3)
      .find('input[name="containerWeight"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', mcData.table.containerWeightErrorMsg);

    cy.get('@totalRows')
      .eq(3)
      .find('input[name="containerWeight"]')
      .click()
      .clear()
      .type('20', { delay: TYPE_DELAY });

    // Check validation of Fresh seed input
    cy.get('@totalRows')
      .eq(3)
      .find('input[name="freshSeed"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', mcData.table.containerWeightErrorMsg);

    cy.get('@totalRows')
      .eq(3)
      .find('input[name="freshSeed"]')
      .click()
      .clear()
      .type('30', { delay: TYPE_DELAY });

    // Check validation of Cont + Dry seed input
    cy.get('@totalRows')
      .eq(3)
      .find('input[name="containerAndDryWeight"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', mcData.table.containerWeightErrorMsg);

    cy.get('@totalRows')
      .eq(3)
      .find('input[name="containerAndDryWeight"]')
      .click()
      .clear()
      .type('38', { delay: TYPE_DELAY });
  });

  it('Check Activity results table button functionality', () => {
    cy.intercept('GET', '**/api/seedlots/60662').as('getSeedlotDetail');
    cy.wait('@getSeedlotDetail').its('response.statusCode').should('eq', 200);

    // Check if the table has the correct number of rows
    cy.get('.activity-result-container')
      .find('tbody tr')
      .as('totalRows')
      .should('have.length', 3);

    // Check 'Add row' button functionality
    cy.get('.activity-result-action-buttons')
      .find('button')
      .contains('Add row')
      .click();

    cy.get('@totalRows')
      .should('have.length', 4);

    // Check 'Delete row' button functionality
    cy.get('@totalRows')
      .last()
      .find('td:nth-last-child(1) svg')
      .click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(HALF_SECOND); // Wait for the row to be deleted

    cy.get('@totalRows')
      .should('have.length', 3);

    // Check Accept checkbox functionality
    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .find('td:nth-child(8) input')
      .as('acceptCheckbox')
      .should('be.checked');

    cy.get('@acceptCheckbox')
      .click();

    cy.get('@acceptCheckbox', { timeout: HALF_SECOND })
      .siblings('svg')
      .should('have.attr', 'data-testid', mcData.table.unCheckedBox);

    cy.get('@acceptCheckbox')
      .click();

    cy.get('@acceptCheckbox', { timeout: HALF_SECOND })
      .siblings('svg')
      .should('have.attr', 'data-testid', mcData.table.checkedBox);

    // Check 'Accept all' button functionality
    cy.get('@acceptCheckbox')
      .click();

    cy.get('.activity-result-action-buttons')
      .find('button')
      .contains('Accept all')
      .click();

    cy.get('@acceptCheckbox', { timeout: HALF_SECOND })
      .siblings('svg')
      .should('have.attr', 'data-testid', mcData.table.checkedBox);

    // Check Comments column functionality
    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .find('td:nth-child(9) input')
      .as('commentInput')
      .click()
      .type(mcData.mc.testComment, { delay: TYPE_DELAY })
      .blur();

    cy.get('@commentInput')
      .should('have.value', mcData.mc.testComment);

    // Check 'Clear data' button functionality
    cy.get('.activity-result-action-buttons')
      .find('button')
      .contains('Clear data')
      .click();

    cy.get('.activity-result-notification')
      .find('button')
      .contains('Clear')
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .should('contain.text', mcData.table.emptyTableMsg);
  });

  it('Check sorting by Replicate number', () => {
    let ascendingFirstRow: string;
    let descendingFirstRow: string;
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

    cy.intercept('GET', '**/api/seedlots/60662').as('getSeedlotDetail');
    cy.wait('@getSeedlotDetail').its('response.statusCode').should('eq', 200);

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

    cy.intercept('GET', '**/api/seedlots/60662').as('getSeedlotDetail');
    cy.wait('@getSeedlotDetail').its('response.statusCode').should('eq', 200);

    // Check ascending sorting functionality of 'Container weight' column
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

    cy.intercept('GET', '**/api/seedlots/60662').as('getSeedlotDetail');
    cy.wait('@getSeedlotDetail').its('response.statusCode').should('eq', 200);

    // Check ascending sorting functionality of 'Fresh seed' column
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

    cy.intercept('GET', '**/api/seedlots/60662').as('getSeedlotDetail');
    cy.wait('@getSeedlotDetail').its('response.statusCode').should('eq', 200);

    // Check ascending sorting functionality of 'Cont + Dry seed' column
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

    cy.intercept('GET', '**/api/seedlots/60662').as('getSeedlotDetail');
    cy.wait('@getSeedlotDetail').its('response.statusCode').should('eq', 200);

    // Check ascending sorting functionality of 'Dry weight' column
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
    let ascendingFirstRow: string;
    let descendingFirstRow: string;

    cy.intercept('GET', '**/api/seedlots/60662').as('getSeedlotDetail');
    cy.wait('@getSeedlotDetail').its('response.statusCode').should('eq', 200);

    // Check ascending sorting functionality of 'MC value (%)' column
    cy.get('.activity-result-container')
      .find('thead tr')
      .find('th div')
      .as('tableHeading')
      .contains(mcData.table.column7)
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(7)')
      .invoke('text')
      .then(($mcValue: any) => {
        descendingFirstRow = $mcValue;
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(7)')
      .invoke('text')
      .then(($mcValue: any) => {
        const descendingSecondRow: string = $mcValue;
        expect(parseInt(descendingFirstRow, 10))
          .to.be.lessThan(parseInt(descendingSecondRow, 10));
      });

    cy.get('@tableHeading')
      .contains(mcData.table.column7)
      .click();

    cy.get('@firstRow')
      .find('td:nth-child(7)')
      .invoke('text')
      .then(($mcValue: any) => {
        ascendingFirstRow = $mcValue;
      });

    cy.get('@secondRow')
      .find('td:nth-child(7)')
      .invoke('text')
      .then(($mcValue: any) => {
        const ascendingSecondRow: string = $mcValue;
        expect(parseInt(ascendingFirstRow, 10))
          .to.be.greaterThan(parseInt(ascendingSecondRow, 10));
      });
  });

  it('Check Dry weight value', () => {
    let containerWt: string;
    let contDrySeed: string;

    cy.intercept('GET', '**/api/seedlots/60662').as('getSeedlotDetail');
    cy.wait('@getSeedlotDetail').its('response.statusCode').should('eq', 200);

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

  it('Check MC value(%) value', () => {
    let freshSeed: string;
    let dryWt: string;

    cy.intercept('GET', '**/api/seedlots/60662').as('getSeedlotDetail');
    cy.wait('@getSeedlotDetail').its('response.statusCode').should('eq', 200);

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
    cy.intercept('POST', '**/api/moisture-content-cone/514330/calculate-average').as('postCalcAvg');
    cy.intercept('GET', '**/api/seedlots/60662').as('getSeedlotDetail');
    cy.wait('@getSeedlotDetail').its('response.statusCode').should('eq', 200);

    // Extract all MC values from the 7th column
    const mcValues: number[] = [];
    cy.get('.activity-result-container')
      .find('tbody tr')
      .then(($rows) => {
        // Iterate over each row
        Cypress.$($rows).each((index, row) => {
          // Find the 7th td cell in this row and get its text
          const mcText = Cypress.$(row).find('td:nth-child(7)').text().trim();
          // Convert to number, default to 0 if invalid
          const mcNum = parseFloat(mcText) || 0;
          mcValues.push(mcNum);
        });
      });

    // Calculate average
    const sum = mcValues.reduce((acc, val) => acc + val, 0);
    const averageMcValues = mcValues.length > 0 ? sum / mcValues.length : 0;

    cy.get('.consep-registration-button-row')
      .find('button')
      .contains('Calculate average')
      .click();

    cy.wait('@postCalcAvg').its('response.statusCode').should('eq', 200);

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(4)
      .should('have.text', averageMcValues.toFixed(2));
  });

  it('should have correct Date functionality and validations', () => {
    // Check if the date input has a placeholder
    cy.get(`.${prefix}--date-picker-container`)
      .find('input')
      .should('have.attr', 'placeholder', 'yyyy/mm/dd');

    cy.get('#moisture-content-end-date-picker')
      .clear()
      .type('2025-05-28', { delay: TYPE_DELAY })
      .blur();

    // Invalid start date
    cy.get('#moisture-content-start-date-picker')
      .clear()
      .type('2025-05-29', { delay: TYPE_DELAY })
      .blur();

    // Valid start date
    cy.get('#moisture-content-start-date-picker')
      .clear()
      .type('2025-05-27', { delay: TYPE_DELAY })
      .blur();
  });

  it('Check Comment box', () => {
    // Check if the comment input exists
    cy.get('#moisture-content-comments');

    // Type a comment
    cy.get('#moisture-content-comments')
      .clear()
      .type(mcData.mc.testComment, { delay: TYPE_DELAY })
      .blur()
      .should('have.value', mcData.mc.testComment);
  });
});
