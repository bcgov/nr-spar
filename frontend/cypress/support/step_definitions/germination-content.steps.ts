import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { mockGerminationApi } from '../mockApiConsep';
import { typeAndWaitForAutosave } from '../helpers/autosave';
import { ONE_SECOND } from '../../constants';

Given('germination API responses are mocked', () => {
  mockGerminationApi();
});

Given('germination API responds with a conflict on the first save', () => {
  mockGerminationApi(true);
});

Then('the germination result screen has loaded', () => {
  cy.wait('@GET_germination_header');
  cy.wait('@GET_germ_counts');
  cy.wait('@GET_germ_replicates');
  cy.contains('h1', 'Germination test result').should('be.visible');
});

// Clicking an empty date column fills today's date; a dated one opens the modal.
When('I set germination count day {int} to today', (slotIndex: number) => {
  cy.getByDataTest(`germ-date-trigger-${slotIndex}`).click();
  cy.getByDataTest(`germ-count-1-${slotIndex}`).should('not.be.disabled');
});

When('I ensure germination count day {int} has a date', (slotIndex: number) => {
  cy.getByDataTest(`germ-count-1-${slotIndex}`).then(($input) => {
    if ($input.is(':disabled')) {
      cy.getByDataTest(`germ-date-trigger-${slotIndex}`).click();
      cy.getByDataTest(`germ-count-1-${slotIndex}`).should('not.be.disabled');
    }
  });
});

When('I enter {string} for germination replicate {int} on day {int} and wait for auto-save', (
  value: string,
  replicateNumber: number,
  slotIndex: number
) => typeAndWaitForAutosave(
  `[data-testid="germ-count-${replicateNumber}-${slotIndex}"]`,
  value,
  '@PUT_germ_counts'
));

When('I enter {string} for germination replicate {int} on day {int} and wait for conflict', (
  value: string,
  replicateNumber: number,
  slotIndex: number
) => {
  // Re-query per command: the count input re-mounts as the table re-renders.
  cy.get(`[data-testid="germ-count-${replicateNumber}-${slotIndex}"]`).clear();
  cy.get(`[data-testid="germ-count-${replicateNumber}-${slotIndex}"]`).type(value);
  cy.wait('@PUT_germ_counts').then(({ response }) => {
    expect(response?.statusCode).to.eq(409);
  });
});

Then('germination replicate {int} on day {int} should show {string}', (
  replicateNumber: number,
  slotIndex: number,
  value: string
) => {
  cy.getByDataTest(`germ-count-${replicateNumber}-${slotIndex}`).should('have.value', value);
});

When('I reload the germination result page', () => {
  cy.reload();
  cy.wait('@GET_germination_header');
  cy.wait('@GET_germ_counts');
  cy.wait('@GET_germ_replicates');
});

Then('the germination conflict banner is visible', () => {
  cy.contains('Conflict detected').should('be.visible');
});

Then('no additional germination save is sent before Reload', () => {
  cy.wait(ONE_SECOND);
  cy.get('@PUT_germ_counts.all').should('have.length', 1);
});

When('I click Reload on the germination conflict banner', () => {
  cy.contains('button', 'Reload').click();
  cy.wait('@GET_germ_counts');
  cy.contains('Conflict detected').should('not.exist');
});
