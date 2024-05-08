// TODO Get rid of this eslint-disable
/* eslint-disable max-len */
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';
import { NUM_OF_LOOPS } from '../../constants';

describe('My seedlots page', () => {
  let fixtureData: SeedlotRegFixtureType;
  let speciesKeys: string[];
  let cypressSeedlots: number;

  beforeEach(() => {
    // Login
    cy.login();
    // Go to my seedlot page
    cy.visit('/seedlots/my-seedlots');
    cy.url().should('contains', '/seedlots/my-seedlots');
    cy.fixture('aclass-seedlot').then((fData) => {
      fixtureData = fData;
      speciesKeys = Object.keys(fixtureData);
    });
  });

  // TODO separate each test out in its own it()
  // Test DESC sorting as well
  it('should render my seedlot page heading', () => {
    cy.get('.my-seedlot-title')
      .find('.title-favourite')
      .children('h1')
      .should('have.text', 'My Seedlots');
  });

  it('should sort table columns in ascending and descinding order - Seedlot number', () => {
    let ascendingFirstRow: string;
    let descendingFirstRow: string;
    // Arrow button test
    // cy.get(`.${prefix}--pagination__right`)
    //   .find(`.${prefix}--popover--top-right`)
    //   .find(`button.${prefix}--btn--icon-only`)
    //   .click({ force: true });

    // Sorting test
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-seedlotNumber')
      .click();

    cy.get('table.seedlot-data-table tbody tr')
      .as('tableContent');

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(1)').then(($seedlotNum) => {
        ascendingFirstRow = $seedlotNum.text();
      });

    cy.get('@tableContent')
      .eq(1)
      .find('td:nth-child(1)').then(($seedlotNum) => {
        const ascendingSecondRow: string = $seedlotNum.text();
        expect(parseInt(ascendingFirstRow, 10)).to.be.lessThan(parseInt(ascendingSecondRow, 10));
      });

    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-seedlotNumber')
      .click();

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(1)').then(($seedlotNum) => {
        descendingFirstRow = $seedlotNum.text();
      });

    cy.get('@tableContent')
      .eq(1)
      .find('td:nth-child(1)').then(($seedlotNum) => {
        const descendingSecondRow: string = $seedlotNum.text();
        expect(parseInt(descendingFirstRow, 10)).to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });
  });

  it('should sort table columns in ascending and descinding order - Seedlot species', () => {
    let ascendingFirstRow: string;

    // Sorting test
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-seedlotSpecies')
      .click();

    cy.get('table.seedlot-data-table tbody tr')
      .as('tableContent');

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(3)').then(($seedlotSpecies) => {
        ascendingFirstRow = $seedlotSpecies.text();
      });

    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-seedlotSpecies')
      .click();

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(3)').then(($seedlotSpecies) => {
        const descendingFirstRow: string = $seedlotSpecies.text();
        expect(ascendingFirstRow.charCodeAt(0)).to.be.at.most(descendingFirstRow.charCodeAt(0));
      });
  });

  it('should sort table columns in ascending and descinding order - Seedlot status', () => {
    let ascendingFirstRow: string;

    // Sorting test
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-seedlotStatus')
      .click();

    cy.get('table.seedlot-data-table tbody tr')
      .as('tableContent');

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(4)').then(($seedlotStatus) => {
        ascendingFirstRow = $seedlotStatus.text();
      });

    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-seedlotStatus')
      .click();

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(4)').then(($seedlotStatus) => {
        const descendingFirstRow: string = $seedlotStatus.text();
        expect(ascendingFirstRow.charCodeAt(0)).to.be.at.most(descendingFirstRow.charCodeAt(0));
      });
  });

  it('should sort table columns in ascending and descinding order - Created at', () => {
    let ascendingFirstRow: string;

    // Sorting test
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-createdAt')
      .click();

    cy.get('table.seedlot-data-table tbody tr')
      .as('tableContent');

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(5)').then(($createdDate) => {
        ascendingFirstRow = $createdDate.text();
      });

    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-createdAt')
      .click();

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(5)').then(($createdDate) => {
        const descendingFirstRow: string = $createdDate.text();
        const ascendingDate = new Date(ascendingFirstRow);
        const descendingDate = new Date(descendingFirstRow);
        expect(ascendingDate).to.be.at.most(descendingDate);
      });
  });

  it.only('should sort table columns in ascending and descinding order - Last updated', () => {
    let ascendingFirstRow: string;

    // Sorting test
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-lastUpdatedAt')
      .click();

    cy.get('table.seedlot-data-table tbody tr')
      .as('tableContent');

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(6)').then(($updatedDate) => {
        ascendingFirstRow = $updatedDate.text();
      });

    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-lastUpdatedAt')
      .click();

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(6)').then(($updatedDate) => {
        const descendingFirstRow: string = $updatedDate.text();
        const ascendingDate = new Date(ascendingFirstRow);
        const descendingDate = new Date(descendingFirstRow);
        expect(ascendingDate).to.be.at.most(descendingDate);
      });
  });

  it('can use search bar to give correct results', () => {
    // Search bar test
    cy.get('.my-seedlot-data-table-row').children(`.${prefix}--search`).find('input')
      .type('PLI');

    cy.get('table.seedlot-data-table tbody tr')
      .eq(0)
      .find('td:nth-child(3)')
      .should('have.text', 'PLI - Lodgepole pine');
  });

  it('dropdown button functionality', () => {
    // Dropdown test
    cy.get(`.${prefix}--pagination__left`)
      .find('select')
      .select('30')
      .should('have.value', '30');
  });

  it('should be able to select a seedlot row and redirect to its page', () => {
    // Click on a seedlot row
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-cell-63006-seedlotNumber')
      .click();

    cy.url().should('contains', '/seedlots/details/63006');
  });

  it('should have correct number of seedlots', () => {
    cypressSeedlots = NUM_OF_LOOPS * speciesKeys.length;
    //  Check total seedlots
    cy.get(`.${prefix}--pagination__left`)
      .find(`.${prefix}--pagination__items-count`)
      .invoke('text')
      .then((text) => {
        // Perform further manipulations on the text to get substring
        const startIndex = text.indexOf('f') + 1; // Index after "of" plus 1 for the space
        const endIndex = text.indexOf('i'); // Index before "items" minus 1 for the space
        const substring = text.substring(startIndex, endIndex).trim();
        expect(parseInt(substring, 10)).to.be.gte(cypressSeedlots);
      });
  });

  it('should click register-a-class button', () => {
    // Button test
    cy.get('.my-seedlot-title')
      .find('button.reg-seedlot-btn')
      .should('have.text', 'Register a new seedlot')
      .click();

    cy.url().should('contains', '/seedlots/register-a-class');
  });
});

/* Seedlot number sorting
  Suggested sorting test plan for seedlot_number (lowSeedlotNumber)
  1. Press the Seedlot number column one time (ASC)
  2. Get the first row's seedlot number and store it
  3. Compare the first row's seedlot number to second row's
  4. Press the Seedlot number column again (DESC)
  5. Get the first row's seedlot number and store it (name it something else e.g. highSeedlotNumber)
  6. Compare the first row's seedlot number to second row's
  7. Compare lowSeedlotNumber and highSeedlotNumber
 */

/* Seedlot species sorting
  1. Click on the the column one time
  2. Record the first row's species (lowSpecies)
  3. Click on the column again
  4. Record the first row's species (highSpecies)
  5. Compare the first char of lowSpecies and highSpecies
  6. lowSpecies.charAt(0) <= highSpecies.charAt(0
     e.g. cy.expect(lowSpecies.charCodeAt(0)).to.be.at.most(highSpecies.charCodeAt(0))
*/

/* Seedlot status sorting
  Similar to species
*/

/*
  Updated and Created date sorting
  Similar to what we have done:
  Get the two extreme values by clicking on the column 2 times
  Compare these two extreme values, where the lowest should be lower or equal to the highest
  in Cypress word, the lowest should be at.most(of the highest)
*/

// it.only('Date example', () => {
//   const highest = new Date('May 06, 2024');
//   const lowest = new Date('May 02, 2024');

//   expect(lowest).to.be.at.most(highest);
// });

/* Test total num of items
  The string is in the format of '1–20 of 21 items'
  get the total number by getting the sub-string between 'of' and 'items'
  And the total number on the page should be bigger or equal to `NUM_OF_LOOPS * speciesKeys.length`
*/

/*
  Test the next page function
  Since we will have at least 15 rows of seedlot
  Change the number of rows per page first to 10
  then click on the next button
  do some tests
  click on the back button
  do some tests
*/
