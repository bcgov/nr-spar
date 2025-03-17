import { SeedlotRegFixtureType } from '../../definitions';

describe('Applicant and seedlot information page', () => {
  let seedlotNumber: string;
  let fixtureData: SeedlotRegFixtureType;

  beforeEach(() => {
    cy.fixture('aclass-seedlot').then((fData) => {
      fixtureData = fData;
      cy.task('getData', fData.fdi.species).then((sNumber) => {
        seedlotNumber = sNumber as string;
      });
    });

    cy.login();
  });

  it('GET /api/seedlots to fetch seedlot details', () => {
    const regData = fixtureData.fdi;
    cy.intercept('GET', `/api/seedlots/${seedlotNumber}`).as('getSeedlot');

    cy.visit(`/seedlots/details/${seedlotNumber}`);
    cy.wait('@getSeedlot').then((interception) => {
      // Check that the request method is GET
      expect(interception.response?.statusCode).to.eq(200);

      // Check the response body
      const responseBody = interception.response?.body.seedlot;
      expect(responseBody).to.have.property('applicantLocationCode', regData.agencyNumber);
    });
  });

  it('404 test', () => {
    // Visit a non-existent URL
    cy.visit('/dashboard1', { failOnStatusCode: false }).then(() => {
      cy.get('h1').should('contain', 'Page not found');
    });
  });
});
