describe('Moisture Content Screen page', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/consep/manual-moisture-content/:riaKey');
    cy.url().should('contains', '/consep/manual-moisture-content/:riaKey');
  });
  it('should load and display manual moisture content page correctly', () => {
    cy.get('.consep-moisture-content-title')
      .find('h1')
      .contains('Moisture content cones for seedlot');
  });
});
