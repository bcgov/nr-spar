import prefix from '../../../src/styles/classPrefix';

describe('A Class Seedlot Registration form, Parent Tree Calculations Part 1', () => {
  let seedlotNum: string;
  const speciesKey = 'pli';

  beforeEach(() => {
    // Login
    cy.login();

    cy.fixture('aclass-seedlot').then((fData) => {
      cy.task('getData', fData[speciesKey].species).then((sNumber) => {
        seedlotNum = sNumber as string;
        const url = `/seedlots/a-class-registration/${seedlotNum}/?step=5`;
        cy.visit(url);
        cy.url().should('contains', url);
      });
    });
  });

  it('Check Parent tree contribution summary', () => {
    cy.get('#totalnumber of parent trees')
      .should('have.value', '');

    cy.get('#totalnumber of cone count')
      .should('have.value', '');

    cy.get('#totalnumber of pollen count')
      .should('have.value', '');
  });
});
