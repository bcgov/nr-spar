import {
  Given,
  When,
  Then
} from '@badeball/cypress-cucumber-preprocessor';

import { SeedlotRegFixtureType } from '../../definitions';
import prefix from '../../../src/styles/classPrefix';
import {
  HALF_SECOND,
  TYPE_DELAY,
  THIRTY_SECONDS
} from '../../constants';

type AClassRegFormFixtureType = {
  ownership: {
    title: string;
    subtitle: string;
    accordionTitle: string;
    accordionSubtitle: string;
    ownerAgencyError: string;
    ownerAgencyValidationError: string;
    locationCodeError: string;
    ownerPortionSumError: string;
    ownerPortionAboveLimitError: string;
    ownerPortionBelowLimitError: string;
    ownerPortionDecimalError: string;
    reservedAboveLimitError: string;
    reservedBelowLimitError: string;
    reservedDecimalError: string;
  };
};

let seedlotFixtureData: SeedlotRegFixtureType = {};
let regFormFixtureData: AClassRegFormFixtureType;
let seedlotNum = '';
let testAcronym = '';
let testPopupAcronym = '';
let initialAccordionTitle = '';
let selectedClientLocationCode = '';

const speciesKey = 'pli';

const fundingSource = 'FTM - Forests for Tomorrow MOF Admin';
const initialMethodOfPayment = 'ITC - Invoice to Client Address';
const cashSaleMethodOfPayment = 'CSH - Cash Sale';

const getPliSeedlotData = () => {
  const pliData = seedlotFixtureData[speciesKey];

  if (!pliData) {
    throw new Error(`Missing fixture data for species key: ${speciesKey}`);
  }

  return pliData;
};

const getOwnershipAccordionItems = () => cy.get(`ul.${prefix}--accordion`)
    .find(`li.${prefix}--accordion__item`);

const selectComboboxOption = (option: string) => {
  cy.get(`.${prefix}--list-box__menu-item__option`)
    .contains(option)
    .scrollIntoView()
    .click();
};

Given('I open the PLI A Class seedlot Ownership registration form', () => {
  cy.get('@aClassSeedlotData').then((data) => {
    seedlotFixtureData = data as SeedlotRegFixtureType;

    const pliData = getPliSeedlotData();

    testAcronym = seedlotFixtureData.dr.agencyAcronym;
    testPopupAcronym = seedlotFixtureData.cw.agencyAcronym;

    [, initialAccordionTitle] = pliData.agencyName.split(' - ');

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

        const ownershipUrl = `/seedlots/a-class-registration/${seedlotNum}/?step=2`;

        cy.visit(ownershipUrl);

        cy.url()
          .should('contain', ownershipUrl);

        cy.get('.ownership-header')
          .contains(regFormFixtureData.ownership.title);
      });
    });
  });
});

Then('the Ownership registration page should be displayed', () => {
  cy.get('.seedlot-registration-title')
    .find('h1')
    .should('have.text', `Registration for seedlot ${seedlotNum}`);

  cy.get('.ownership-header')
    .find('h3')
    .should('have.text', regFormFixtureData.ownership.title);
});

Then('the Ownership title and subtitle should be displayed', () => {
  cy.get('.ownership-header')
    .find('h3')
    .should('have.text', regFormFixtureData.ownership.title);

  cy.get('.ownership-header')
    .find('p')
    .should('have.text', regFormFixtureData.ownership.subtitle);
});

When('I select the default owner checkbox', () => {
  cy.get('#default-owner-checkbox')
    .check({ force: true })
    .should('be.checked');
});

Then('the default Ownership accordion title and subtitle should be displayed', () => {
  cy.get(`.${prefix}--accordion__title`)
    .find('.item-title-section')
    .should('have.text', initialAccordionTitle);

  cy.get(`.${prefix}--accordion__title`)
    .find('.item-description-section')
    .should('have.text', regFormFixtureData.ownership.accordionSubtitle);
});

When('I collapse the Ownership accordion', () => {
  cy.get('.ownership-form-container')
    .find(`button.${prefix}--accordion__heading`)
    .click();
});

Then('the Ownership details section should not be visible', () => {
  cy.get('.single-owner-info-container')
    .should('not.be.visible');
});

When('I expand the Ownership accordion', () => {
  cy.get('.ownership-form-container')
    .find(`button.${prefix}--accordion__heading`)
    .click();
});

Then('the Ownership details section should be visible', () => {
  cy.get('.single-owner-info-container')
    .should('be.visible');
});

Then('the default owner checkbox should be selected', () => {
  cy.get('#default-owner-checkbox')
    .should('be.checked');
});

Then('the default Ownership agency and location values should be displayed', () => {
  const pliData = getPliSeedlotData();

  cy.get('#ownership-agency-0')
    .should('have.value', pliData.agencyAcronym);

  cy.get('#ownership-location-code-0')
    .should('have.value', pliData.agencyNumber);
});

When('I disable the default owner checkbox', () => {
  cy.get('#default-owner-checkbox')
    .uncheck({ force: true });
});

When('I enter an invalid Ownership agency acronym', () => {
  cy.get('#ownership-agency-0')
    .clear()
    .type('ggg', { delay: TYPE_DELAY })
    .blur();
});

Then('I should see the Ownership agency acronym error', () => {
  cy.get('#ownership-agency-0-error-msg')
    .should('have.text', regFormFixtureData.ownership.ownerAgencyError);
});

When('I enter an invalid Ownership agency validation value', () => {
  cy.get('#ownership-agency-0')
    .clear()
    .type('-1', { delay: TYPE_DELAY })
    .blur();
});

Then('I should see the Ownership agency validation error', () => {
  cy.get('#ownership-agency-0-error-msg')
    .should(
      'have.text',
      regFormFixtureData.ownership.ownerAgencyValidationError
    );
});

Then('the Ownership error notification should be visible', () => {
  cy.get('.applicant-error-notification')
    .should('exist');
});

When('I close the Ownership error notification', () => {
  cy.get('.applicant-error-notification')
    .find('button[title="close notification"]')
    .click();
});

When('I enter a valid Ownership agency acronym', () => {
  cy.get('#ownership-agency-0')
    .clear()
    .type(testAcronym, { delay: TYPE_DELAY })
    .blur();
});

Then('I should see the Ownership agency validation success indicator', () => {
  cy.get('#ownership-agency-0-loading-status-tooltip')
    .find(`svg.${prefix}--inline-loading__checkmark-container`)
    .should('be.visible');
});

When('I enter an invalid Ownership location code', () => {
  cy.get('#ownership-location-code-0')
    .clear()
    .type('99', { delay: TYPE_DELAY })
    .blur();
});

Then('I should see the Ownership location code error', () => {
  cy.get('#ownership-location-code-0-error-msg')
    .should('have.text', regFormFixtureData.ownership.locationCodeError);
});

When('I enter a valid Ownership location code', () => {
  cy.get('#ownership-location-code-0')
    .clear()
    .type('02', { delay: TYPE_DELAY })
    .blur();
});

Then(
  'I should see the Ownership location code validation success indicator',
  () => {
    cy.get('#ownership-location-code-0-loading-status-tooltip')
      .find(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');
  }
);

When('I open the Ownership client search modal', () => {
  cy.get('.agency-information-section')
    .find('button.client-search-toggle-btn')
    .click();
});

When('I search for the Ownership client by acronym', () => {
  cy.get('#client-search-dropdown')
    .find(`button.${prefix}--list-box__field`)
    .click();

  cy.get('#client-search-dropdown')
    .find('li')
    .contains('Acronym')
    .click();

  cy.get('#client-search-input')
    .clear()
    .type(testPopupAcronym, { delay: TYPE_DELAY })
    .blur();

  cy.get('button.client-search-button')
    .contains('Search')
    .click();
});

Then('Ownership client search results should be displayed', () => {
  cy.contains(`[class=${prefix}--table-header-label]`, 'Acronym');
});

When('I select the first Ownership client search result', () => {
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
});

When('I apply the selected Ownership client', () => {
  cy.get(`button.${prefix}--btn--primary`)
    .contains('Apply selected client')
    .click();
});

Then('the selected client should populate the Ownership agency fields', () => {
  cy.get('#ownership-agency-0')
    .should('have.value', testPopupAcronym);

  cy.get('#ownership-location-code-0')
    .should('have.value', selectedClientLocationCode);
});

Then('the default Ownership portion values should be displayed', () => {
  cy.get('#ownership-portion-0')
    .should('have.value', '100');

  cy.get('#ownership-reserved-0')
    .should('have.value', '100');

  cy.get('#ownership-surplus-0')
    .should('have.value', '0');
});

When('I set Ownership reserved portion to {string}', (portion: string) => {
  cy.get('#ownership-reserved-0')
    .clear()
    .type(portion, { delay: TYPE_DELAY })
    .blur();
});

Then('the Ownership surplus portion should be {string}', (portion: string) => {
  cy.get('#ownership-surplus-0')
    .should('have.value', portion);
});

When('I set Ownership surplus portion to {string}', (portion: string) => {
  cy.get('#ownership-surplus-0')
    .clear()
    .type(portion, { delay: TYPE_DELAY })
    .blur();
});

Then('the Ownership reserved portion should be {string}', (portion: string) => {
  cy.get('#ownership-reserved-0')
    .should('have.value', portion);
});

When('I set Ownership owner portion to {string}', (portion: string) => {
  cy.get('#ownership-portion-0')
    .clear()
    .type(portion, { delay: TYPE_DELAY })
    .blur();
});

Then('the Ownership accordion subtitle should be {string}', (subtitle: string) => {
  cy.get(`.${prefix}--accordion__title`)
    .find('.item-description-section')
    .should('have.text', subtitle);
});

Then('I should see the Ownership owner portion below-limit error', () => {
  cy.get('#ownership-portion-0-error-msg')
    .should(
      'have.text',
      regFormFixtureData.ownership.ownerPortionBelowLimitError
    );
});

Then('I should see the Ownership owner portion decimal error', () => {
  cy.get('#ownership-portion-0-error-msg')
    .should(
      'have.text',
      regFormFixtureData.ownership.ownerPortionDecimalError
    );
});

Then('I should see the Ownership owner portion above-limit error', () => {
  cy.get('#ownership-portion-0-error-msg')
    .should(
      'have.text',
      regFormFixtureData.ownership.ownerPortionAboveLimitError
    );
});

Then('the Ownership funding source and payment method should be blank', () => {
  cy.get('#ownership-funding-source-0')
    .should('have.value', '');

  cy.get('#ownership-method-payment-0')
    .should('have.value', '');
});

When('I select the Ownership funding source', () => {
  cy.get('#ownership-funding-source-0')
    .click();

  selectComboboxOption(fundingSource);
});

Then('the selected Ownership funding source should be displayed', () => {
  cy.get('#ownership-funding-source-0')
    .should('have.value', fundingSource);
});

When('I clear the Ownership funding source', () => {
  cy.get('.single-owner-combobox')
    .eq(0)
    .find('[aria-label="Clear selected item"]')
    .click();
});

Then('the Ownership funding source should be blank', () => {
  cy.get('#ownership-funding-source-0')
    .should('have.value', '');
});

When('I select the initial Ownership method of payment', () => {
  cy.get('#ownership-method-payment-0')
    .click();

  selectComboboxOption(initialMethodOfPayment);
});

Then('the selected Ownership method of payment should be displayed', () => {
  cy.get('#ownership-method-payment-0')
    .should('have.value', initialMethodOfPayment);
});

When('I clear the Ownership method of payment', () => {
  cy.get('.single-owner-combobox')
    .eq(1)
    .find('[aria-label="Clear selected item"]')
    .click();
});

Then('the Ownership method of payment should be blank', () => {
  cy.get('#ownership-method-payment-0')
    .should('have.value', '');
});

When('I select the cash sale Ownership method of payment', () => {
  cy.get('#ownership-method-payment-0')
    .click();

  selectComboboxOption(cashSaleMethodOfPayment);
});

Then('the cash sale Ownership method of payment should be displayed', () => {
  cy.get('#ownership-method-payment-0')
    .should('have.value', cashSaleMethodOfPayment);
});

When('I add an Ownership owner section', () => {
  cy.get('button.owner-add-btn')
    .click();
});

Then('{int} Ownership owner section should be displayed', (count: number) => {
  getOwnershipAccordionItems()
    .should('have.length', count);
});

Then('the Ownership delete owner button should be displayed', () => {
  cy.get('.single-owner-info-container')
    .find('button.owner-mod-btn')
    .contains('Delete owner')
    .should('exist');
});

When('I delete the added Ownership owner section', () => {
  cy.get('.single-owner-info-container')
    .last()
    .find('button.owner-mod-btn')
    .contains('Delete owner')
    .click();
});

Then('the additional Ownership owner default title and subtitle should be displayed', () => {
  cy.get(`.${prefix}--accordion__title`)
    .eq(1)
    .find('.item-title-section')
    .should('have.text', regFormFixtureData.ownership.accordionTitle);

  cy.get(`.${prefix}--accordion__title`)
    .eq(1)
    .find('.item-description-section')
    .should('have.text', regFormFixtureData.ownership.accordionSubtitle);
});

When('I validate Ownership portions without updating all owners', () => {
  cy.get('#ownership-portion-0')
    .click()
    .blur();
});

Then(
  'all Ownership owner sections should show the owner portion sum error',
  () => {
    cy.get(`div.${prefix}--form-requirement`)
      .should('have.length', 3)
      .and('contain.text', regFormFixtureData.ownership.ownerPortionSumError);
  }
);

When(
  'I set the three Ownership owner portions to {string}, {string}, and {string}',
  (first: string, second: string, third: string) => {
    cy.get('#ownership-portion-0')
      .clear()
      .type(first, { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-portion-1')
      .clear()
      .type(second, { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-portion-2')
      .clear()
      .type(third, { delay: TYPE_DELAY })
      .blur();
  }
);

Then('no Ownership owner portion sum errors should be displayed', () => {
  cy.get(`div.${prefix}--form-requirement`)
    .should('not.exist');
});

When('I delete the third Ownership owner section', () => {
  cy.get('.single-owner-info-container')
    .eq(2)
    .find('button.owner-mod-btn')
    .contains('Delete owner')
    .click();
});

When('I delete the second Ownership owner section', () => {
  cy.get('.single-owner-info-container')
    .eq(1)
    .find('button.owner-mod-btn')
    .contains('Delete owner')
    .click();
});

Then('the Ownership progress step should be complete', () => {
  cy.wait(HALF_SECOND);

  cy.contains(`.${prefix}--progress-step-button`, 'Ownership')
    .find(`.${prefix}--assistive-text`)
    .should('have.text', 'Complete');
});

Then('the Ownership progress step should remain complete', () => {
  cy.get(`.${prefix}--progress-step--complete`, {
    timeout: 3 * THIRTY_SECONDS
  })
    .contains('Ownership');
});
