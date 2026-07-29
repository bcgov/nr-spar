import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';
import { mockPurityContentApi } from '../mockApiConsep';
import { PurityContentType, SeedlotReplicateInfoType } from '../../definitions';
import { loadFixtureAndAlias } from '../helpers/fixture-loader';
import { getImpurityRowAt, getPurityReplicateSection } from '../helpers/purity-helper';

let purityData: PurityContentType;

Given('purity content API responses are mocked', () => {
  mockPurityContentApi();
});

Given('the purity content fixture is loaded', () => {
  loadFixtureAndAlias<PurityContentType>('purity-content', 'purityData', (data) => {
    purityData = data;
  });
});

Given('the purity seedlot replicate info fixture is loaded for purity content', () => {
  loadFixtureAndAlias<SeedlotReplicateInfoType>('purity-seedlot-replicate-info', 'seedlotData');
});

Then('I can see the purity content page title', () => {
  cy.get('.consep-purity-content-title')
    .find('h1')
    .should('contain.text', purityData.pc.title);
});

Then('I can see the activity results table title for purity content', () => {
  cy.get('.consep-purity-content-activity-result')
    .find('h3')
    .should('contain.text', purityData.table.title);
});

Then('I can see the impurities section title', () => {
  cy.get('.consep-impurity-title')
    .find('h4')
    .should('have.text', 'Impurities');
});

When('I add an impurity row for replicate {string}', (replicateNumber: string) => {
  getPurityReplicateSection(replicateNumber)
    .contains('button', purityData.pc.impurityBtn)
    .click();
});

When('I select impurity type {string} for replicate {string} rank {string}', (
  impurityType: string,
  replicateNumber: string,
  rank: string
) => {
  getPurityReplicateSection(replicateNumber).within(() => {
    cy.get(`#impurity-rank-${rank}-`).should('be.visible');
    cy.get('.consep-impurity-combobox')
      .click();
    cy.contains(`.${prefix}--list-box__menu-item__option`, impurityType)
      .click();
  });

  cy.wait('@PATCH_impurity');

  cy.get('.consep-impurity-title')
    .find('h4')
    .click();
});

Then('impurity rank {string} for replicate {string} should show type {string}', (
  rank: string,
  replicateNumber: string,
  impurityType: string
) => {
  getPurityReplicateSection(replicateNumber).within(() => {
    // Check that the impurity rank input has the correct value
    cy.get(`#impurity-rank-${rank}-${impurityType}`)
      .should('contain.value', rank);

    // Check that the impurity type input has the correct value
    cy.get('.consep-impurity-combobox')
      .find('input')
      .should('contain.value', impurityType);
  });
});

When('I delete impurity row with rank {string} for replicate {string}', (
  rank: string,
  replicateNumber: string
) => {
  getImpurityRowAt(replicateNumber, rank)
    .find('.consep-impurity-content-remove button')
    .click();

  cy.wait('@DELETE_impurity');
});

Then('impurity at index {string} for replicate {string} should have rank {string}', (
  index: string,
  replicateNumber: string,
  rank: string
) => {
  getImpurityRowAt(replicateNumber, index)
    .find('.debris-rank-input input')
    .should('have.value', rank);
});

When('I add {int} impurity rows for replicate {string}', (count: number, replicateNumber: string) => {
  Cypress._.times(count, () => {
    getPurityReplicateSection(replicateNumber)
      .contains('button', purityData.pc.impurityBtn)
      .click();
  });
});

Then('the add impurity button should not be visible for replicate {string}', (replicateNumber: string) => {
  getPurityReplicateSection(replicateNumber)
    .find('button')
    .should('not.contain.text', purityData.pc.impurityBtn);
});

Then('I should see the maximum impurity error for replicate {string}', (replicateNumber: string) => {
  getPurityReplicateSection(replicateNumber)
    .contains(purityData.pc.maxImpuritiesErrorMsg)
    .should('be.visible');
});
