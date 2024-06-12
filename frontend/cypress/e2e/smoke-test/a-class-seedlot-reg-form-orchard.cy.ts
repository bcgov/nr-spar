import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

describe('A Class Seedlot Registration form, Orchard', () => {
  let regFormData: {
    orchard: {
      title: string;
      subtitle: string;
      gameteTitle: string;
      gameteSubtitle: string;
      pollenTitle: string;
      pollenSubtitle: string;
      pollenError: string;
      pollenHelperText: string;
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
        const url = `/seedlots/a-class-registration/${seedlotNum}/?step=4`;
        cy.visit(url);
        cy.url().should('contains', url);
      });
    });
  });

  it('Page title and subtitles', () => {
    cy.get('.seedlot-orchard-title-row')
      .find('h2')
      .eq(0)
      .should('have.text', regFormData.orchard.title);

    cy.get('.seedlot-orchard-title-row')
      .find('.subtitle-section')
      .eq(0)
      .should('have.text', regFormData.orchard.subtitle);

    cy.get('.seedlot-orchard-title-row')
      .find('h2')
      .eq(1)
      .should('have.text', regFormData.orchard.gameteTitle);

    cy.get('.seedlot-orchard-title-row')
      .find('.subtitle-section')
      .eq(1)
      .should('have.text', regFormData.orchard.gameteSubtitle);

    cy.get('.seedlot-orchard-title-row')
      .find('h2')
      .eq(2)
      .should('have.text', regFormData.orchard.pollenTitle);

    cy.get('.seedlot-orchard-title-row')
      .find('.subtitle-section')
      .eq(2)
      .should('have.text', regFormData.orchard.pollenSubtitle);
  });

  it('check default gamete information', () => {
    cy.get('#seedlot-species-text-input')
      .should('have.value', seedlotData[speciesKey].species);

    cy.get('#orchard-female-gametic')
      .should('have.value', '');

    cy.get('#orchard-male-gametic')
      .should('have.value', '');

    cy.get('#controlled-cross-no')
      .should('be.checked');

    cy.get('#biotech-no')
      .should('be.checked');
  });

  it('change gamete information', () => {
    // Select female gametic contribution methodology
    cy.get('.gametic-combobox')
      .eq(0)
      .find(`button.${prefix}--list-box__menu-icon`)
      .click();

    cy.get('#downshift-37-item-1')
      .click();

    cy.get('#orchard-female-gametic')
      .should('have.value', 'F2 - Measured Cone Volume');

    // Select male gametic contribution methodology
    cy.get('.gametic-combobox')
      .eq(1)
      .find(`button.${prefix}--list-box__menu-icon`)
      .click();

    cy.get('#downshift-39-item-2')
      .click();

    cy.get('#orchard-male-gametic')
      .should('have.value', 'M3 - Pollen Volume Estimate by 100% Survey');

    cy.get('#controlled-cross-yes')
      .check({ force: true });

    cy.get('#controlled-cross-yes')
      .should('be.checked');

    cy.get('#biotech-yes')
      .check({ force: true });

    cy.get('#biotech-yes')
      .should('be.checked');
  });

  it('check pollen information', () => {
    cy.get('#pollen-contam-no')
      .should('be.checked');

    cy.get('#orchard-breading-perc')
      .should('not.be.visible');

    cy.get('#orchard-is-regional')
      .should('not.be.visible');
  });

  it('change pollen information', () => {
    cy.get('#pollen-contam-yes')
      .check({ force: true });

    cy.get('#pollen-contam-yes')
      .should('be.checked');

    cy.get('#orchard-breading-perc')
      .should('be.visible');

    cy.get('#orchard-is-regional')
      .should('be.visible');

    cy.get('#orchard-is-regional')
      .should('be.checked');

    // Check pollen breeding % error msg
    cy.get('#orchard-breading-perc')
      .clear()
      .type('-1')
      .blur();

    cy.get('#orchard-breading-perc-error-msg')
      .should('have.text', regFormData.orchard.pollenError);

    cy.get('#orchard-breading-perc')
      .clear()
      .type('101')
      .blur();

    cy.get('#orchard-breading-perc-error-msg')
      .should('have.text', regFormData.orchard.pollenError);

    cy.get('#orchard-breading-perc')
      .clear()
      .type('21.1576')
      .blur();

    cy.get('#orchard-breading-perc-error-msg')
      .should('have.text', regFormData.orchard.pollenError);

    // Check '+' and '-' buttons for pollen breeding %
    cy.get('#orchard-breading-perc')
      .clear()
      .type('5')
      .blur();

    cy.get('#orchard-breading-perc-helper-text')
      .should('have.text', regFormData.orchard.pollenHelperText);

    cy.get(`button.${prefix}number__control-btn[title="Increment number"]`)
      .click();

    cy.get('#orchard-breading-perc')
      .should('have.value', '15');

    cy.get(`button.${prefix}number__control-btn[title="Decrement number"]`)
      .click();

    cy.get('#orchard-breading-perc')
      .should('have.value', '5');
  });
});
