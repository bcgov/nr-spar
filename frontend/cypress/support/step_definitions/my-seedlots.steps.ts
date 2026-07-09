import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';
import { CREATED_SPECIES_KEYS } from '../helpers/species-key';
import { NUM_OF_LOOPS } from '../../constants';

type SortColumn =
  | 'Seedlot number'
  | 'Seedlot species'
  | 'Seedlot status'
  | 'Created at'
  | 'Last updated';

const TABLE_SELECTOR = 'table.seedlot-data-table';

let fixtureData: SeedlotRegFixtureType;
let speciesKeys: string[] = [];

const getHeaderSelector = (column: SortColumn): string => {
  switch (column) {
    case 'Seedlot number':
      return '#seedlot-table-header-seedlotNumber';
    case 'Seedlot species':
      return '#seedlot-table-header-seedlotSpecies';
    case 'Seedlot status':
      return '#seedlot-table-header-seedlotStatus';
    case 'Created at':
      return '#seedlot-table-header-createdAt';
    case 'Last updated':
      return '#seedlot-table-header-lastUpdatedAt';
    default:
      throw new Error('Unsupported sort column');
  }
};

const getSeedlotNumberAtRow = (rowIndex: number): Cypress.Chainable<string> => cy
  .get(`${TABLE_SELECTOR} tbody tr`)
  .eq(rowIndex)
  .find('td:nth-child(1)')
  .invoke('text')
  .then((text) => text.trim());

const getValueAtRow = (column: SortColumn, rowIndex: number): Cypress.Chainable<string> => {
  if (column === 'Seedlot number') {
    return getSeedlotNumberAtRow(rowIndex);
  }

  return getSeedlotNumberAtRow(rowIndex).then((seedlotNum) => {
    let suffix = '';

    switch (column) {
      case 'Seedlot species':
        suffix = 'seedlotSpecies';
        break;
      case 'Seedlot status':
        suffix = 'seedlotStatus';
        break;
      case 'Created at':
        suffix = 'createdAt';
        break;
      case 'Last updated':
        suffix = 'lastUpdatedAt';
        break;
      default:
        throw new Error('Unsupported sort column');
    }

    return cy
      .get(`#seedlot-table-cell-${seedlotNum}-${suffix}`)
      .invoke('text')
      .then((text) => text.trim());
  });
};

const assertAscendingPair = (column: SortColumn, first: string, second: string): void => {
  if (column === 'Seedlot number') {
    expect(parseInt(first, 10)).to.be.lessThan(parseInt(second, 10));
    return;
  }

  if (column === 'Created at' || column === 'Last updated') {
    expect(new Date(first)).to.be.lte(new Date(second));
    return;
  }

  expect(first.localeCompare(second)).to.be.at.most(0);
};

const assertDescendingPair = (column: SortColumn, first: string, second: string): void => {
  if (column === 'Seedlot number') {
    expect(parseInt(first, 10)).to.be.greaterThan(parseInt(second, 10));
    return;
  }

  if (column === 'Created at' || column === 'Last updated') {
    expect(new Date(first)).to.be.gte(new Date(second));
    return;
  }

  expect(first.localeCompare(second)).to.be.at.least(0);
};

const parseTotalCount = (paginationText: string): number => {
  const match = paginationText.match(/of\s+(\d+)/i);
  if (!match) {
    throw new Error(`Unable to parse pagination count from: ${paginationText}`);
  }
  return parseInt(match[1], 10);
};

const loadFixtureData = (): Cypress.Chainable<SeedlotRegFixtureType> => cy.get('@aClassSeedlotData').then((data) => {
  const typedData = data as unknown as SeedlotRegFixtureType;
  fixtureData = typedData;
  speciesKeys = CREATED_SPECIES_KEYS.filter((key) => typedData[key]);
  return typedData;
});

When('I click the register a new seedlot button', () => {
  cy.get('.my-seedlot-title')
    .find('button.reg-seedlot-btn')
    .should('have.text', 'Register a new seedlot')
    .click();
});

When('I open a seedlot row from the table', () => {
  cy.get(`${TABLE_SELECTOR} tbody tr`).as('tableContent');

  cy.get('@tableContent')
    .eq(3)
    .find('td:nth-child(1)')
    .invoke('text')
    .then((text) => text.trim())
    .then((seedlotNum) => {
      cy.get('@tableContent')
        .find(`#seedlot-table-cell-${seedlotNum}-seedlotNumber`)
        .click();
    });
});

When('I search for {string} in the my seedlots search field', (searchText: string) => {
  cy.get('.my-seedlot-data-table-row')
    .children(`.${prefix}--search`)
    .find('input')
    .clear()
    .type(searchText);
});

Then('the first visible seedlot species should match fixture key {string}', (fixtureKey: string) => {
  loadFixtureData().then(() => {
    cy.get(`${TABLE_SELECTOR} tbody tr`)
      .eq(0)
      .find('td:nth-child(1)')
      .invoke('text')
      .then((text) => text.trim())
      .then((seedlotNum) => {
        cy.get(`#seedlot-table-cell-${seedlotNum}-seedlotSpecies`)
          .invoke('text')
          .then((speciesText) => speciesText.trim())
          .then((speciesText) => {
            expect(speciesText).to.contain(fixtureData[fixtureKey].species);
          });
      });
  });
});

Then('the pagination total should be at least the expected fixture-based seedlot count', () => {
  loadFixtureData().then(() => {
    const expectedMinimum = NUM_OF_LOOPS * speciesKeys.length;

    cy.get(`.${prefix}--pagination__left`)
      .find(`.${prefix}--pagination__items-count`)
      .invoke('text')
      .then((text) => {
        const total = parseTotalCount(text);
        expect(total).to.be.gte(expectedMinimum);
      });
  });
});

When('I sort the my seedlots table by {string}', (column: SortColumn) => {
  cy.get(TABLE_SELECTOR).find(getHeaderSelector(column)).click();
});

Then('the my seedlots table should be sorted by {string}', (column: SortColumn) => {
  cy.get(`${TABLE_SELECTOR} tbody tr`).should('have.length.greaterThan', 1);

  // Ascending check after first click from When step
  getValueAtRow(column, 0).then((ascendingFirst) => {
    getValueAtRow(column, 1).then((ascendingSecond) => {
      assertAscendingPair(column, ascendingFirst, ascendingSecond);
    });
  });

  // Descending check after second click
  cy.get(TABLE_SELECTOR).find(getHeaderSelector(column)).click();

  getValueAtRow(column, 0).then((descendingFirst) => {
    getValueAtRow(column, 1).then((descendingSecond) => {
      assertDescendingPair(column, descendingFirst, descendingSecond);
    });
  });
});
