import { SeedlotRegFixtureType } from '../../definitions';
import prefix from '../../../src/styles/classPrefix';
import { TYPE_DELAY } from '../../constants';

describe('A Class Seedlot Registration form, Ownership', () => {
  let regFormData: {
    title: string;
    subtitle: string;
    agencyTitle: string;
    agencySubtitle: string;
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

  let seedlotNum: string;
  const speciesKey = 'pli';
  let seedlotData: SeedlotRegFixtureType;
  let testAcronym: string;
  let testPopupAcronym: string;

  beforeEach(() => {
    // Login
    cy.login();

    cy.fixture('a-class-reg-form-ownership').then((fData) => {
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
      cy.get(`button.${prefix}--progress-step-button[title="Ownership"]`)
        .click();
    });
  });
  it('check title and subtitles', () => {
    cy.get('.seedlot-registration-title')
      .find('h1')
      .should('have.text', 'Seedlot Registration');

    cy.get('.seedlot-registration-title')
      .find('.seedlot-form-subtitle')
      .should('contain.text', `Seedlot ${seedlotNum}`);

    cy.get('.ownership-header')
      .find('h3')
      .should('have.text', regFormData.title);

    cy.get('.ownership-header')
      .find('p')
      .should('have.text', regFormData.subtitle);

    cy.get(`.${prefix}--accordion__title`)
      .find('.item-title-section')
      .should('have.text', regFormData.agencyTitle);

    cy.get(`.${prefix}--accordion__title`)
      .find('.item-description-section')
      .should('have.text', regFormData.agencySubtitle);
  });

  it('check owner agency section visibility', () => {
    cy.get('.ownership-form-container')
      .find(`button.${prefix}--accordion__heading`)
      .click();

    cy.get('.single-owner-info-container')
      .should('not.be.visible');
  });

  it('check owner agency and owner location code default values', () => {
    cy.get('#default-owner-checkbox')
      .should('be.checked');

    cy.get('#ownership-agency-0')
      .should('have.value', seedlotData[speciesKey].agencyAcronym);

    cy.get('#ownership-location-code-0')
      .should('have.value', seedlotData[speciesKey].agencyNumber);
  });

  it('change owner agency and owner location code', () => {
    // Change inputs
    cy.get('#default-owner-checkbox')
      .uncheck();

    // Enter invalid acronym
    cy.get('#ownership-agency-0')
      .type('ggg')
      .blur();

    cy.get('#collection-collector-agency-error-msg')
      .should('have.text', regFormData.ownerAgencyError);

    // Enter valid test acronym
    cy.get('#ownership-location-code-0')
      .clear()
      .type(testAcronym)
      .blur();

    cy.get(`svg.${prefix}--inline-loading__checkmark-container`)
      .should('be.visible');

    // Enter invalid location code
    cy.get('#ownership-location-code-0')
      .clear()
      .type('96', { delay: TYPE_DELAY })
      .blur();

    cy.get('#collection-location-code-error-msg')
      .should('have.text', regFormData.locationCodeError);

    // Enter valid location code
    cy.get('#ownership-location-code-0')
      .clear()
      .type('02')
      .blur();
  });

  it('check owner portion %, reserved % and surplus % default values', () => {
    cy.get('#ownership-portion-0')
      .should('have.value', '100');

    cy.get('#ownership-reserved-0')
      .should('have.value', '100');

    cy.get('#ownership-surplus-0')
      .should('have.value', '100');
  });

  it('change owner portion %, reserved % and surplus % values', () => {
    cy.get('#ownership-reserved-0')
      .clear()
      .type('02')
      .blur();

    cy.get('#ownership-surplus-0')
      .should('have.value', '98');

    cy.get('#ownership-surplus-0')
      .clear()
      .type('52')
      .blur();

    cy.get('#ownership-surplus-0')
      .should('have.value', '48');

    // Invalid owner portion % error msg test
    cy.get('#ownership-portion-0')
      .clear()
      .type('-1')
      .blur();

    cy.get('#ownership-portion-0-error-msg')
      .should('have.text', regFormData.ownerPortionBelowLimitError);

    cy.get('#ownership-portion-0')
      .clear()
      .type('0.0439')
      .blur();

    cy.get('#ownership-portion-0-error-msg')
      .should('have.text', regFormData.ownerPortionDecimalError);

    cy.get('#ownership-portion-0')
      .clear()
      .type('102')
      .blur();

    cy.get('#ownership-portion-0-error-msg')
      .should('have.text', regFormData.ownerPortionAboveLimitError);
  });

  it('check funding source and method of payment default values and change the values', () => {
    cy.get('#ownership-funding-source-0')
      .should('have.value', '');

    cy.get('.single-owner-info-col')
      .eq(0)
      .find(`button.${prefix}--list-box__menu-icon`)
      .click();

    cy.get('li#downshift-1-item-5')
      .click();

    cy.get('#ownership-funding-source-0')
      .should('have.value', 'FTM - Forests for Tomorrow MOF Admin');

    cy.get('#ownership-method-payment-0')
      .should('have.value', '');

    cy.get('.single-owner-info-col')
      .eq(1)
      .find(`button.${prefix}--list-box__menu-icon`)
      .click();

    cy.get('li#downshift-3-item-1')
      .click();

    cy.get('#ownership-method-payment-0')
      .should('have.value', 'CSH - Cash Sale');

    cy.get('.single-owner-info-col')
      .eq(0)
      .find('[aria-label="Clear selected item"]')
      .click()
      .blur();

    cy.get('#ownership-funding-source-0')
      .should('have.value', '');

    cy.get('.single-owner-info-col')
      .eq(1)
      .find('[aria-label="Clear selected item"]')
      .click()
      .blur();

    cy.get('#ownership-method-payment-0')
      .should('have.value', '');
  });

  it('create and delete new owner agency section', () => {
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

  it('check owner portion % for 3 owner agencies', () => {
    cy.get('button.owner-add-btn')
      .click()
      .blur();

    cy.get('button.owner-add-btn')
      .click()
      .blur();

    // Check 3 sections created
    cy.get(`ul.${prefix}--accordion`)
      .find(`li.${prefix}--accordion__item`)
      .should('have.length', 3);

    cy.get('#ownership-portion-0')
      .blur();

    // Check error message on all 3 sections
    cy.get(`div.${prefix}--form-requirement`)
      .should('have.length', 3)
      .and('contain.text', regFormData.ownerPortionSumError);

    cy.get('#ownership-portion-0')
      .clear()
      .type('90')
      .blur();

    cy.get('#ownership-portion-1')
      .clear()
      .type('5')
      .blur();

    cy.get('#ownership-portion-2')
      .clear()
      .type('5')
      .blur();

    // Check no error message on any 3 sections
    cy.get(`div.${prefix}--form-requirement`)
      .contains(regFormData.ownerPortionSumError)
      .should('not.exist');
  });
});
