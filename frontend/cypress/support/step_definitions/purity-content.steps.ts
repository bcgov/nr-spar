import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';
import { mockPurityContentApi } from '../mockApiConsep';
import { PurityContentType, SeedlotReplicateInfoType } from '../../definitions';

let purityData: PurityContentType;

Given('purity content API responses are mocked', () => {
  mockPurityContentApi();
});

Given('the purity content fixture is loaded', () => {
  cy.fixture('purity-content').then((data: PurityContentType) => {
    purityData = data;
    cy.wrap(data).as('purityData');
  });
});

Given('the purity seedlot replicate info fixture is loaded', () => {
  cy.fixture('purity-seedlot-replicate-info').then((data: SeedlotReplicateInfoType) => {
    cy.wrap(data).as('seedlotData');
  });
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
  cy.contains('.consep-purity-content-replicate h5', `Replicate ${replicateNumber}`)
    .parent()
    .contains('button', purityData.pc.impurityBtn)
    .click();
});

When('I select impurity type {string} for replicate {string} rank {string}', (
  impurityType: string,
  replicateNumber: string,
  rank: string
) => {
  cy.get('.consep-purity-content-replicate')
    .contains('h5', `Replicate ${replicateNumber}`)
    .parent()
    .within(() => {
      cy.get(`#impurity-rank-${rank}-`).should('be.visible');
      cy.get('.consep-impurity-combobox')
        .click();
      cy.contains(`.${prefix}--list-box__menu-item__option`, impurityType)
        .click();
    });
});

Then('impurity rank {string} for replicate {string} should show type {string}', (
  rank: string,
  replicateNumber: string,
  impurityType: string
) => {
  cy.get('.consep-purity-content-replicate')
    .contains('h5', `Replicate ${replicateNumber}`)
    .parent()
    .within(() => {
      cy.get(`#impurity-rank-${rank}-`)
        .should('contain.value', rank);
      cy.get('.consep-impurity-combobox')
        .should('contain.text', impurityType);
    });
});

When('I delete impurity row with rank {string} for replicate {string}', (
  rank: string,
  replicateNumber: string
) => {
  cy.get('.consep-purity-content-replicate')
    .contains('h5', `Replicate ${replicateNumber}`)
    .parent()
    .find('.consep-impurity-content')
    .eq(Number(rank) - 1)
    .find('.consep-impurity-content-remove button')
    .click();

  cy.wait('@DELETE_impurity');
});

Then('impurity at index {string} for replicate {string} should have rank {string}', (
  index: string,
  replicateNumber: string,
  rank: string
) => {
  cy.get('.consep-purity-content-replicate')
    .contains('h5', `Replicate ${replicateNumber}`)
    .parent()
    .find('.consep-impurity-content')
    .eq(Number(index) - 1)
    .find('.debris-rank-input input')
    .should('have.value', rank);
});

When('I add {int} impurity rows for replicate {string}', (count: number, replicateNumber: string) => {
  Cypress._.times(count, () => {
    cy.contains('.consep-purity-content-replicate h5', `Replicate ${replicateNumber}`)
      .parent()
      .contains('button', purityData.pc.impurityBtn)
      .click();
  });
});

Then('the add impurity button should not be visible for replicate {string}', (replicateNumber: string) => {
  cy.contains('.consep-purity-content-replicate h5', `Replicate ${replicateNumber}`)
    .parent()
    .find('button')
    .should('not.contain.text', purityData.pc.impurityBtn);
});

Then('I should see the maximum impurity error for replicate {string}', (replicateNumber: string) => {
  cy.contains('.consep-purity-content-replicate h5', `Replicate ${replicateNumber}`)
    .parent()
    .contains(purityData.pc.maxImpuritiesErrorMsg)
    .should('be.visible');
});
