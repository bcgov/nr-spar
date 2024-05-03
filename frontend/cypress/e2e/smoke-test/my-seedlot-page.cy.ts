describe('Applicant and seedlot information page', () => {
  it('should edit a seedlot applicant info', () => {
    // Login
    cy.login();
    // Go to my seedlot page
    cy.visit('/seedlots/my-seedlots');
    cy.url().should('contains', '/seedlots/my-seedlots');

    cy.get('.my-seedlot-title')
      .find('.title-favourite')
      .children('h1')
      .should('have.text', 'My Seedlots');

    // Arrow button test
    cy.get('.bx--pagination__right')
      .find('.bx--popover--top-right')
      .find('button.bx--btn--icon-only')
      .click({ force: true });

    cy.visit('/seedlots/my-seedlots');

    // Sorting test
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-header-seedlotNumber')
      .click();

    cy.get('table.seedlot-data-table tbody tr')
      .eq(0)
      .find('td')
      .first()
      .should('have.text', '63001');

    // Search bar test
    cy.get('.bx--search')
      .find('input')
      .type('PLI');

    cy.get('table.seedlot-data-table tbody tr')
      .eq(0)
      .find('td:nth-child(3)')
      .should('have.text', 'PLI - Lodgepole pine');

    cy.visit('/seedlots/my-seedlots');

    // Dropdown test
    cy.get('.bx--pagination__left')
      .find('select')
      .select('20')
      .should('have.value', '20');

    // Click on a seedlot row
    cy.get('table.seedlot-data-table')
      .find('#seedlot-table-cell-63006-seedlotNumber')
      .click();

    cy.url().should('contains', '/seedlots/details/63006');

    cy.visit('/seedlots/my-seedlots');

    // //  Check total seedlots
    // cy.intercept('**/api/seedlots/users/**', {
    //   statusCode: 200,
    //   headers: {
    //     'X-Total-Count': '11'
    //   }
    // });

    // cy.request('**/api/seedlots/users/**').as('total-count');
    // cy.get('@total-count').its('headers').its('x-total-count')
    //   .should('include', '11');

    // Button test
    cy.get('.my-seedlot-title')
      .find('button.reg-seedlot-btn')
      .should('have.text', 'Register a new seedlot')
      .click();

    cy.url().should('contains', '/seedlots/register-a-class');
  });
});
