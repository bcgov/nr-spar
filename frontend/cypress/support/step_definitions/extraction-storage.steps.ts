import {
  Given,
  When,
  Then
} from '@badeball/cypress-cucumber-preprocessor';

import { TYPE_DELAY } from '../../constants';
import prefix from '../../../src/styles/classPrefix';
import {
  AClassRegFormFixtureType,
  SeedlotRegFixtureType
} from '../../definitions';
import {
  applySelectedClient,
  openClientSearchModal as openAgencyClientSearchModal,
  searchClientByAcronym,
  selectFirstClientSearchResult
} from '../helpers/client-search';

type AgencySection = 'extraction' | 'storage';

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

const getAgencySelectors = (section: AgencySection) => {
  if (section === 'extraction') {
    return {
      checkbox: '#ext-agency-tsc-checkbox',
      agency: '#ext-agency-number',
      agencyError: '#ext-agency-number-error-msg',
      agencySuccess: '#ext-agency-number-loading-status-tooltip',
      location: '#ext-location-code',
      locationError: '#ext-location-code-error-msg',
      locationSuccess: '#ext-location-code-loading-status-tooltip',
      clientSearchSection: '#ext-agency-number'
    };
  }

  return {
    checkbox: '#str-agency-tsc-checkbox',
    agency: '#str-agency-number',
    agencyError: '#str-agency-number-error-msg',
    agencySuccess: '#str-agency-number-loading-status-tooltip',
    location: '#str-location-code',
    locationError: '#str-location-code-error-msg',
    locationSuccess: '#str-location-code-loading-status-tooltip',
    clientSearchSection: '#str-agency-number'
  };
};

const openClientSearchModal = (section: AgencySection) => {
  const { clientSearchSection } = getAgencySelectors(section);
  openAgencyClientSearchModal(clientSearchSection);
};

const enterAgencyValue = (
  section: AgencySection,
  value: string,
  delay?: number
) => {
  const { agency } = getAgencySelectors(section);

  cy.get(agency)
    .clear()
    .type(value, delay ? { delay } : undefined)
    .blur();
};

const enterLocationCode = (
  section: AgencySection,
  value: string,
  delay?: number
) => {
  const { location } = getAgencySelectors(section);

  cy.get(location)
    .clear()
    .type(value, delay ? { delay } : undefined)
    .blur();
};

Given(
  'I open the PLI A Class seedlot Extraction and Storage registration form',
  () => {
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

          const extractionUrl =
            `/seedlots/a-class-registration/${seedlotNum}/?step=6`;

          cy.visit(extractionUrl);

          cy.url()
            .should('contain', extractionUrl);

          cy.get('.extraction-information-title')
            .contains(regFormFixtureData.extraction.extrationTitle);
        });
      });
    });
  }
);

Then('the Extraction and Storage registration page should be displayed', () => {
  cy.get('.seedlot-registration-title')
    .find('h1')
    .should('have.text', `Registration for seedlot ${seedlotNum}`);

  cy.get('.extraction-information-title')
    .should('contain.text', regFormFixtureData.extraction.extrationTitle);
});

Then('the Extraction subtitle should be displayed', () => {
  cy.get('.extraction-information-title')
    .find('.subtitle-section')
    .should('have.text', regFormFixtureData.extraction.extrationSubtitle);
});

Then('the Temporary seed storage title and subtitle should be displayed', () => {
  cy.get('.temporary-seed-storage-title')
    .find('h2')
    .should('have.text', regFormFixtureData.extraction.storageTitle);

  cy.get('.temporary-seed-storage-title')
    .find('.subtitle-section')
    .should('have.text', regFormFixtureData.extraction.storageSubtitle);
});

Then(
  'the Extraction agency Tree Seed Centre checkbox should be selected',
  () => {
    cy.get('#ext-agency-tsc-checkbox')
      .should('be.checked');
  }
);

Then('the Extraction agency checkbox text should be displayed', () => {
  cy.get('.agency-information-row')
    .eq(0)
    .find(`.${prefix}--checkbox-wrapper`)
    .should(
      'have.text',
      regFormFixtureData.extraction.extractionCheckboxText
    );
});

Then(
  'the Storage agency Tree Seed Centre checkbox should be selected',
  () => {
    cy.get('#str-agency-tsc-checkbox')
      .should('be.checked');
  }
);

Then('the Storage agency checkbox text should be displayed', () => {
  cy.get('.agency-information-row')
    .eq(2)
    .find(`.${prefix}--checkbox-wrapper`)
    .should(
      'have.text',
      regFormFixtureData.extraction.storageCheckboxText
    );
});

When(
  'I disable the Extraction agency Tree Seed Centre checkbox',
  () => {
    cy.get('#ext-agency-tsc-checkbox')
      .uncheck({ force: true });
  }
);

When(
  'I select the Extraction agency Tree Seed Centre checkbox',
  () => {
    cy.get('#ext-agency-tsc-checkbox')
      .check({ force: true });
  }
);

When('I enter an invalid Extraction agency acronym', () => {
  enterAgencyValue('extraction', 'ggg');
});

Then('I should see the Extraction agency acronym error', () => {
  cy.get('#ext-agency-number-error-msg')
    .should('have.text', regFormFixtureData.extraction.agencyErrorMsg);
});

When('I enter an invalid Extraction agency validation value', () => {
  enterAgencyValue('extraction', '-1');
});

Then('I should see the Extraction agency validation error', () => {
  cy.get('#ext-agency-number-error-msg')
    .should('have.text', regFormFixtureData.extraction.agencyValidationMsg);
});

Then('the Extraction agency error notification should be visible', () => {
  cy.get('.applicant-error-notification')
    .should('be.visible');
});

When('I close the Extraction agency error notification', () => {
  cy.get('.applicant-error-notification')
    .find('button[title="close notification"]')
    .click();
});

When('I enter a valid Extraction agency acronym', () => {
  enterAgencyValue('extraction', testAcronym);
});

Then(
  'I should see the Extraction agency validation success indicator',
  () => {
    cy.get('#ext-agency-number-loading-status-tooltip')
      .find(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');
  }
);

Then(
  'the Extraction agency error notification should not be displayed',
  () => {
    cy.get('.applicant-error-notification')
      .should('not.exist');
  }
);

When('I enter an invalid Extraction location code', () => {
  enterLocationCode('extraction', '96', TYPE_DELAY);
});

Then('I should see the Extraction location code error', () => {
  cy.get('#ext-location-code-error-msg')
    .should('have.text', regFormFixtureData.extraction.locationErrorMsg);
});

When('I enter a valid Extraction location code', () => {
  enterLocationCode('extraction', '00');
});

Then(
  'I should see the Extraction location code validation success indicator',
  () => {
    cy.get('#ext-location-code-loading-status-tooltip')
      .find(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');
  }
);

When('I open the Extraction client search modal', () => {
  openClientSearchModal('extraction');
});

When('I search for the Extraction client by acronym', () => {
  searchClientByAcronym(testPopupAcronym);
});

Then('Extraction client search results should be displayed', () => {
  cy.get(`.${prefix}--table-header-label`)
    .contains('Acronym');
});

When('I select the first Extraction client search result', () => {
  selectFirstClientSearchResult().then((locationCode) => {
    selectedClientLocationCode = locationCode;
  });
});

When('I apply the selected Extraction client', () => {
  applySelectedClient(true);
});

Then(
  'the selected client should populate the Extraction agency fields',
  () => {
    cy.get('#ext-agency-number')
      .should('have.value', testPopupAcronym);

    cy.get('#ext-location-code')
      .should('have.value', selectedClientLocationCode);
  }
);

When('I enter Extraction end date {string}', (date: string) => {
  cy.get('#ext-end-date')
    .clear()
    .type(date)
    .blur();
});

When('I enter Extraction start date {string}', (date: string) => {
  cy.get('#ext-start-date')
    .clear()
    .type(date)
    .blur();
});

Then('I should see Extraction invalid date validation errors', () => {
  cy.get(`.${prefix}--date-picker`)
    .find(`.${prefix}--form-requirement`)
    .should('have.length', 2)
    .and(
      'contain.text',
      regFormFixtureData.extraction.invalidDateErrorMsg
    );
});

When(
  'I disable the Storage agency Tree Seed Centre checkbox',
  () => {
    cy.get('#str-agency-tsc-checkbox')
      .uncheck({ force: true });
  }
);

When('I enter an invalid Storage agency acronym', () => {
  enterAgencyValue('storage', 'ggg');
});

Then('I should see the Storage agency acronym error', () => {
  cy.get('#str-agency-number-error-msg')
    .should('have.text', regFormFixtureData.extraction.agencyErrorMsg);
});

When('I enter an invalid Storage agency validation value', () => {
  enterAgencyValue('storage', '-1');
});

Then('I should see the Storage agency validation error', () => {
  cy.get('#str-agency-number-error-msg')
    .should('have.text', regFormFixtureData.extraction.agencyValidationMsg);
});

Then('the Storage agency error notification should be visible', () => {
  cy.get('.applicant-error-notification')
    .should('be.visible');
});

When('I close the Storage agency error notification', () => {
  cy.get('.applicant-error-notification')
    .find('button[title="close notification"]')
    .click();
});

When('I enter a valid Storage agency acronym', () => {
  enterAgencyValue('storage', testAcronym);
});

Then(
  'I should see the Storage agency validation success indicator',
  () => {
    cy.get('#str-agency-number-loading-status-tooltip')
      .find(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');
  }
);

Then(
  'the Storage agency error notification should not be displayed',
  () => {
    cy.get('.applicant-error-notification')
      .should('not.exist');
  }
);

When('I enter an invalid Storage location code', () => {
  enterLocationCode('storage', '96', TYPE_DELAY);
});

Then('I should see the Storage location code error', () => {
  cy.get('#str-location-code-error-msg')
    .should('have.text', regFormFixtureData.extraction.locationErrorMsg);
});

When('I enter a valid Storage location code', () => {
  enterLocationCode('storage', '00');
});

Then(
  'I should see the Storage location code validation success indicator',
  () => {
    cy.get('#str-location-code-loading-status-tooltip')
      .find(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');
  }
);

When('I open the Storage client search modal', () => {
  openClientSearchModal('storage');
});

When('I search for the Storage client by acronym', () => {
  searchClientByAcronym(testPopupAcronym);
});

Then('Storage client search results should be displayed', () => {
  cy.get(`.${prefix}--table-header-label`)
    .contains('Acronym');
});

When('I select the first Storage client search result', () => {
  selectFirstClientSearchResult().then((locationCode) => {
    selectedClientLocationCode = locationCode;
  });
});

When('I apply the selected Storage client', () => {
  applySelectedClient();
});

Then(
  'the selected client should populate the Storage agency fields',
  () => {
    cy.get('#str-agency-number')
      .should('have.value', testPopupAcronym);

    cy.get('#str-location-code')
      .should('have.value', selectedClientLocationCode);
  }
);

When('I enter Storage end date {string}', (date: string) => {
  cy.get('#str-end-date')
    .clear()
    .type(date)
    .blur();
});

When('I enter Storage start date {string}', (date: string) => {
  cy.get('#str-start-date')
    .clear()
    .type(date)
    .blur();
});

Then('I should see Storage invalid date validation errors', () => {
  cy.get(`.${prefix}--date-picker`)
    .find(`.${prefix}--form-requirement`)
    .should('have.length', 2)
    .and(
      'contain.text',
      regFormFixtureData.extraction.invalidDateErrorMsg
    );
});
