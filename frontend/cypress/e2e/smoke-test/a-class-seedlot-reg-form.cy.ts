import { TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

describe('A Class Seedlot Registration form', () => {
  let regFormData: {
    collector: {
      titleAgency: string;
      subtitleAgency: string;
      titleInformation: string;
      subtitleInformation: string;
      checkboxText: string;
      acronymErrorMsg: string;
      locationErrorMsg: string;
      invalidDateErrorMsg: string;
      numOfContainerErrorMsg: string;
      volOfConesErrorMsg: string;
    },
    interimStorage: {
      title: string;
      subtitle: string;
      acronymErrorMsg: string;
      locationErrorMsg: string;
      invalidDateErrorMsg: string;
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
<<<<<<< HEAD
=======
      cy.task('getData', fData[speciesKey].species).then((sNumber) => {
        seedlotNum = sNumber as string;
        cy.visit(`/seedlots/a-class-registration/${seedlotNum}`);
        cy.url().should('contains', `/seedlots/a-class-registration/${seedlotNum}`);
      });
      testAcronym = seedlotData.dr.agencyAcronym;
      testPopupAcronym = seedlotData.cw.agencyAcronym;
>>>>>>> d0e877b8 (feat: use task to get seedlot number, remove force option)
    });
  });

  // Step 1
  it('edit seedlot form button should display page details correctly', () => {
    const regData = regFormData.collector;
    cy.url().should('contains', `seedlots/a-class-registration/${seedlotNum}`);

    cy.get('.seedlot-registration-title')
      .find('h1')
      .should('have.text', 'Seedlot Registration');

    cy.get('.seedlot-registration-title')
      .find('.seedlot-form-subtitle')
      .should('contain.text', `Seedlot ${seedlotNum}`);

    cy.get('.collection-step-row')
      .find('h2')
      .eq(0)
      .should('have.text', regData.titleAgency);

    cy.get('.collection-step-row')
      .find('.subtitle-section')
      .eq(0)
      .should('have.text', regData.subtitleAgency);

    cy.get('.collection-step-row')
      .find('h2')
      .eq(1)
      .should('have.text', regData.titleInformation);

    cy.get('.collection-step-row')
      .find('.subtitle-section')
      .eq(1)
      .should('have.text', regData.subtitleInformation);
  });

  it('check collector agency section details are correct', () => {
    const regData = regFormData.collector;
    cy.get('#collection-step-default-checkbox')
      .should('be.checked');

    cy.get('.agency-information-section')
      .find(`.${prefix}--checkbox-wrapper`)
      .should('have.text', regData.checkboxText);

    cy.get('#collection-collector-agency')
      .should('have.value', seedlotData[speciesKey].agencyAcronym);

    cy.get('#collection-location-code')
<<<<<<< HEAD
      .should('have.value', seedlotData[species].agencyNumber);
=======
      .should('have.value', seedlotData[speciesKey].agencyNumber);
  });
>>>>>>> d0e877b8 (feat: use task to get seedlot number, remove force option)

    // Change inputs
    cy.get('#collection-step-default-checkbox')
      .uncheck({ force: true });

    cy.get('#collection-collector-agency')
      .type('ggg')
      .blur();

    cy.get('#collection-collector-agency-error-msg')
      .should('have.text', regData.acronymErrorMsg);

<<<<<<< HEAD
    // Popup test
=======
    // Enter valid test acronym
    cy.get('#collection-collector-agency')
      .clear()
      .type(testAcronym)
      .blur();

    cy.get(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');

    // Enter invalid location code
    cy.get('#collection-location-code')
      .clear()
      .type('96', { delay: TYPE_DELAY })
      .blur();

    cy.get('#collection-location-code-error-msg')
      .should('have.text', fixtureData.locationErrorMsg);

    // Enter valid location code
    cy.get('#collection-location-code')
      .clear()
      .type('02')
      .blur();
  });

  it('collector agency popup test', () => {
>>>>>>> d0e877b8 (feat: use task to get seedlot number, remove force option)
    cy.get('.agency-information-section')
      .find('button.client-search-toggle-btn')
      .click();

    cy.get('#client-search-dropdown')
      .find(`button.${prefix}--list-box__field`)
      .click();

    cy.get('#client-search-dropdown')
      .find('li')
      .contains('Acronym')
      .click();

    cy.get('#client-search-input')
      .clear()
<<<<<<< HEAD
      .type(seedlotData.dr.agencyAcronym, { force: true })
=======
      .type(testPopupAcronym)
>>>>>>> d0e877b8 (feat: use task to get seedlot number, remove force option)
      .blur();

    cy.get('button.client-search-button')
      .contains('Search')
      .click();

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(0)
      .find('td:nth-child(1)')
      .find(`input.${prefix}--radio-button`)
      .check({ force: true });

    cy.get(`button.${prefix}--btn--primary`)
      .contains('Apply selected client')
      .click();
    // End Popup test

    cy.get(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');

    cy.get('#collection-location-code')
      .clear()
      .type('96', { delay: TYPE_DELAY })
      .blur();

    cy.get('#collection-location-code-error-msg')
      .should('have.text', regData.locationErrorMsg);

    cy.get('#collection-location-code')
      .clear()
      .type('02')
      .blur();
  });

  it('check collector information section details are correct', () => {
    const regData = regFormData.collector;
    cy.get('#collection-end-date')
      .clear()
      .type('2024-05-28')
      .blur();

    cy.get('#collection-start-date')
      .clear()
      .type('2024-05-29')
      .blur();

    cy.get(`.${prefix}--date-picker`)
      .find(`.${prefix}--form-requirement`)
      .should('have.length', 2)
      .and('contain.text', regData.invalidDateErrorMsg);

    cy.get('#collection-start-date')
      .clear()
      .type('2024-05-27')
      .blur();

    // Invalid collection test
    cy.get('#collection-num-of-container')
      .clear()
      .type('10001')
      .blur();

    cy.get('#collection-num-of-container-error-msg')
      .should('have.text', regData.numOfContainerErrorMsg);

    cy.get('#collection-vol-per-container')
      .clear()
      .type('10001')
      .blur();

    cy.get('#collection-vol-per-container-error-msg')
      .should('have.text', regData.numOfContainerErrorMsg);

    cy.get('#collection-vol-of-cones')
      .should('have.value', '100020001.000');

    cy.get('#collection-vol-of-cones')
      .clear()
      .type('10')
      .blur();

    cy.get('#collection-vol-of-cones-warn-msg')
      .should('have.text', regData.volOfConesErrorMsg);

    // Input correct values in collection field
    cy.get('#collection-num-of-container')
      .clear()
      .type('15')
      .blur();

    cy.get('#collection-vol-per-container')
      .clear()
      .type('2')
      .blur();

    cy.get('#collection-vol-of-cones')
      .should('have.value', '30.000');

    cy.get('#cone-collection-method-checkbox-1')
      .check({ force: true })
      .blur();

    cy.get('#collection-comments')
      .clear()
      .type('Test comment')
      .blur();

    // Press next button
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Next')
      .click();

    // Check svg with complete checkmark on Step 1
    cy.get('ul.spar-seedlot-reg-progress-bar li')
      .eq(0)
      .should('have.class', `${prefix}--progress-step--complete`);
  });

  // Step 3
  it('check interim storage information section details are correct', () => {
    const regData = regFormData.interimStorage;
    cy.get(`button.${prefix}--progress-step-button[title="Interim storage"]`)
      .click();

    cy.get('.interim-agency-storage-form')
      .find('h2')
      .should('have.text', regData.title);

    cy.get('.interim-agency-storage-form')
      .find('.subtitle-section')
      .should('have.text', regData.subtitle);

    cy.get('#interim-agency')
      .should('have.value', seedlotData.dr.agencyAcronym);

    cy.get('#interim-location-code')
      .should('have.value', '02');

    cy.get('#interim-use-collection-agency')
      .should('be.checked');

    cy.get('#interim-use-collection-agency')
      .uncheck({ force: true });

    cy.get('#interim-agency')
      .clear()
      .type('ggg')
      .blur();

    cy.get('#interim-agency-error-msg')
<<<<<<< HEAD
      .should('have.text', regData.acronymErrorMsg);
=======
      .should('have.text', fixtureData.acronymErrorMsg);

    // Enter valid acronym
    cy.get('#interim-agency')
      .clear()
      .type(testAcronym)
      .blur();

    // Enter invalid location code
    cy.get('#interim-location-code')
      .clear()
      .type('96', { delay: TYPE_DELAY })
      .blur();

    cy.get('#interim-location-code-error-msg')
      .should('have.text', fixtureData.locationErrorMsg);

    // Enter valid location code
    cy.get('#interim-location-code')
      .clear()
      .type('01')
      .blur();
  });

  it('interim storage popup test', () => {
    cy.get(`button.${prefix}--progress-step-button[title="Interim storage"]`)
      .click();
>>>>>>> d0e877b8 (feat: use task to get seedlot number, remove force option)

    // Popup test
    cy.get('.agency-information-section')
      .find('button.client-search-toggle-btn')
      .click();

    cy.get('#client-search-dropdown')
      .find(`button.${prefix}--list-box__field`)
      .click();

    cy.get('#client-search-dropdown')
      .find('li')
      .contains('Acronym')
      .click();

    cy.get('#client-search-input')
      .clear()
<<<<<<< HEAD
      .type(seedlotData.cw.agencyAcronym, { force: true })
=======
      .type(testPopupAcronym)
>>>>>>> d0e877b8 (feat: use task to get seedlot number, remove force option)
      .blur();

    cy.get('button.client-search-button')
      .contains('Search')
      .click();

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(0)
      .find('td:nth-child(1)')
      .find(`input.${prefix}--radio-button`)
      .check({ force: true });

    cy.get(`button.${prefix}--btn--primary`)
      .contains('Apply selected client')
      .click();
    // End Popup test

    cy.get('#interim-agency')
      .should('have.value', seedlotData.cw.agencyAcronym);

    cy.get('#interim-location-code')
      .clear()
      .type('96', { delay: TYPE_DELAY })
      .blur();

    cy.get('#interim-location-code-error-msg')
      .should('have.text', regData.locationErrorMsg);

    cy.get('#interim-location-code')
      .clear()
      .type('01', { force: true })
      .blur();

    // Check invalid date error msg
    cy.get('#end-date-input')
      .clear()
      .type('2024-05-28')
      .blur();

    cy.get('#start-date-input')
      .clear()
      .type('2024-05-29')
      .blur();

    cy.get(`.${prefix}--date-picker`)
      .find(`.${prefix}--form-requirement`)
      .should('have.length', 2)
      .and('contain.text', regData.invalidDateErrorMsg);

    // Enter valid dates
    cy.get('#start-date-input')
      .clear()
      .type('2024-05-25')
      .blur();

    cy.get('#end-date-input')
      .clear()
      .type('2024-05-26')
      .blur();

    // Radio button test
    cy.get('#facility-type-radio-btn-ocv')
      .should('be.checked');

    cy.get('#facility-type-radio-btn-oth')
      .check({ force: true })
      .blur();

    cy.get('#storage-other-type-input')
      .should('be.visible');

    cy.get('#storage-other-type-input')
      .clear()
      .type('Test comment')
      .blur();

    // Press next button
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Next')
      .click();

    // Check svg with complete checkmark on Step 3
    cy.get('ul.spar-seedlot-reg-progress-bar li')
      .eq(2)
      .should('have.class', `${prefix}--progress-step--complete`);
  });
});
