import { SeedlotRegFixtureType } from '../../definitions';

describe('Applicant and seedlot information page', () => {
  let seedlotNumber: string;
  let fixtureData: SeedlotRegFixtureType;

  before(() => {
    cy.fixture('aclass-seedlot').then((fData) => {
      fixtureData = fData;
      cy.task('getData', fData.fdi.species).then((sNumber) => {
        seedlotNumber = sNumber as string;
      });
    });
  });

  it('GET /api/seedlots to fetch seedlot details', () => {
    const regData = fixtureData.fdi;
    cy.request('GET', `/api/seedlot/${seedlotNumber}`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('applicantLocationCode', regData.agencyNumber);
    });
  });

  it('check unsuccessful GET response', () => {
    const fakeSeedlotNumber = '0005435';
    cy.request('GET', `/api/seedlot/${fakeSeedlotNumber}`).then((response) => {
      expect(response.status).to.eq(400);
    });
  });
});
