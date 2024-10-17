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
  const fundingSource = 'FTM - Forests for Tomorrow MOF Admin';
  const F2GameticValue = 'F2 - Measured Cone Volume';
  const M3GameticValue = 'M3 - Pollen Volume Estimate by 100% Survey';

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
      });
    });
  });

  it('Check step completion', () => {
    // Step 1 check
    cy.get(`.${prefix}--progress-step--complete`)
      .contains('Collection')
      .then($element => {
        if ($element.length > 0) {
          cy.log('Step 1 complete');
        } else {
          const url = `/seedlots/a-class-registration/${seedlotNum}/?step=1`;
          cy.log('Step 1 incomplete');
          cy.visit(url);

          // Enter Collection start date
          cy.get('#collection-start-date')
            .clear()
            .type('2024-05-11')
            .blur();

          // Enter Collection end date
          cy.get('#collection-end-date')
            .clear()
            .type('2024-05-21')
            .blur();

          // Save changes
          cy.saveSeedlotRegFormProgress();
        }
      });

    // Step 2 check
    cy.get(`.${prefix}--progress-step--complete`)
      .contains('Ownership')
      .then($element => {
        if ($element.length > 0) {
          cy.log('Step 2 complete');
        } else {
          const url = `/seedlots/a-class-registration/${seedlotNum}/?step=2`;
          cy.log('Step 2 incomplete');
          cy.visit(url);

          // Expand the funding source combo box
          cy.get('#ownership-funding-source-0')
            .should('have.value', '')
            .click();

          cy.get(`.${prefix}--list-box__menu-item__option`)
            .contains(fundingSource)
            .scrollIntoView()
            .click();

          cy.get('#ownership-funding-source-0')
            .should('have.value', fundingSource);

          // Save changes
          cy.saveSeedlotRegFormProgress();
        }
      });

    // Step 3 check
    cy.get(`.${prefix}--progress-step--complete`)
      .contains('Interim storage')
      .then($element => {
        if ($element.length > 0) {
          cy.log('Step 3 complete');
        } else {
          const url = `/seedlots/a-class-registration/${seedlotNum}/?step=3`;
          cy.log('Step 3 incomplete');
          cy.visit(url);

          // Enter Interim start date
          cy.get('#start-date-input')
            .clear()
            .type('2024-05-11')
            .blur();

          // Enter Interim end date
          cy.get('#end-date-input')
            .clear()
            .type('2024-05-21')
            .blur();

          // Save changes
          cy.saveSeedlotRegFormProgress();
        }
      });

    // Step 4 check
    cy.get(`.${prefix}--progress-step--complete`)
      .contains('Orchard')
      .then($element => {
        if ($element.length > 0) {
          cy.log('Step 4 complete');
        } else {
          const url = `/seedlots/a-class-registration/${seedlotNum}/?step=4`;
          cy.log('Step 4 incomplete');
          cy.visit(url);

          // Select primary orchard
          cy.get('#primary-orchard-selection')
            .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
            .click();
  
          cy.get(`.${prefix}--list-box--expanded`)
            .find('ul li')
            .contains('219 - VERNON - S - PRD')
            .click();

          // Select female gametic contribution methodology
          cy.get('#orchard-female-gametic')
            .siblings()
            .click();

          cy.get(`.${prefix}--list-box--expanded`)
            .find('ul li')
            .contains(F2GameticValue)
            .click();

          cy.get('#orchard-female-gametic')
            .should('have.value', F2GameticValue);

          // Select male gametic contribution methodology
          cy.get('#orchard-male-gametic')
            .siblings()
            .click();

          cy.get(`.${prefix}--list-box--expanded`)
            .find('ul li')
            .contains(M3GameticValue)
            .click();

          cy.get('#orchard-male-gametic')
            .should('have.value', M3GameticValue);

          // Save changes
          cy.saveSeedlotRegFormProgress();
        }
      });

      // Step 5 check
      cy.get(`.${prefix}--progress-step--complete`)
      .contains('Orchard')
      .then($element => {
        if ($element.length > 0) {
          cy.log('Step 5 complete');
        } else {
          const url = `/seedlots/a-class-registration/${seedlotNum}/?step=5`;
          cy.log('Step 5 incomplete');
          cy.visit(url);

          // Wait for the table to load
          cy.get('#parentTreeNumber', { timeout: 10000 });

          // Enter cone count
          cy.get('#223-coneCount-value-input')
            .clear()
            .type('1')
            .blur();

          // Enter pollen count
          cy.get('#223-pollenCount-value-input')
            .clear()
            .type('1')
            .blur();

          // Save changes
          cy.saveSeedlotRegFormProgress();
        }
      });
  });

  it('Popup title and subtitles', () => {
    // Press submission button
    cy.get('.seedlot-registration-button-row')
      .find('button.submit-modal-btn')
      .contains('Submit Registration')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .should('be.visible');

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .find(`h3.${prefix}--modal-header__heading`)
      .should('have.text', regFormData.submission.title);

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .find(`.${prefix}--modal-content`)
      .children('p')
      .should('have.text', regFormData.submission.subtitle);

    cy.get(`.${prefix}--modal-container[aria-label="Seedlot registration"]`)
      .find(`span.${prefix}--checkbox-label-text`)
      .should('have.text', regFormData.submission.checkboxText);
  });

  it('Redirect to first step', () => {
    // Press submission button
    cy.get('.seedlot-registration-button-row')
      .find('button.submit-modal-btn')
      .contains('Submit Registration')
      .click();

    const redirectUrl = `/seedlots/a-class-registration/${seedlotNum}/?step=1`;
    cy.get(`a.${prefix}--link`)
      .contains('Click here to go back to the first step.')
      .click();

    cy.url().should('contains', redirectUrl);
  });

  it('Check buttons', () => {
    // Press submission button
    cy.get('.seedlot-registration-button-row')
      .find('button.submit-modal-btn')
      .contains('Submit Registration')
      .click();

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

    // Press submission button
    cy.get('.seedlot-registration-button-row')
      .find('button.submit-modal-btn')
      .contains('Submit Registration')
      .click();

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
