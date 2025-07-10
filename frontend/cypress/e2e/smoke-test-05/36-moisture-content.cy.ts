import prefix from '../../../src/styles/classPrefix';

describe('Moisture Content Screen page', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/consep/manual-moisture-content/:riaKey');
    cy.url().should('contains', '/consep/manual-moisture-content/:riaKey');
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

  it('should have correct Date functionality and validations', () => {
    // Check if the date input has a placeholder
    cy.get(`.${prefix}--date-picker-container`)
      .find('input')
      .should('have.attr', 'placeholder', 'yyyy/mm/dd');

    cy.get('#moisture-content-end-date-picker')
      .clear()
      .type('2025-05-28')
      .blur();

    // Invalid start date
    cy.get('#moisture-content-start-date-picker')
      .clear()
      .type('2025-05-29')
      .blur();

    // Valid start date
    cy.get('#moisture-content-start-date-picker')
      .clear()
      .type('2025-05-27')
      .blur();
  });

  it('Check Comment box', () => {
    // Check if the comment input has a placeholder
    cy.get('#moisture-content-comments')
      .should('have.attr', 'placeholder', 'My comments about this activity');

    // Type a comment
    cy.get('#moisture-content-comments')
      .clear()
      .type('This is a test comment')
      .blur()
      .should('have.value', 'This is a test comment');
  });
});
