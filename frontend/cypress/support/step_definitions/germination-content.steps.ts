import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { mockGerminationApi } from '../mockApiConsep';
import { typeAndWaitForAutosave } from '../helpers/autosave';
import { ONE_SECOND } from '../../constants';
import { GerminationCountDaySaveRequest, GerminationCountSaveRequest } from '../../definitions';

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

When('I enter {string} for germination replicate {int} on day {int} and wait for auto-save', (
  value: string,
  replicateNumber: number,
  slotIndex: number
) => typeAndWaitForAutosave(
  `[data-testid="germ-count-${replicateNumber}-${slotIndex}"]`,
  value,
  '@PUT_germ_counts',
  ({ body }) => {
    const payload = body as GerminationCountSaveRequest;
    const countField = `rep${replicateNumber}NoSeedsGerm` as keyof GerminationCountDaySaveRequest;
    return payload.days.some((day) => (
      day.slotIndex === slotIndex && day[countField] === Number(value)
    ));
  }
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

Then('the germination count and date controls are disabled', () => {
  cy.getByDataTest('germ-count-1-1').should('be.disabled');
  cy.getByDataTest('germ-date-trigger-1').should('be.disabled');
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
