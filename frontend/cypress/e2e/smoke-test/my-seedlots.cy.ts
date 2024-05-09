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

  it('should render my seedlot page heading', () => {
    cy.get('.my-seedlot-title')
      .find('.title-favourite')
      .children('h1')
      .should('have.text', 'My Seedlots');
  });

  it('arrow button works correctly', () => {
    // Arrow button test
    cy.get(`.${prefix}--pagination__right`)
      .find(`.${prefix}--popover--top-right`)
      .find(`button.${prefix}--btn--icon-only`)
      .click({ force: true });
  });

  it('should sort table columns in ascending and descinding order - Seedlot number', () => {
    let ascendingFirstRow: string;
    let descendingFirstRow: string;

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

  it('should sort table columns in ascending and descinding order - Last updated', () => {
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
      .should('have.text', fixtureData.pli.species);
  });

  it('dropdown button and next page functionality', () => {
    // Dropdown test
    cy.get(`.${prefix}--pagination__left`)
      .find('select')
      .as('dropdownBtn')
      .select('10');

    cy.get('@dropdownBtn')
      .should('have.value', '10');
    // Next page test
    cy.get(`.${prefix}--pagination__control-buttons`)
      .find(`button.${prefix}--pagination__button--forward`)
      .click();

    cy.get(`.${prefix}--pagination__right`)
      .find(`select.${prefix}--select-input`)
      .should('have.value', '2');

    cy.get(`.${prefix}--pagination__control-buttons`)
      .find(`button.${prefix}--pagination__button--backward`)
      .click();

    cy.get(`.${prefix}--pagination__right`)
      .find(`select.${prefix}--select-input`)
      .should('have.value', '1');
  });

  it('should be able to select a seedlot row and redirect to its page', () => {
    cy.get('table.seedlot-data-table tbody tr')
      .as('tableContent');

    cy.get('@tableContent')
      .eq(3)
      .find('td:nth-child(1)').then(($seedlotRow) => {
        const seedlotNum: string = $seedlotRow.text();
        // Click on a seedlot row
        cy.get('@tableContent')
          .find(`#seedlot-table-cell-${seedlotNum}-seedlotNumber`)
          .click();

        cy.url().should('contains', `/seedlots/details/${seedlotNum}`);
      });
  });

  it('should have correct number of seedlots', () => {
    cypressSeedlots = NUM_OF_LOOPS * speciesKeys.length;
    //  Check total seedlots
    cy.get(`.${prefix}--pagination__left`)
      .find(`.${prefix}--pagination__items-count`)
      .invoke('text')
      .then((text) => {
        // Perform further manipulations on the text to get substring
        const startIndex = text.indexOf('f') + 1;
        const endIndex = text.indexOf('i');
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
