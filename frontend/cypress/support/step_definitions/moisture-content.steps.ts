import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { mockMoistureContentApi } from '../mockApiConsep';
import { MoistureContentType, SeedlotReplicateInfoType } from '../../definitions';
import { loadFixtureAndAlias } from '../helpers/fixture-loader';

let mcData: MoistureContentType;

Given('moisture content API responses are mocked', () => {
  mockMoistureContentApi();
});

Given('the moisture content fixture is loaded', () => {
  loadFixtureAndAlias<MoistureContentType>('moisture-content', 'mcData', (data) => {
    mcData = data;
  });
});

Given('the moisture seedlot replicate info fixture is loaded', () => {
  loadFixtureAndAlias<SeedlotReplicateInfoType>('moisture-seedlot-replicate-info', 'seedlotData');
});

Then('I can see the moisture content page title', () => {
  cy.get('.consep-moisture-content-title')
    .find('h1')
    .should('contain.text', mcData.mc.title);
});

Then('I can see the activity results table title', () => {
  cy.get('.activity-result-actions-title')
    .find('h3')
    .should('contain.text', mcData.table.title);
});

Then('the moisture activity results table initially shows {int} rows', (rowCount: number) => {
  cy.waitForTableData('.activity-result-container');

  cy.get('.activity-result-container tbody tr')
    .should('have.length', rowCount);
});

When('I add a new moisture replicate row', () => {
  cy.contains('button', 'Add row').click();
});

Then('the moisture activity results table shows {int} rows', (rowCount: number) => {
  cy.get('.activity-result-container tbody tr')
    .should('have.length', rowCount);
});

When('I enter {string} in the last moisture row container id field', (value: string) => {
  cy.get('.activity-result-container tbody tr')
    .last()
    .find('input[name="containerId"]')
    .clear()
    .type(value);
});

Then('the last moisture row should show the container id validation error', () => {
  cy.get('.activity-result-container tbody tr')
    .last()
    .find('p.Mui-error')
    .should('contain', mcData.table.containerErrorMsg);
});

When('I enter {string} in the last moisture row container weight field', (value: string) => {
  cy.get('.activity-result-container tbody tr')
    .last()
    .find('input[name="containerWeight"]')
    .clear()
    .type(value);
});

Then('the last moisture row should show the container weight validation error', () => {
  cy.get('.activity-result-container tbody tr')
    .last()
    .find('p.Mui-error')
    .should('contain', mcData.table.containerWeightErrorMsg);
});

When('I enter {string} in the last moisture row fresh seed field', (value: string) => {
  cy.get('.activity-result-container tbody tr')
    .last()
    .find('input[name="freshSeed"]')
    .clear()
    .type(value);
});

Then('the last moisture row should show the fresh seed validation error', () => {
  cy.get('.activity-result-container tbody tr')
    .last()
    .find('p.Mui-error')
    .should('contain', mcData.table.containerWeightErrorMsg);
});

When('I enter {string} in the last moisture row container and dry weight field', (value: string) => {
  cy.get('.activity-result-container tbody tr')
    .last()
    .find('input[name="containerAndDryWeight"]')
    .clear()
    .type(value);
});

Then('the last moisture row should show the container and dry weight validation error', () => {
  cy.get('.activity-result-container tbody tr')
    .last()
    .find('p.Mui-error')
    .should('contain', mcData.table.containerWeightErrorMsg);
});

When('I calculate average moisture content from accepted replicates', () => {
  cy.waitForTableData('.activity-result-container');

  cy.get('.activity-result-container tbody tr').each(($row) => {
    cy.wrap($row)
      .find('td[data-index="7"] input[type="checkbox"]')
      .check()
      .should('be.checked');
  });

  cy.get('.consep-registration-button-row')
    .contains('button', 'Calculate average')
    .click();
});

Then('the activity summary result value should equal the calculate-average API response', () => {
  cy.wait('@POST_calculate_average').then(({ response }) => {
    expect(response?.statusCode).to.eq(200);
    const averageMc = Number(response?.body);

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(4)
      .should(($el) => {
        const displayedValue = parseFloat(($el.text() || '').trim());
        expect(displayedValue).to.eq(averageMc);
      });
  });
});
