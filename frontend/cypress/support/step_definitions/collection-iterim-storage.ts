import {
  Given,
  When,
  Then
} from '@badeball/cypress-cucumber-preprocessor';

import { HALF_SECOND, TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

type AClassRegFormFixtureType = {
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
  };
  interimStorage: {
    title: string;
    subtitle: string;
    acronymErrorMsg: string;
    locationErrorMsg: string;
    invalidDateErrorMsg: string;
  };
};

let seedlotFixtureData: SeedlotRegFixtureType = {};
let regFormFixtureData: AClassRegFormFixtureType;
let seedlotNum = '';
let testAcronym = '';
let testPopupAcronym = '';
let selectedClientLocationCode = '';

const speciesKey = 'pli';

const getPliSeedlotData = () => {
  const pliData = seedlotFixtureData[speciesKey];

  if (!pliData) {
    throw new Error(`Missing fixture data for species key: ${speciesKey}`);
  }

  return pliData;
};

const openInterimStorageStep = () => {
  cy.get(`button.${prefix}--progress-step-button[title="Interim storage"]`)
    .click();

  cy.get('.interim-title-row h2')
    .should('have.text', regFormFixtureData.interimStorage.title);
};

const openClientSearchModal = () => {
  cy.get('.agency-information-section')
    .find('button.client-search-toggle-btn')
    .click();
};

const searchClientByAcronym = () => {
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
};

const selectFirstClientSearchResult = () => {
  cy.get(`table.${prefix}--data-table tbody tr`)
    .eq(0)
    .find('td:nth-child(1)')
    .find(`input.${prefix}--radio-button`)
    .check({ force: true });

  cy.get(`table.${prefix}--data-table tbody tr`)
    .eq(0)
    .find('td[id*="locationCode"]')
    .invoke('text')
    .then((locationCode) => {
      selectedClientLocationCode = locationCode.trim();
    });
};

const applySelectedClient = () => {
  cy.get(`button.${prefix}--btn--primary`)
    .contains('Apply selected client')
    .click();
};

Given('I open the PLI A Class seedlot registration form', () => {
  cy.get('@aClassSeedlotData').then((data) => {
    seedlotFixtureData = data as SeedlotRegFixtureType;

    const pliData = getPliSeedlotData();

    testAcronym = seedlotFixtureData.dr.agencyAcronym;
    testPopupAcronym = seedlotFixtureData.cw.agencyAcronym;

    cy.fixture('aclass-reg-form').then((formData) => {
      regFormFixtureData = formData as AClassRegFormFixtureType;

      cy.task('getData', pliData.species).then((storedSeedlotNumber) => {
        seedlotNum = storedSeedlotNumber as string;

        if (!seedlotNum) {
          throw new Error(
            `No seedlot number was stored for species: ${pliData.species}. ` +
            'Run the Create PLI seedlot feature before this feature.'
          );
        }

        cy.visit(`/seedlots/a-class-registration/${seedlotNum}`);

        cy.get('.section-title')
          .eq(0)
          .find('h2')
          .should('have.text', regFormFixtureData.collector.agencyTitle);
      });
    });
  });
});

Then('the Collection registration page should be displayed', () => {
  cy.url()
    .should('contain', `/seedlots/a-class-registration/${seedlotNum}`);

  cy.get('.seedlot-registration-title')
    .find('h1')
    .should('have.text', `Registration for seedlot ${seedlotNum}`);
});

Then('the Collection agency title and subtitle should be displayed', () => {
  cy.get('.collection-step-row')
    .find('h2')
    .eq(0)
    .should('have.text', regFormFixtureData.collector.agencyTitle);

  cy.get('.collection-step-row')
    .find('.subtitle-section')
    .eq(0)
    .should('have.text', regFormFixtureData.collector.agencySubtitle);
});

Then('the Collection information title and subtitle should be displayed', () => {
  cy.get('.collection-step-row')
    .find('h2')
    .eq(1)
    .should('have.text', regFormFixtureData.collector.informationTitle);

  cy.get('.collection-step-row')
    .find('.subtitle-section')
    .eq(1)
    .should('have.text', regFormFixtureData.collector.informationSubtitle);
});

Then('the Collection agency default values should be displayed', () => {
  const pliData = getPliSeedlotData();

  cy.get('#collection-step-default-checkbox')
    .should('be.checked');

  cy.get('.agency-information-section')
    .find(`.${prefix}--checkbox-wrapper`)
    .should('have.text', regFormFixtureData.collector.checkboxText);

  cy.get('#collection-collector-agency')
    .should('have.value', pliData.agencyAcronym);

  cy.get('#collection-location-code')
    .should('have.value', pliData.agencyNumber);
});

When('I disable the default Collection agency checkbox', () => {
  cy.get('#collection-step-default-checkbox')
    .uncheck({ force: true });
});

When('I enter an invalid Collection agency acronym', () => {
  cy.get('#collection-collector-agency')
    .clear()
    .type('ggg')
    .blur();
});

Then('I should see the Collection agency acronym validation error', () => {
  cy.get('#collection-collector-agency-error-msg')
    .should('have.text', regFormFixtureData.collector.acronymErrorMsg);
});

When('I enter a valid Collection agency acronym', () => {
  cy.get('#collection-collector-agency')
    .clear()
    .type(testAcronym)
    .blur();
});

Then('I should see the Collection agency acronym validation success indicator', () => {
  cy.get('#collection-collector-agency-loading-status-tooltip')
    .find(`svg.${prefix}--inline-loading__checkmark-container`)
    .should('be.visible');
});

When('I enter an invalid Collection location code', () => {
  cy.get('#collection-location-code')
    .clear()
    .type('96', { delay: TYPE_DELAY })
    .blur();
});

Then('I should see the Collection location code validation error', () => {
  cy.get('#collection-location-code-error-msg')
    .should('have.text', regFormFixtureData.collector.locationErrorMsg);
});

When('I enter a valid Collection location code', () => {
  cy.get('#collection-location-code')
    .clear()
    .type('03')
    .blur();
});

When('I enter Collection location code {string}', (locationCode: string) => {
  cy.get('#collection-location-code')
    .clear()
    .type(locationCode)
    .blur();
});

When('I open the Collection client search modal', () => {
  openClientSearchModal();
});

When('I search for the Collection client by acronym', () => {
  searchClientByAcronym();
});

When('I select the first client search result', () => {
  selectFirstClientSearchResult();
});

When('I apply the selected Collection client', () => {
  applySelectedClient();
});

Then('the selected client should populate the Collection agency fields', () => {
  cy.get('#collection-collector-agency')
    .should('have.value', testPopupAcronym);

  cy.get('#collection-location-code')
    .should('have.value', selectedClientLocationCode);
});

When('I enter Collection end date {string}', (date: string) => {
  cy.get('#collection-end-date')
    .clear()
    .type(date)
    .blur();
});

When('I enter Collection start date {string}', (date: string) => {
  cy.get('#collection-start-date')
    .clear()
    .type(date)
    .blur();
});

Then('I should see Collection invalid date validation errors', () => {
  cy.get(`.${prefix}--date-picker`)
    .find(`.${prefix}--form-requirement`)
    .should('have.length', 2)
    .and('contain.text', regFormFixtureData.collector.invalidDateErrorMsg);
});

When('I enter Collection container values above the allowed limit', () => {
  cy.get('#collection-num-of-container')
    .clear()
    .type('10001')
    .blur();

  cy.get('#collection-vol-per-container')
    .clear()
    .type('10001')
    .blur();
});

Then('I should see Collection container validation errors', () => {
  cy.get('#collection-num-of-container-error-msg')
    .should('have.text', regFormFixtureData.collector.numOfContainerErrorMsg);

  cy.get('#collection-vol-per-container-error-msg')
    .should('have.text', regFormFixtureData.collector.numOfContainerErrorMsg);
});

Then(
  'the Collection calculated cone volume should be {string}',
  (volume: string) => {
    cy.get('#collection-vol-of-cones')
      .should('have.value', volume);
  }
);

When('I enter Collection cone volume {string}', (volume: string) => {
  cy.get('#collection-vol-of-cones')
    .clear()
    .type(volume)
    .blur();
});

Then('I should see the Collection cone volume warning', () => {
  cy.get('#collection-vol-of-cones-warn-msg')
    .should('have.text', regFormFixtureData.collector.volOfConesErrorMsg);
});

When(
  'I enter Collection container values with more than three decimal places',
  () => {
    cy.get('#collection-num-of-container')
      .clear()
      .type('2.9999')
      .blur();

    cy.get('#collection-vol-per-container')
      .clear()
      .type('2.9999')
      .blur();
  }
);

When('I enter negative Collection container values', () => {
  cy.get('#collection-num-of-container')
    .clear()
    .type('-1')
    .blur();

  cy.get('#collection-vol-per-container')
    .clear()
    .type('-1')
    .blur();
});

When('I enter valid Collection container values', () => {
  cy.get('#collection-num-of-container')
    .clear()
    .type('15')
    .blur();

  cy.get('#collection-vol-per-container')
    .clear()
    .type('2')
    .blur();
});

When('I complete the Collection checkbox and comments fields', () => {
  cy.get('#collection-step-default-checkbox')
    .focus()
    .check({ force: true })
    .blur();

  cy.get('#cone-collection-method-checkbox-1')
    .focus()
    .check({ force: true })
    .blur();

  cy.get('#collection-comments')
    .clear()
    .type('Test comment')
    .blur();
});

Then('the Collection progress step should be complete', () => {
  cy.wait(HALF_SECOND);

  cy.contains(`.${prefix}--progress-step-button`, 'Collection')
    .find(`.${prefix}--assistive-text`)
    .should('have.text', 'Complete');
});

When('I continue to the next registration step', () => {
  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .contains('Next')
    .click();
});

Then('the Collection progress step should remain complete', () => {
  cy.get(`.${prefix}--progress-step--complete`)
    .contains('Collection');
});

When('I open the Interim storage registration step', () => {
  openInterimStorageStep();
});

Then('the Interim storage title and subtitle should be displayed', () => {
  cy.get('.interim-title-row h2')
    .should('have.text', regFormFixtureData.interimStorage.title);

  cy.get('.interim-agency-storage-form')
    .find('.subtitle-section')
    .should('have.text', regFormFixtureData.interimStorage.subtitle);
});

Given('Collection agency details are saved for Interim storage linkage', () => {
  cy.get('#collection-step-default-checkbox')
    .uncheck({ force: true });

  cy.get('#collection-collector-agency')
    .clear()
    .type(testPopupAcronym)
    .blur();

  cy.get('#collection-location-code')
    .clear()
    .type('01')
    .blur();

  cy.saveSeedlotRegFormProgress();
});

Then(
  'the Interim storage agency details should match Collection agency details',
  () => {
    cy.get('#interim-agency')
      .should('have.value', testPopupAcronym);

    cy.get('#interim-location-code')
      .should('have.value', '01');

    cy.get('#interim-use-collection-agency')
      .should('be.checked');
  }
);

When('I disable the Collection agency checkbox for Interim storage', () => {
  cy.get('#interim-use-collection-agency')
    .uncheck({ force: true });
});

When('I enter an invalid Interim storage agency acronym', () => {
  cy.get('#interim-agency')
    .clear()
    .type('ggg')
    .blur();
});

Then('I should see the Interim storage agency acronym validation error', () => {
  cy.get('#interim-agency-error-msg')
    .should('have.text', regFormFixtureData.interimStorage.acronymErrorMsg);
});

When('I enter a valid Interim storage agency acronym', () => {
  cy.get('#interim-agency')
    .clear()
    .type(testAcronym)
    .blur();
});

When('I enter an invalid Interim storage location code', () => {
  cy.get('#interim-location-code')
    .clear()
    .type('96', { delay: TYPE_DELAY })
    .blur();
});

Then('I should see the Interim storage location code validation error', () => {
  cy.get('#interim-location-code-error-msg')
    .should('have.text', regFormFixtureData.interimStorage.locationErrorMsg);
});

When('I enter a valid Interim storage location code', () => {
  cy.get('#interim-location-code')
    .clear()
    .type('01')
    .blur();
});

Then(
  'I should see the Interim storage location code validation success indicator',
  () => {
    cy.get('#interim-location-code-loading-status-tooltip')
      .find(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');
  }
);

When('I open the Interim storage client search modal', () => {
  openClientSearchModal();
});

When('I search for the Interim storage client by acronym', () => {
  searchClientByAcronym();
});

When('I apply the selected Interim storage client', () => {
  applySelectedClient();
});

Then(
  'the selected client should populate the Interim storage agency fields',
  () => {
    cy.get('#interim-agency')
      .should('have.value', testPopupAcronym);

    cy.get('#interim-location-code')
      .should('have.value', selectedClientLocationCode);
  }
);

When('I enter Interim storage end date {string}', (date: string) => {
  cy.get('#end-date-input')
    .clear()
    .type(date)
    .blur();
});

When('I enter Interim storage start date {string}', (date: string) => {
  cy.get('#start-date-input')
    .clear()
    .type(date)
    .blur();
});

Then('I should see Interim storage invalid date validation errors', () => {
  cy.get(`.${prefix}--date-picker`)
    .find(`.${prefix}--form-requirement`)
    .should('have.length', 2)
    .and('contain.text', regFormFixtureData.interimStorage.invalidDateErrorMsg);
});

Then('the default Interim storage facility type should be selected', () => {
  cy.get('#facility-type-radio-btn-ocv')
    .should('be.checked');
});

When('I select the other Interim storage facility type', () => {
  cy.get('#facility-type-radio-btn-oth')
    .check({ force: true })
    .blur();
});

Then('the Interim storage other facility type input should be visible', () => {
  cy.get('#storage-other-type-input')
    .should('be.visible');
});

When(
  'I enter {string} as the Interim storage other facility type',
  (text: string) => {
    cy.get('#storage-other-type-input')
      .clear()
      .type(text)
      .blur();
  }
);

Then('the Interim storage progress step should be complete', () => {
  cy.wait(HALF_SECOND);

  cy.contains(`.${prefix}--progress-step-button`, 'Interim storage')
    .find(`.${prefix}--assistive-text`)
    .should('have.text', 'Complete');
});

Then('the Interim storage progress step should remain complete', () => {
  cy.get(`.${prefix}--progress-step--complete`)
    .contains('Interim storage');
});
