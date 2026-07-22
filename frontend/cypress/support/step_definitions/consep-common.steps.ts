import { Then, When, DataTable } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';
import { MoistureContentType, PurityContentType } from '../../definitions';
import { TYPE_DELAY } from '../../constants';

let moistureData: MoistureContentType;
let purityData: PurityContentType;

before(() => {
  cy.fixture('moisture-content').then((data: MoistureContentType) => {
    moistureData = data;
    cy.wrap(data).as('moistureData');
  });

  cy.fixture('purity-content').then((data: PurityContentType) => {
    purityData = data;
    cy.wrap(data).as('purityData');
  });
});

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const CONSEP_PAGE_IDS: Record<string, { startDate: string; endDate: string; comments: string; category: string }> = {
  'moisture content': {
    startDate: '#moisture-content-start-date-picker',
    endDate: '#moisture-content-end-date-picker',
    comments: '#moisture-content-comments',
    category: '#moisture-content-category'
  },
  'purity content': {
    startDate: '#purity-content-start-date-picker',
    endDate: '#purity-content-end-date-picker',
    comments: '#purity-content-comments',
    category: '#purity-content-category'
  }
};

const getCommentPlaceholder = (page: string): string => {
  switch (page) {
    case 'moisture content':
      return moistureData.mc.commentPlaceholder;
    case 'purity content':
      return purityData.pc.commentPlaceholder;
    default:
      return '';
  }
};

Then('the activity results table has loaded', () => {
  cy.waitForTableData('.activity-result-container');
});

Then('the activity results table should show these columns:', (dataTable: DataTable) => {
  const expectedColumns = dataTable.raw().flat().filter(Boolean);

  cy.get('.activity-result-container thead th')
    .then(($headers) => {
      const headerTexts = [...$headers].map((header) => normalize(header.textContent || ''));

      expectedColumns.forEach((columnName: string) => {
        const expected = normalize(columnName);

        const matches = headerTexts.some((headerText) => headerText === expected || headerText.includes(expected) || expected.includes(headerText));

        assert.isTrue(
          matches,
          `Missing activity results column: ${columnName}. Found: ${headerTexts.join(' | ')}`
        );
      });
    });
});

Then('the activity summary should match the seedlot replicate info', () => {
  cy.get('@seedlotData').then((seedlotData: any) => {
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
      .should(($el) => {
        const displayedValue = ($el.text() || '').trim();
        const expectedValue = seedlotData.moisturePct == null
          ? ''
          : Number(seedlotData.moisturePct).toFixed(1);

        expect(displayedValue).to.eq(expectedValue);
      });
  });
});

When('I set the {string} start date to {string}', (page: string, dateValue: string) => {
  cy.setFlatpickrDate(CONSEP_PAGE_IDS[page].startDate, dateValue);
});

When('I set the {string} end date to {string}', (page: string, dateValue: string) => {
  cy.setFlatpickrDate(CONSEP_PAGE_IDS[page].endDate, dateValue);
});

Then('the date range should show a validation error', () => {
  cy.get(`.${prefix}--date-picker-container`)
    .find(`.${prefix}--form-requirement`)
    .should('contain.text', moistureData.mc.invalidDateErrorMsg);
});

When('I select the {string} page category {string}', (page: string, category: string) => {
  cy.get(CONSEP_PAGE_IDS[page].category)
    .click();

  cy.contains(`.${prefix}--list-box__menu-item__option`, category)
    .click();
});

Then('the {string} page category should be {string}', (page: string, category: string) => {
  cy.get(CONSEP_PAGE_IDS[page].category)
    .should('contain.value', category);
});

Then('the {string} comment input should have placeholder', (page: string) => {
  cy.get(CONSEP_PAGE_IDS[page].comments)
    .should('have.attr', 'placeholder', getCommentPlaceholder(page));
});

When('I enter the {string} page comment', (page: string) => {
  cy.get(CONSEP_PAGE_IDS[page].comments)
    .clear()
    .type(moistureData.mc.testComment, { delay: TYPE_DELAY })
    .blur();
});

Then('the {string} page comment should be visible', (page: string) => {
  cy.get(CONSEP_PAGE_IDS[page].comments)
    .should('have.value', moistureData.mc.testComment);
});
