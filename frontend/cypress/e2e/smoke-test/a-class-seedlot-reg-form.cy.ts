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
  let species: string;
  let seedlotData: SeedlotRegFixtureType;

  before(() => {
    // Login
    cy.login();
    // Go to my seedlot page
    cy.visit('/seedlots/my-seedlots');
    cy.url().should('contains', '/seedlots/my-seedlots');

    cy.fixture('aclass-reg-form').then((fData) => {
      regFormData = fData;
    });

    cy.get('.my-seedlot-data-table-row').children(`.${prefix}--search`).find('input')
      .type('PLI');

    cy.get('table.seedlot-data-table tbody tr')
      .eq(0)
      .find('td:nth-child(1)')
      .then(($seedlot) => {
        seedlotNum = $seedlot.text();
        cy.get(`#seedlot-table-cell-${seedlotNum}-seedlotSpecies`)
          .click();
        cy.url().should('contains', `/seedlots/details/${seedlotNum}`);
        cy.visit('/seedlots/my-seedlots');
        return cy.get(`#seedlot-table-cell-${seedlotNum}-seedlotSpecies`);
      })
      .then(($data) => {
        const seedlotSpecies = $data.text();
        species = (seedlotSpecies.substring(0, seedlotSpecies.indexOf('-') - 1)).toLowerCase();
      });

    cy.fixture('aclass-seedlot').then((fData) => {
      seedlotData = fData;
    });
  });

  beforeEach(() => {
    // Login
    cy.login();
    cy.visit(`/seedlots/a-class-registration/${seedlotNum}`);
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
      .should('have.value', seedlotData[species].agencyAcronym);

    cy.get('#collection-location-code')
      .should('have.value', seedlotData[species].agencyNumber);

    // Change inputs
    cy.get('#collection-step-default-checkbox')
      .uncheck({ force: true });

    cy.get('#collection-collector-agency')
      .type('ggg', { force: true });

    cy.get('#collection-collector-agency-helper-text')
      .click();

    cy.get('#collection-collector-agency-error-msg')
      .should('have.text', regData.acronymErrorMsg);

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
      .type(seedlotData.dr.agencyAcronym, { force: true })
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
      .type('02', { force: true });

    cy.get('#collection-collector-agency-helper-text')
      .click();
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
      .type('ggg', { force: true })
      .blur();

    cy.get('#interim-agency-error-msg')
      .should('have.text', regData.acronymErrorMsg);

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
      .type(seedlotData.cw.agencyAcronym, { force: true })
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
