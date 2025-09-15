import { FIVE_SECONDS, TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';
import { PageHeaderLabels } from '../../utils/labels';

describe('Create FDI Seedlot', () => {
  let fixtureData: SeedlotRegFixtureType = {};
  beforeEach(() => {
    cy.fixture('aclass-seedlot').then((jsonData) => {
      fixtureData = jsonData;
    });

    cy.login();
    cy.visit('/seedlots/register-a-class');
    // Wait for the page title to be visible before proceeding
    cy.get('.title-section h1')
      .should('have.text', PageHeaderLabels.CreateAClass, { timeout: FIVE_SECONDS });
  });

  it('Register fdi seedlot', () => {
    const regData = fixtureData.fdi;
    // Intercept the POST request
    cy.intercept('POST', '/api/seedlots').as('postSeedlot');

    // Enter the applicant agency number
    cy.get('#agency-number-input')
      .clear()
      .type(regData.agencyNumber, { delay: TYPE_DELAY })
      .blur({ force: true });

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

    // Click on the section title
    cy.contains('.section-title', 'Seedlot information')
      .click();

    cy.contains('.bx--label', 'Agency location code')
      .closest('.loading-input-wrapper')
      .then(($section) => {
        if ($section.find('#agency-number-input-error-msg').length) {
          // Error message is present, re-enter the agency number
          cy.get('#agency-number-input')
            .clear()
            .type('11', { delay: TYPE_DELAY })
            .blur({ force: true });

          // Click on the section title
          cy.contains('.section-title', 'Seedlot information')
            .click();

          // Wait for the error message to disappear
          cy.get('#agency-number-input-error-msg').should('not.exist');
        }
      });

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
