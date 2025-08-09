import { TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { mockMoistureContentApi } from '../../support/mockApiConsep';

describe('Moisture Content Screen page', () => {
  beforeEach(() => {
    mockMoistureContentApi();
    cy.login();
    cy.visit('/consep/manual-moisture-content/514330');
    cy.url().should('contains', '/consep/manual-moisture-content/514330');
  });

  it('should load and display manual moisture content page correctly', () => {
    // Check if the page title is displayed correctly
    cy.get('.consep-moisture-content-title')
      .find('h1')
      .contains('Moisture content cones for seedlot');

    // Check if the table title is displayed correctly
    cy.get('.activity-result-actions-title')
      .find('h3')
      .contains('Activity results per replicate');
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
    // Check if the table has the correct number of rows
    cy.get('.activity-result-container')
      .find('tbody tr')
      .as('totalRows')
      .should('have.length', 2);

    // Check 'Add row' button functionality
    cy.get('.activity-result-action-buttons')
      .find('button')
      .contains('Add row')
      .click();

    cy.get('@totalRows')
      .should('have.length', 3);

    // Check validation of Container input
    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerId"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', 'Must be no more than 4 characters');

    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerId"]')
      .click()
      .clear()
      .type('15', { delay: TYPE_DELAY });

    // Check validation of Container weight input
    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerWeight"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', 'Must be no more than 4 characters');

    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerWeight"]')
      .click()
      .clear()
      .type('20', { delay: TYPE_DELAY });

    // Check validation of Fresh seed input
    cy.get('@totalRows')
      .eq(2)
      .find('input[name="freshSeed"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', 'Must be no more than 4 characters');

    cy.get('@totalRows')
      .eq(2)
      .find('input[name="freshSeed"]')
      .click()
      .clear()
      .type('30', { delay: TYPE_DELAY });

    // Check validation of Cont + Dry seed input
    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerAndDryWeight"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', 'Must be no more than 4 characters');

    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerAndDryWeight"]')
      .click()
      .clear()
      .type('38', { delay: TYPE_DELAY });

    // Check 'Clear data' button functionality
    cy.get('.activity-result-action-buttons')
      .find('button')
      .contains('Clear data')
      .click();

    cy.get('.activity-result-notification')
      .find('button')
      .contains('Clear')
      .click();

    cy.get('@totalRows')
      .should('contain.text', 'No data found');
  });

  it('Check sorting by Replicate number', () => {
    let ascendingFirstRow: string;
    let descendingFirstRow: string;
    // Check descending sorting functionality of 'Replicate' column
    cy.get('.activity-result-container')
      .find('thead tr')
      .find('th div')
      .as('tableHeading')
      .contains('Replicate')
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
      .contains('Replicate')
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
      .contains('Container #')
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(2) input')
      .invoke('val')
      .then(($containerNum: any) => {
        ascendingFirstRow = $containerNum;
        cy.log('First row container #:', ascendingFirstRow);
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(2) input')
      .invoke('val')
      .then(($containerNum: any) => {
        const ascendingSecondRow: string = $containerNum;
        cy.log('Second row container #:', ascendingSecondRow);
        expect(parseInt(ascendingFirstRow, 10))
          .to.be.lessThan(parseInt(ascendingSecondRow, 10));
      });

    cy.get('@tableHeading')
      .contains('Container #')
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
      .contains('Container weight')
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(3) input')
      .invoke('val')
      .then(($containerWt: any) => {
        descendingFirstRow = $containerWt;
        cy.log('First row container #:', descendingFirstRow);
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(3) input')
      .invoke('val')
      .then(($containerWt: any) => {
        const descendingSecondRow: string = $containerWt;
        cy.log('Second row container #:', descendingSecondRow);
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });

    cy.get('@tableHeading')
      .contains('Container weight')
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
      .contains('Fresh seed')
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(4) input')
      .invoke('val')
      .then(($freshSeed: any) => {
        descendingFirstRow = $freshSeed;
        cy.log('First row container #:', descendingFirstRow);
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(4) input')
      .invoke('val')
      .then(($freshSeed: any) => {
        const descendingSecondRow: string = $freshSeed;
        cy.log('Second row fresh seed:', descendingSecondRow);
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });

    cy.get('@tableHeading')
      .contains('Fresh seed')
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
      .contains('Cont + Dry seed')
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(5) input')
      .invoke('val')
      .then(($contDrySeed: any) => {
        descendingFirstRow = $contDrySeed;
        cy.log('First row seed:', descendingFirstRow);
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(5) input')
      .invoke('val')
      .then(($contDrySeed: any) => {
        const descendingSecondRow: string = $contDrySeed;
        cy.log('Second row seed:', descendingSecondRow);
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });

    cy.get('@tableHeading')
      .contains('Cont + Dry seed')
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
      .contains('Dry weight')
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(6)')
      .invoke('text')
      .then(($dryWt: any) => {
        descendingFirstRow = $dryWt;
        cy.log('First row dry weight:', descendingFirstRow);
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(6)')
      .invoke('text')
      .then(($dryWt: any) => {
        const descendingSecondRow: string = $dryWt;
        cy.log('Second row dry weight:', descendingSecondRow);
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });

    cy.get('@tableHeading')
      .contains('Dry weight')
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
      .contains('MC value (%)')
      .click();

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(0)
      .as('firstRow')
      .find('td:nth-child(7)')
      .invoke('text')
      .then(($mcValue: any) => {
        descendingFirstRow = $mcValue;
        cy.log('First row MC value (%):', descendingFirstRow);
      });

    cy.get('.activity-result-container')
      .find('tbody tr')
      .eq(1)
      .as('secondRow')
      .find('td:nth-child(7)')
      .invoke('text')
      .then(($mcValue: any) => {
        const descendingSecondRow: string = $mcValue;
        cy.log('Second row MC value (%):', descendingSecondRow);
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });

    cy.get('@tableHeading')
      .contains('MC value (%)')
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
          .to.be.lessThan(parseInt(ascendingSecondRow, 10));
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
        cy.log('First row Container weight', containerWt);
      });

    cy.get('@firstRow')
      .find('td:nth-child(5) input')
      .invoke('val')
      .then(($value: any) => {
        contDrySeed = $value;
        cy.log('First row Cont dry seed', contDrySeed);
      });

    cy.get('@firstRow')
      .find('td:nth-child(6)')
      .invoke('text')
      .then(($text: any) => {
        const dryWt = $text;
        cy.log('First row Cont dry seed', dryWt);
        expect(parseInt(contDrySeed, 10) - parseInt(containerWt, 10))
          .to.be.equal(parseInt(dryWt, 10));
      });
  });

  it('Check Calculate average button functionality', () => {
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

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(4)
      .should('have.text', averageMcValues.toFixed(2));
  });

  // it('should have correct Date functionality and validations', () => {
  //   // Check if the date input has a placeholder
  //   cy.get(`.${prefix}--date-picker-container`)
  //     .find('input')
  //     .should('have.attr', 'placeholder', 'yyyy/mm/dd');

  //   cy.get('#moisture-content-end-date-picker')
  //     .clear()
  //     .type('2025-05-28', { delay: TYPE_DELAY })
  //     .blur();

  //   // Invalid start date
  //   cy.get('#moisture-content-start-date-picker')
  //     .clear()
  //     .type('2025-05-29', { delay: TYPE_DELAY })
  //     .blur();

  //   // Valid start date
  //   cy.get('#moisture-content-start-date-picker')
  //     .clear()
  //     .type('2025-05-27', { delay: TYPE_DELAY })
  //     .blur();
  // });

  // it('Check Comment box', () => {
  //   // Check if the comment input has a placeholder
  //   cy.get('#moisture-content-comments')
  //     .should('have.attr', 'placeholder', 'My comments about this activity');

  //   // Type a comment
  //   cy.get('#moisture-content-comments')
  //     .clear()
  //     .type('This is a test comment', { delay: TYPE_DELAY })
  //     .blur()
  //     .should('have.value', 'This is a test comment');
  // });
});
