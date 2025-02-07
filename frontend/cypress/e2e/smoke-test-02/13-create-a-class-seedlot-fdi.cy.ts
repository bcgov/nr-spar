import { TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

describe('Create FDI Seedlot', () => {
  let fixtureData: SeedlotRegFixtureType = {};
  beforeEach(() => {
    cy.fixture('aclass-seedlot').then((jsonData) => {
      fixtureData = jsonData;
    });

    cy.login();
    cy.visit('/seedlots/register-a-class');
  });

  it('Register fdi seedlot', () => {
    const regData = fixtureData.fdi;
    // Intercept the POST request
    cy.intercept('POST', '/api/seedlots').as('postSeedlot');

    // Enter the applicant agency number
    cy.get('#agency-number-input')
      .clear()
      .type(regData.agencyNumber, { delay: TYPE_DELAY })
      .blur();

    // Enter the applicant email address
    cy.get('#applicant-email-input')
      .clear()
      .type(regData.email, { delay: TYPE_DELAY })
      .blur();

    // Enter the seedlot species, wait for species data to load
    cy.get('#seedlot-species-combobox')
      .click();
    cy.contains(`.${prefix}--list-box__menu-item__option`, regData.species)
      .scrollIntoView()
      .click();

    // Select the to be registered according to fixture
    const regIdToClick = regData.toBeRegistered ? '#register-w-tsc-yes' : '#register-w-tsc-no';
    cy.get(regIdToClick)
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
      .click();
    cy.get(regIdToClick)
      .should('be.checked');

    // Select the Collected within BC according to fixture
    const collectedIdToClick = regData.withinBc ? '#collected-within-bc-yes' : '#collected-within-bc-no';
    cy.get(collectedIdToClick)
      .siblings(`.${prefix}--radio-button__label`)
      .find(`.${prefix}--radio-button__appearance`)
      .click();
    cy.get(collectedIdToClick)
      .should('be.checked');

    // Click on button Create seedlot number
    cy.get('.submit-button')
      .click();

    cy.url().should('contains', '/creation-success');

    // remember seedlot number
    cy.get('#created-seedlot-number').invoke('text')
      .then((seedlotNumber) => {
        cy.task('setData', [regData.species, seedlotNumber]);
      });
    cy.log('A-Class seedlot created with species', regData.species);

    // Wait for the intercepted request and verify its response
    cy.wait('@postSeedlot').then((interception) => {
      // Check that the request method is POST
      expect(interception.response?.statusCode).to.eq(201);

      // Check the request body
      const requestBody = interception.request.body;
      expect(requestBody).to.have.property('applicantEmailAddress', regData.email);
    });
  });
});
