import { TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

describe('A Class Seedlot Registration form', () => {
  let regFormData: {
    collector: {
      agencyTitle: string;
      agencySubtitle: string;
      informationTitle: string;
      informationSubtitle: string;
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
  let testAcronym: string;
  let testPopupAcronym: string;

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
        cy.visit(`/seedlots/a-class-registration/${seedlotNum}`);
        cy.url().should('contains', `/seedlots/a-class-registration/${seedlotNum}`);
      });
      testAcronym = seedlotData.dr.agencyAcronym;
      testPopupAcronym = seedlotData.cw.agencyAcronym;
    });
  });

  // Step 1
  it('[Collection] check title and subtitles', () => {
    const fixtureData = regFormData.collector;
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
      .should('have.text', fixtureData.agencyTitle);

    cy.get('.collection-step-row')
      .find('.subtitle-section')
      .eq(0)
      .should('have.text', fixtureData.agencySubtitle);

    cy.get('.collection-step-row')
      .find('h2')
      .eq(1)
      .should('have.text', fixtureData.informationTitle);

    cy.get('.collection-step-row')
      .find('.subtitle-section')
      .eq(1)
      .should('have.text', fixtureData.informationSubtitle);
  });

  it('[Collection] check collector agency section details', () => {
    const fixtureData = regFormData.collector;
    cy.get('#collection-step-default-checkbox')
      .should('be.checked');

    cy.get('.agency-information-section')
      .find(`.${prefix}--checkbox-wrapper`)
      .should('have.text', fixtureData.checkboxText);

    cy.get('#collection-collector-agency')
      .should('have.value', seedlotData[speciesKey].agencyAcronym);

    cy.get('#collection-location-code')
      .should('have.value', seedlotData[speciesKey].agencyNumber);
  });

  it('[Collection] change collector agency section details', () => {
    const fixtureData = regFormData.collector;
    // Change inputs
    cy.get('#collection-step-default-checkbox')
      .uncheck({ force: true });

    // Enter invalid acronym
    cy.get('#collection-collector-agency')
      .type('ggg')
      .blur();

    cy.get('#collection-collector-agency-error-msg')
      .should('have.text', fixtureData.acronymErrorMsg);

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

  it('[Collection] check client search modal', () => {
    cy.get('.agency-information-section')
      .find('button.client-search-toggle-btn')
      .click();

    // Enter popup test
    cy.get('#client-search-dropdown')
      .find(`button.${prefix}--list-box__field`)
      .click();

    cy.get('#client-search-dropdown')
      .find('li')
      .contains('Acronym')
      .click();

    cy.get('#client-search-input')
      .clear()
      .type(testPopupAcronym)
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

    // Enter location code for linkage test
    cy.get('#collection-location-code')
      .clear()
      .type('02')
      .blur();
  });

  it('[Collection] check date inputs', () => {
    const fixtureData = regFormData.collector;
    cy.get('#collection-end-date')
      .clear()
      .type('2024-05-28')
      .blur();

    // Invalid start date
    cy.get('#collection-start-date')
      .clear()
      .type('2024-05-29')
      .blur();

    cy.get(`.${prefix}--date-picker`)
      .find(`.${prefix}--form-requirement`)
      .should('have.length', 2)
      .and('contain.text', fixtureData.invalidDateErrorMsg);

    // Valid start date
    cy.get('#collection-start-date')
      .clear()
      .type('2024-05-27')
      .blur();

    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Save changes')
      .click();
  });

  it('[Collection] check containers input', () => {
    const fixtureData = regFormData.collector;
    // Invalid collection test
    cy.get('#collection-num-of-container')
      .clear()
      .type('10001')
      .blur();

    cy.get('#collection-num-of-container-error-msg')
      .should('have.text', fixtureData.numOfContainerErrorMsg);

    cy.get('#collection-vol-per-container')
      .clear()
      .type('10001')
      .blur();

    cy.get('#collection-vol-per-container-error-msg')
      .should('have.text', fixtureData.numOfContainerErrorMsg);

    cy.get('#collection-vol-of-cones')
      .should('have.value', '100020001.000');

    cy.get('#collection-vol-of-cones')
      .clear()
      .type('10')
      .blur();

    cy.get('#collection-vol-of-cones-warn-msg')
      .should('have.text', fixtureData.volOfConesErrorMsg);

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
  });

  it('[Collection] check checkbox input', () => {
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
  it('[Interim storage] check title and subtitle are correct', () => {
    const fixtureData = regFormData.interimStorage;
    cy.get(`button.${prefix}--progress-step-button[title="Interim storage"]`)
      .click();

    cy.get('.interim-agency-storage-form')
      .find('h2')
      .should('have.text', fixtureData.title);

    cy.get('.interim-agency-storage-form')
      .find('.subtitle-section')
      .should('have.text', fixtureData.subtitle);
  });

  it('check Step 1 and Step 3 linkage', () => {
    cy.get(`button.${prefix}--progress-step-button[title="Interim storage"]`)
      .click();

    cy.get('#interim-agency')
      .should('have.value', testPopupAcronym);

    cy.get('#interim-location-code')
      .should('have.value', '02');

    cy.get('#interim-use-collection-agency')
      .should('be.checked');
  });

  it('[Interim storage] change interim agency details', () => {
    const fixtureData = regFormData.interimStorage;
    cy.get(`button.${prefix}--progress-step-button[title="Interim storage"]`)
      .click();

    cy.get('#interim-use-collection-agency')
      .uncheck({ force: true });

    // Enter invalid acronym
    cy.get('#interim-agency')
      .clear()
      .type('ggg')
      .blur();

    cy.get('#interim-agency-error-msg')
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

    cy.get(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');

    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Save changes')
      .click();
  });

  it('[Interim storage] check client search modal', () => {
    cy.get(`button.${prefix}--progress-step-button[title="Interim storage"]`)
      .click();

    cy.get('.agency-information-section')
      .find('button.client-search-toggle-btn')
      .click();

    // Enter popup test
    cy.get('#client-search-dropdown')
      .find(`button.${prefix}--list-box__field`)
      .click();

    cy.get('#client-search-dropdown')
      .find('li')
      .contains('Acronym')
      .click();

    cy.get('#client-search-input')
      .clear()
      .type(testPopupAcronym)
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
      .should('have.value', testPopupAcronym);
  });

  it('[Interim storage] check date input', () => {
    const fixtureData = regFormData.interimStorage;
    cy.get(`button.${prefix}--progress-step-button[title="Interim storage"]`)
      .click();

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
      .and('contain.text', fixtureData.invalidDateErrorMsg);

    // Enter valid dates
    cy.get('#start-date-input')
      .clear()
      .type('2024-05-25')
      .blur();

    cy.get('#end-date-input')
      .clear()
      .type('2024-05-26')
      .blur();

    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Save changes')
      .click();
  });

  it('[Interim storage] check radio button', () => {
    cy.get(`button.${prefix}--progress-step-button[title="Interim storage"]`)
      .click();

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
