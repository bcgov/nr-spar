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

  it('Page title', () => {
    cy.get('.my-seedlot-title')
      .find('.title-favourite')
      .children('h1')
      .should('have.text', 'My Seedlots');
  });

  it('Sort table by Seedlot number', () => {
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
        expect(parseInt(descendingFirstRow, 10))
          .to.be.greaterThan(parseInt(descendingSecondRow, 10));
      });
  });

  it('Sort table by Seedlot species', () => {
    let ascendingFirstRow: string;

    // Sorting test
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-seedlotSpecies')
      .click();

    cy.get('table.seedlot-data-table tbody tr')
      .as('tableContent');

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($seedlotNum) => {
        const ascendingFirstSeedlot = $seedlotNum.text();
        return cy.get(`#seedlot-table-cell-${ascendingFirstSeedlot}-seedlotSpecies`);
      })
      .then(($seedlotSpecies) => {
        ascendingFirstRow = $seedlotSpecies.text();
      });

    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-seedlotSpecies')
      .click();

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($seedlotNum) => {
        const descendingFirstSeedlot = $seedlotNum.text();
        return cy.get(`#seedlot-table-cell-${descendingFirstSeedlot}-seedlotSpecies`);
      })
      .then(($seedlotSpecies) => {
        const descendingFirstRow: string = $seedlotSpecies.text();
        expect(ascendingFirstRow.charCodeAt(0)).to.be.at.most(descendingFirstRow.charCodeAt(0));
      });
  });

  it('Sort table by Seedlot status', () => {
    let ascendingFirstRow: string;

    // Sorting test
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-seedlotStatus')
      .click();

    cy.get('table.seedlot-data-table tbody tr')
      .as('tableContent');

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($seedlotNum) => {
        const ascendingFirstSeedlot = $seedlotNum.text();
        return cy.get(`#seedlot-table-cell-${ascendingFirstSeedlot}-seedlotStatus`);
      })
      .then(($seedlotStatus) => {
        ascendingFirstRow = $seedlotStatus.text();
      });

    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-seedlotStatus')
      .click();

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($seedlotNum) => {
        const descendingFirstSeedlot = $seedlotNum.text();
        return cy.get(`#seedlot-table-cell-${descendingFirstSeedlot}-seedlotStatus`);
      })
      .then(($seedlotStatus) => {
        const descendingFirstRow: string = $seedlotStatus.text();
        expect(ascendingFirstRow.charCodeAt(0)).to.be.at.most(descendingFirstRow.charCodeAt(0));
      });
  });

  it('Sort table by Created at', () => {
    let ascendingFirstRow: string;

    // Sorting test
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-createdAt')
      .click();

    cy.get('table.seedlot-data-table tbody tr')
      .as('tableContent');

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($seedlotNum) => {
        const ascendingFirstSeedlot = $seedlotNum.text();
        return cy.get(`#seedlot-table-cell-${ascendingFirstSeedlot}-createdAt`);
      })
      .then(($createdDate) => {
        ascendingFirstRow = $createdDate.text();
      });

    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-createdAt')
      .click();

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($seedlotNum) => {
        const descendingFirstSeedlot = $seedlotNum.text();
        return cy.get(`#seedlot-table-cell-${descendingFirstSeedlot}-createdAt`);
      })
      .then(($createdDate) => {
        const descendingFirstRow: string = $createdDate.text();
        const ascendingDate = new Date(ascendingFirstRow);
        const descendingDate = new Date(descendingFirstRow);
        expect(ascendingDate).to.be.at.most(descendingDate);
      });
  });

  it('Sort table by Last updated', () => {
    let ascendingFirstRow: string;

    // Sorting test
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-lastUpdatedAt')
      .click();

    cy.get('table.seedlot-data-table tbody tr')
      .as('tableContent');

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($seedlotNum) => {
        const ascendingFirstSeedlot = $seedlotNum.text();
        return cy.get(`#seedlot-table-cell-${ascendingFirstSeedlot}-lastUpdatedAt`);
      })
      .then(($updatedDate) => {
        ascendingFirstRow = $updatedDate.text();
      });

    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-lastUpdatedAt')
      .click();

    cy.get('@tableContent')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($seedlotNum) => {
        const descendingFirstSeedlot = $seedlotNum.text();
        return cy.get(`#seedlot-table-cell-${descendingFirstSeedlot}-lastUpdatedAt`);
      })
      .then(($updatedDate) => {
        const descendingFirstRow: string = $updatedDate.text();
        const ascendingDate = new Date(ascendingFirstRow);
        const descendingDate = new Date(descendingFirstRow);
        expect(ascendingDate).to.be.at.most(descendingDate);
      });
  });

  it('Search bar', () => {
    // Search bar test
    cy.get('.my-seedlot-data-table-row').children(`.${prefix}--search`).find('input')
      .type('PLI');

    cy.get('table.seedlot-data-table tbody tr')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($seedlot) => {
        const seedlotNum = $seedlot.text();
        return cy.get(`#seedlot-table-cell-${seedlotNum}-seedlotSpecies`);
      })
      .then(($seedlotSpecies) => {
        expect($seedlotSpecies.text()).to.have.string(fixtureData.pli.species);
      });
  });

  it('Pagination', () => {
    const dropdownNumber = '10';
    // Number of item dropdown
    cy.get(`.${prefix}--pagination__left`)
      .find('select')
      .select(dropdownNumber);

    // Wait for table body to load
    cy.get(`table.${prefix}--data-table tbody`)
      .find('tr')
      .eq(2);

    cy.get(`.${prefix}--pagination__left`)
      .find(`.${prefix}--pagination__items-count`)
      .should('include.text', '1–10');

    // Page number dropdown
    cy.get(`.${prefix}--pagination__right`)
      .find(`select.${prefix}--select-input`)
      .select('2');

    cy.get(`.${prefix}--pagination__left`)
      .find(`.${prefix}--pagination__items-count`)
      .should('include.text', '11');

    cy.get(`.${prefix}--pagination__right`)
      .find(`select.${prefix}--select-input`)
      .select('1');

    // Forward Backward buttons
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

  it('Select a seedlot row should redirect to its detail page', () => {
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

  it('Correct number of seedlots', () => {
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

  it('Register a new seedlot button', () => {
    // Button test
    cy.get('.my-seedlot-title')
      .find('button.reg-seedlot-btn')
      .should('have.text', 'Register a new seedlot')
      .click();

    cy.url().should('contains', '/seedlots/register-a-class');
  });
});
