import { SeedlotRegFixtureType } from '../../definitions';
import prefix from '../../../src/styles/classPrefix';
import { TYPE_DELAY } from '../../constants';

describe('A Class Seedlot Registration form, Ownership', () => {
  let regFormData: {
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
    }
  };

  let seedlotNum: string;
  const speciesKey = 'pli';
  let seedlotData: SeedlotRegFixtureType;
  let testAcronym: string;
  let testPopupAcronym: string;
  let initialAccordionTitle: string;

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
        const url = `/seedlots/a-class-registration/${seedlotNum}/?step=2`;
        cy.visit(url);
        cy.url().should('contains', url);
        cy.get('.ownership-header').contains('Ownership');
      });
      testAcronym = seedlotData.dr.agencyAcronym;
      testPopupAcronym = seedlotData.cw.agencyAcronym;
      // Get title from agencyName like 'WESTERN FOREST PRODUCTS INC.'
      // eslint-disable-next-line prefer-destructuring
      initialAccordionTitle = seedlotData[speciesKey].agencyName.split(' - ')[1];
    });
  });

  it('Page title and accordion title', () => {
    cy.get('.seedlot-registration-title')
      .find('h1')
      .should('have.text', 'Seedlot Registration');

    cy.get('.seedlot-registration-title')
      .find('.seedlot-form-subtitle')
      .should('contain.text', `Seedlot ${seedlotNum}`);

    cy.get('.ownership-header')
      .find('h3')
      .should('have.text', regFormData.ownership.title);

    cy.get('.ownership-header')
      .find('p')
      .should('have.text', regFormData.ownership.subtitle);

    cy.get(`.${prefix}--accordion__title`)
      .find('.item-title-section')
      .should('have.text', initialAccordionTitle);

    cy.get(`.${prefix}--accordion__title`)
      .find('.item-description-section')
      .should('have.text', regFormData.ownership.accordionSubtitle);
  });

  it('Collapse and Expand accordion', () => {
    cy.get('.ownership-form-container')
      .find(`button.${prefix}--accordion__heading`)
      .click();

    cy.get('.single-owner-info-container')
      .should('not.be.visible');

    cy.get('.ownership-form-container')
      .find(`button.${prefix}--accordion__heading`)
      .click();

    cy.get('.single-owner-info-container')
      .should('be.visible');
  });

  it('Owner agency and owner location code display default values', () => {
    cy.get('#default-owner-checkbox')
      .should('be.checked');

    cy.get('#ownership-agency-0')
      .should('have.value', seedlotData[speciesKey].agencyAcronym);

    cy.get('#ownership-location-code-0')
      .should('have.value', seedlotData[speciesKey].agencyNumber);
  });

  it('Edit owner agency and owner location code', () => {
    // Change inputs
    cy.get('#default-owner-checkbox')
      .uncheck({ force: true });

    // Enter invalid acronym
    cy.get('#ownership-agency-0')
      .type('ggg', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-agency-0-error-msg')
      .should('have.text', regFormData.ownership.ownerAgencyError);

    cy.get('#ownership-agency-0')
      .clear()
      .type('-1', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-agency-0-error-msg')
      .should('have.text', regFormData.ownership.ownerAgencyValidationError);

    // Check error msg block is visible
    cy.get('.applicant-error-notification')
      .should('exist');

    // Enter valid acronym
    cy.get('#ownership-agency-0')
      .clear()
      .type(testAcronym, { delay: TYPE_DELAY })
      .blur();

    cy.get(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');

    // Enter invalid location code
    cy.get('#ownership-location-code-0')
      .clear()
      .type('99', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-location-code-0-error-msg')
      .should('have.text', regFormData.ownership.locationCodeError);

    // Enter valid location code
    cy.get('#ownership-location-code-0')
      .clear()
      .type('02', { delay: TYPE_DELAY })
      .blur();

    cy.get(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Client search modal', () => {
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
      .type(testPopupAcronym, { delay: TYPE_DELAY })
      .blur();

    cy.get('button.client-search-button')
      .contains('Search')
      .click();

    // Wait for data is fetched and table is filled
    cy.contains(`[class=${prefix}--table-header-label]`, 'Acronym');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(0)
      .find('td:nth-child(1)')
      .find(`input.${prefix}--radio-button`)
      .check({ force: true });

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(0)
      .find('td[id*="locationCode"]')
      .invoke('text')
      .then((text) => {
        const locationCode = text;
        cy.get(`button.${prefix}--btn--primary`)
          .contains('Apply selected client')
          .click();

        cy.get('#ownership-agency-0')
          .should('have.value', testPopupAcronym);

        cy.get('#ownership-location-code-0')
          .should('have.value', locationCode);
      });

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Owner portion %, reserved % and surplus % display default values', () => {
    cy.get('#ownership-portion-0')
      .should('have.value', '100');

    cy.get('#ownership-reserved-0')
      .should('have.value', '100');

    cy.get('#ownership-surplus-0')
      .should('have.value', '0');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Edit owner portion %, reserved % and surplus % values', () => {
    cy.get('#ownership-reserved-0')
      .clear()
      .type('02', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-surplus-0')
      .should('have.value', '98');

    cy.get('#ownership-surplus-0')
      .clear()
      .type('52', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-reserved-0')
      .should('have.value', '48');

    // Check accordian subtitle reflects change in ownership portion
    cy.get('#ownership-portion-0')
      .clear()
      .type('80', { delay: TYPE_DELAY })
      .blur();

    cy.get(`.${prefix}--accordion__title`)
      .find('.item-description-section')
      .should('have.text', '80% owner portion');

    // Invalid owner portion % error msg test
    cy.get('#ownership-portion-0')
      .clear()
      .type('-1', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-portion-0-error-msg')
      .should('have.text', regFormData.ownership.ownerPortionBelowLimitError);

    cy.get('#ownership-portion-0')
      .clear()
      .type('0.0439', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-portion-0-error-msg')
      .should('have.text', regFormData.ownership.ownerPortionDecimalError);

    cy.get('#ownership-portion-0')
      .clear()
      .type('102', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-portion-0-error-msg')
      .should('have.text', regFormData.ownership.ownerPortionAboveLimitError);

    // Enter valid owner portion %
    cy.get('#ownership-portion-0')
      .clear()
      .type('100', { delay: TYPE_DELAY })
      .blur();

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Funding source and method of payment default values and change the values', () => {
    // Expand the funding source combo box
    cy.get('#ownership-funding-source-0')
      .should('have.value', '')
      .click();

    const fundingSource = 'FTM - Forests for Tomorrow MOF Admin';

    cy.get(`.${prefix}--list-box__menu-item__option`)
      .contains(fundingSource)
      .scrollIntoView()
      .click();

    cy.get('#ownership-funding-source-0')
      .should('have.value', fundingSource);

    // Method of Payment
    cy.get('#ownership-method-payment-0')
      .should('have.value', '')
      .click();

    const methodOfPayment = 'CSH - Cash Sale';

    cy.get(`.${prefix}--list-box__menu-item__option`)
      .contains(methodOfPayment)
      .scrollIntoView()
      .click();

    cy.get('#ownership-method-payment-0')
      .should('have.value', methodOfPayment);

    // Check 'x' button
    cy.get('.single-owner-combobox')
      .eq(0)
      .find('[aria-label="Clear selected item"]')
      .click();

    cy.get('.single-owner-combobox')
      .eq(1)
      .find('[aria-label="Clear selected item"]')
      .click();

    // Enter funding source and method payment values again
    cy.get('#ownership-funding-source-0')
      .should('have.value', '')
      .click();

    cy.get(`.${prefix}--list-box__menu-item__option`)
      .contains(fundingSource)
      .scrollIntoView()
      .click();

    cy.get('#ownership-funding-source-0')
      .should('have.value', fundingSource);

    cy.get('#ownership-method-payment-0')
      .should('have.value', '')
      .click();

    cy.get(`.${prefix}--list-box__menu-item__option`)
      .contains(methodOfPayment)
      .scrollIntoView()
      .click();

    cy.get('#ownership-method-payment-0')
      .should('have.value', methodOfPayment);

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Create and delete new owner agency section', () => {
    cy.get('button.owner-add-btn')
      .click();

    cy.get(`ul.${prefix}--accordion`)
      .find(`li.${prefix}--accordion__item`)
      .as('ownerAgencySection')
      .should('have.length', 2);

    cy.get('.single-owner-info-container')
      .find('button.owner-mod-btn')
      .contains('Delete owner')
      .as('deleteButton')
      .should('exist');

    cy.get('@deleteButton')
      .click();

    cy.get('@ownerAgencySection')
      .should('have.length', 1);
  });

  it('Owner portion % for 3 owner agencies', () => {
    cy.get('button.owner-add-btn')
      .click();

    cy.get('button.owner-add-btn')
      .click();

    // Check 3 sections created
    cy.get(`ul.${prefix}--accordion`)
      .find(`li.${prefix}--accordion__item`)
      .should('have.length', 3);

    // Check default title and subtitle created
    cy.get(`.${prefix}--accordion__title`)
      .eq(1)
      .find('.item-title-section')
      .should('have.text', regFormData.ownership.accordionTitle);

    cy.get(`.${prefix}--accordion__title`)
      .eq(1)
      .find('.item-description-section')
      .should('have.text', regFormData.ownership.accordionSubtitle);

    cy.get('#ownership-portion-0')
      .click()
      .blur();

    // Check error message on all 3 sections
    cy.get(`div.${prefix}--form-requirement`)
      .should('have.length', 3)
      .and('contain.text', regFormData.ownership.ownerPortionSumError);

    cy.get('#ownership-portion-0')
      .clear()
      .type('90', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-portion-1')
      .clear()
      .type('5', { delay: TYPE_DELAY })
      .blur();

    cy.get('#ownership-portion-2')
      .clear()
      .type('5', { delay: TYPE_DELAY })
      .blur();

    // Check no error message on any 3 sections
    cy.get(`div.${prefix}--form-requirement`)
      .should('not.exist');

    // Delete 2 owner agencies
    cy.get('.single-owner-info-container')
      .eq(2)
      .find('button.owner-mod-btn')
      .contains('Delete owner')
      .click();

    cy.get('.single-owner-info-container')
      .eq(1)
      .find('button.owner-mod-btn')
      .contains('Delete owner')
      .click();

    // Enter correct owner portion % to remove error
    cy.get('#ownership-portion-0')
      .clear()
      .type('100', { delay: TYPE_DELAY })
      .blur();

    // Save changes
    cy.saveSeedlotRegFormProgress();

    // Press next button
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Next')
      .click();
  
    // Check svg with complete checkmark on Step 3
    // FLAKY, needs investigation
    cy.get('ul.spar-seedlot-reg-progress-bar li')
      .eq(1)
      .should('have.class', `${prefix}--progress-step--complete`);
  });
});
