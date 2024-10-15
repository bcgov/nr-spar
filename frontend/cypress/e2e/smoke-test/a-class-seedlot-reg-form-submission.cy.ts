import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

describe('A Class Seedlot Registration form, Parent Tree and SMP part-3(Calculation of SMP mix)', () => {
  let regFormData: {
    submission: {
      title: string;
      subtitle: string;
      checkboxText: string;
      successTitle: string;
      successSubtitle: string;
    }
  };

  let seedlotNum: string;
  const speciesKey = 'pli';
  let seedlotData: SeedlotRegFixtureType;

  beforeEach(() => {
    // Login
    cy.login();
    cy.fixture('aclass-reg-form').then((fData) => {
      regFormData = fData;
    });

    cy.fixture('aclass-seedlot').then((fData) => {
      seedlotData = fData;
      cy.task('getData', fData[speciesKey].species).then((sNumber) => {
        seedlotNum = sNumber as string;
        const url = `/seedlots/a-class-registration/${seedlotNum}/?step=6`;
        cy.visit(url);
        cy.url().should('contains', url);

        // Press submission button
        cy.get('.seedlot-registration-button-row')
          .find('button.submit-modal-btn')
          .contains('Submit Registration')
          .click();
      });
    });
  });

  it('Popup title and subtitles', () => {
    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .should('be.visible');

    cy.get(`h3.${prefix}--modal-header__heading`)
      .should('have.text', regFormData.submission.title);

    cy.get(`.${prefix}--modal-content`)
      .find('p')
      .should('have.text', regFormData.submission.subtitle);

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .find(`span.${prefix}--checkbox-label-text`)
      .should('have.text', regFormData.submission.checkboxText);
  });

  it('Redirect to first step', () => {
    const redirectUrl = `/seedlots/a-class-registration/${seedlotNum}/?step=1`;
    cy.get(`a.${prefix}--link`)
      .contains('Click here to go back to the first step.')
      .click();

    cy.url().should('contains', redirectUrl);
  });

  it('Check buttons', () => {
    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .find(`button.${prefix}--btn--secondary`)
      .contains('Cancel')
      .as('cancelButton')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .should('not.be.visible');

    // Press submission button
    cy.get('.seedlot-registration-button-row')
      .find('button.submit-modal-btn')
      .contains('Submit Registration')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .should('be.visible');

    // Check default checkbox behaviour
    cy.get('#declaration-modal-checkbox')
      .should('not.be.checked');

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .find(`button.${prefix}--btn--primary`)
      .contains('Submit seedlot')
      .as('submitButton')
      .should('be.disabled');

    // Check the checkbox
    cy.get('#declaration-modal-checkbox')
      .check({ force: true });

    cy.get('@submitButton')
      .should('not.be.disabled');

    cy.get('@cancelButton')
      .click();

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Check Submit process', () => {
    const submissionUrl = `/seedlots/details/${seedlotNum}?isSubmitSuccess=true`;

    // Check the checkbox
    cy.get('#declaration-modal-checkbox')
      .check({ force: true });

    // Click submit seedlot button
    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .find(`button.${prefix}--btn--primary`)
      .contains('Submit seedlot')
      .click();

    cy.url().should('contains', submissionUrl);

    cy.get('.seedlot-submitted-notification')
      .should('be.visible');

    cy.get('.seedlot-submitted-notification')
      .find(`.${prefix}--inline-notification__title`)
      .should('have.text', regFormData.submission.successTitle);

    cy.get('.seedlot-submitted-notification')
      .find(`.${prefix}--inline-notification__subtitle`)
      .should('have.text', regFormData.submission.successSubtitle);

    cy.contains('p.seedlot-summary-info-label', 'Status')
      .next()
      .children('span')
      .should('have.text', 'Submitted');
  });
});
