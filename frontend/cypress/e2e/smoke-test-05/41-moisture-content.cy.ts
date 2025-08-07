import { TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { mockMoistureContentApi } from '../../support/mockApiConsep';

describe('Moisture Content Screen page', () => {
  beforeEach(() => {
    mockMoistureContentApi();
    cy.login();
    cy.visit('/consep/manual-moisture-content/514330');
    cy.url().should('contains', '/consep/manual-moisture-content/514330');
  });

  it('should load and display manual moisture content page correctly', () => {
    // Check if the page title is displayed correctly
    cy.get('.consep-moisture-content-title')
      .find('h1')
      .contains('Moisture content cones for seedlot');

    // Check if the table title is displayed correctly
    cy.get('.activity-result-actions-title')
      .find('h3')
      .contains('Activity results per replicate');
  });

  it('Check breadcrumbs section', () => {
    // Check if the breadcrumbs are displayed correctly
    cy.get('.consep-moisture-content-breadcrumb')
      .find('li')
      .should('have.length', 3)
      .and('contain', 'CONSEP')
      .and('contain', 'Testing activities search')
      .and('contain', 'Testing list');
  });

  it('Check Activity summary section', () => {
    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(0)
      .should('have.text', 'MC');

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(1)
      .should('have.text', '60662');

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(2)
      .should('have.text', 'SSP20000093');

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(3)
      .should('have.text', 'FDC | A');

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(4)
      .should('have.text', '0.5');
  });

  it('Check Activity results table validation', () => {
    // Check if the table has the correct number of rows
    cy.get('.activity-result-container')
      .find('tbody tr')
      .as('totalRows')
      .should('have.length', 2);

    // Check 'Add row' button functionality
    cy.get('.activity-result-action-buttons')
      .find('button')
      .contains('Add row')
      .click();

    cy.get('@totalRows')
      .should('have.length', 3);

    // Check validation of Container input
    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerId"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', 'Must be no more than 4 characters');

    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerId"]')
      .click()
      .clear()
      .type('15', { delay: TYPE_DELAY });

    // Check validation of Container weight input
    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerWeight"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', 'Must be no more than 4 characters');

    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerWeight"]')
      .click()
      .clear()
      .type('20', { delay: TYPE_DELAY });

    // Check validation of Fresh seed input
    cy.get('@totalRows')
      .eq(2)
      .find('input[name="freshSeed"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', 'Must be no more than 4 characters');

    cy.get('@totalRows')
      .eq(2)
      .find('input[name="freshSeed"]')
      .click()
      .clear()
      .type('30', { delay: TYPE_DELAY });

    // Check validation of Cont + Dry seed input
    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerAndDryWeight"]')
      .click()
      .type('10011', { delay: TYPE_DELAY });

    cy.get('p.Mui-error')
      .should('contain', 'Must be no more than 4 characters');

    cy.get('@totalRows')
      .eq(2)
      .find('input[name="containerAndDryWeight"]')
      .click()
      .clear()
      .type('38', { delay: TYPE_DELAY });
  });

  it('should have correct Date functionality and validations', () => {
    // Check if the date input has a placeholder
    cy.get(`.${prefix}--date-picker-container`)
      .find('input')
      .should('have.attr', 'placeholder', 'yyyy/mm/dd');

    cy.get('#moisture-content-end-date-picker')
      .clear()
      .type('2025-05-28', { delay: TYPE_DELAY })
      .blur();

    // Invalid start date
    cy.get('#moisture-content-start-date-picker')
      .clear()
      .type('2025-05-29', { delay: TYPE_DELAY })
      .blur();

    // Valid start date
    cy.get('#moisture-content-start-date-picker')
      .clear()
      .type('2025-05-27', { delay: TYPE_DELAY })
      .blur();
  });

  it('Check Comment box', () => {
    // Check if the comment input has a placeholder
    cy.get('#moisture-content-comments')
      .should('have.attr', 'placeholder', 'My comments about this activity');

    // Type a comment
    cy.get('#moisture-content-comments')
      .clear()
      .type('This is a test comment', { delay: TYPE_DELAY })
      .blur()
      .should('have.value', 'This is a test comment');
  });
});
