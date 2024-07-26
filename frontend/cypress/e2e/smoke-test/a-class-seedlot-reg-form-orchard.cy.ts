import prefix from '../../../src/styles/classPrefix';
import { SeedlotRegFixtureType } from '../../definitions';

describe('A Class Seedlot Registration form, Orchard', () => {
  let regFormData: {
    orchard: {
      title: string;
      subtitle: string;
      singleOrchardError: string;
      doubleOrchardError: string;
      additionalOrchardLabel: string;
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
  const parentTreeSet = new Set();
  const unionParentTreeArray: string[] = [];
  const lengthOfArray = 6;

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

  it('Orchard dropdown section', () => {
    cy.get('#orchard-combobox-0')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .as('orchardDropdown')
      .contains('219 - VERNON - S - PRD')
      .click();

    // Go to next step to get error msg
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    // Wait for the table in Step 5 to load
    cy.get('#parentTreeNumber');

    cy.get('@progressBar')
      .contains('Orchard')
      .click();

    cy.get('#orchard-combobox-0')
      .siblings(`button.${prefix}--list-box__selection[title="Clear selected item"]`)
      .as('cancelOrchard')
      .click();

    // Check change orchard modal is visible
    cy.get(`.${prefix}--modal-container[aria-label="Change orchard"]`)
      .should('be.visible');

    cy.get(`.${prefix}--modal-container[aria-label="Change orchard"]`)
      .find(`h3.${prefix}--modal-header__heading`)
      .should('have.text', regFormData.orchard.singleOrchardError);

    // Check 'Cancel' button of change orchard modal
    cy.get(`.${prefix}--modal-container[aria-label="Change orchard"]`)
      .find(`button.${prefix}--btn`)
      .contains('Cancel')
      .click();

    // Check 'Change orchard' button of change orchard modal
    cy.get('@cancelOrchard')
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Change orchard"]`)
      .find(`button.${prefix}--btn`)
      .contains('Change orchard')
      .click();

    cy.get('#orchard-combobox-0')
      .should('have.value', '');

    // Add orchard from dropdown
    cy.get('#orchard-combobox-0')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get('@orchardDropdown')
      .contains('219 - VERNON - S - PRD')
      .click();

    // Add additional orchard
    cy.get('.seedlot-orchard-add-orchard')
      .find('button')
      .contains('Add additional orchard')
      .click();

    cy.get(`label.${prefix}--label[for="orchard-combobox-1"]`)
      .should('have.text', regFormData.orchard.additionalOrchardLabel);

    cy.get('#orchard-combobox-1')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get('@orchardDropdown')
      .contains('222 - VERNON - S - PRD')
      .click();

    // Go to next step to get error msg
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    // Wait for the table in Step 5 to load
    cy.get('#parentTreeNumber');

    cy.get('@progressBar')
      .contains('Orchard')
      .click();

    // Delete additional orchard
    cy.get('.seedlot-orchard-add-orchard')
      .find('button')
      .contains('Delete additional orchard')
      .as('deleteOrchard')
      .click();

    // Check delete orchard modal is visible
    cy.get(`.${prefix}--modal-container[aria-label="Delete orchard"]`)
      .should('be.visible');

    cy.get(`.${prefix}--modal-container[aria-label="Delete orchard"]`)
      .find(`h3.${prefix}--modal-header__heading`)
      .should('have.text', regFormData.orchard.doubleOrchardError);

    // Check 'Cancel' button of change orchard modal
    cy.get(`.${prefix}--modal-container[aria-label="Delete orchard"]`)
      .find(`button.${prefix}--btn`)
      .contains('Cancel')
      .click();

    cy.get('@deleteOrchard')
      .click();

    // Check 'Delete additional orchard' button of change orchard modal
    cy.get(`.${prefix}--modal-container[aria-label="Delete orchard"]`)
      .find(`button.${prefix}--btn`)
      .contains('Delete additional orchard')
      .click();

    cy.get('#orchard-combobox-1')
      .should('not.exist');

    cy.get('@cancelOrchard')
      .click();

    cy.get('#orchard-combobox-0')
      .should('have.value', '');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('store first Orchard Parent Tree Number in an array', () => {
    cy.get('#orchard-combobox-0')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .as('orchardDropdown')
      .contains('219 - VERNON - S - PRD')
      .click();

    // Go to next step 'Parent tree and SMP'
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    // Wait for the table in Step 5 to load
    cy.get('#parentTreeNumber');

    // Push first 6 parent tree number in an array
    for (let i = 0; i < lengthOfArray; i += 1) {
      cy.get('.parent-tree-step-table-container-col')
        .find('table tbody tr')
        .eq(i)
        .find('td:nth-child(1)')
        .invoke('text')
        .then(($number) => {
          // firstParentTreeArray.push($number);
          parentTreeSet.add($number);
        });
    }

    // Go back to 'Orchard'
    cy.get('@progressBar')
      .contains('Orchard')
      .click();

    // Cancel orchard
    cy.get('#orchard-combobox-0')
      .siblings(`button.${prefix}--list-box__selection[title="Clear selected item"]`)
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Change orchard"]`)
      .find(`button.${prefix}--btn`)
      .contains('Change orchard')
      .click();

    cy.get('#orchard-combobox-0')
      .should('have.value', '');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('store second Orchard Parent Tree Number in an array', () => {
    // Enter new orchard
    cy.get('#orchard-combobox-0')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('222 - VERNON - S - PRD')
      .click();

    // Go to next step 'Parent tree and SMP'
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    // Wait for the table in Step 5 to load
    cy.get('#parentTreeNumber');

    // Push first 6 parent tree number in an array
    for (let i = 0; i < lengthOfArray; i += 1) {
      cy.get('.parent-tree-step-table-container-col')
        .find('table tbody tr')
        .eq(i)
        .find('td:nth-child(1)')
        .invoke('text')
        // eslint-disable-next-line no-loop-func
        .then(($number) => {
          parentTreeSet.add($number);
        });
    }

    // Go back to 'Orchard'
    cy.get('@progressBar')
      .contains('Orchard')
      .click();

    // Cancel orchard
    cy.get('#orchard-combobox-0')
      .siblings(`button.${prefix}--list-box__selection[title="Clear selected item"]`)
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Change orchard"]`)
      .find(`button.${prefix}--btn`)
      .contains('Change orchard')
      .click();

    cy.get('#orchard-combobox-0')
      .should('have.value', '');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Linkage of Step 4 and Step 5', () => {
    cy.get('#orchard-combobox-0')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('219 - VERNON - S - PRD')
      .click();

    // Add additional orchard
    cy.get('.seedlot-orchard-add-orchard')
      .find('button')
      .contains('Add additional orchard')
      .click();

    cy.get('#orchard-combobox-1')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('222 - VERNON - S - PRD')
      .click();

    // Save changes
    cy.saveSeedlotRegFormProgress();

    // Go to next step 'Parent tree and SMP'
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    // Wait for the table in Step 5 to load
    cy.get('#parentTreeNumber');

    // Get parent tree number in an array
    for (let i = 0; i < lengthOfArray; i += 1) {
      cy.get('.parent-tree-step-table-container-col')
        .find('table tbody tr')
        .eq(i)
        .find('td:nth-child(1)')
        .invoke('text')
        // eslint-disable-next-line no-loop-func
        .then(($number) => {
          unionParentTreeArray.push($number);
          if (i === lengthOfArray - 1) {
            // Convert Set to an Array
            const parentTreeArray = Array.from(parentTreeSet);
            const combinedParentTreeArray = (
              parentTreeArray
                .sort((a: any, b: any) => a - b)
            )
              .slice(0, 6);
            expect(combinedParentTreeArray).to.deep.eq(unionParentTreeArray);
          }
        });
    }

    // Go back to 'Orchard'
    cy.get('@progressBar')
      .contains('Orchard')
      .click();
  });

  it('Default gamete information', () => {
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

  it('Change gamete information', () => {
    // Select female gametic contribution methodology
    cy.get('#orchard-female-gametic')
      .siblings()
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('F2 - Measured Cone Volume')
      .click();

    cy.get('#orchard-female-gametic')
      .should('have.value', 'F2 - Measured Cone Volume');

    // Select male gametic contribution methodology
    cy.get('#orchard-male-gametic')
      .siblings()
      .click();

      cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('M3 - Pollen Volume Estimate by 100% Survey')
      .click();

    cy.get('#orchard-male-gametic')
      .should('have.value', 'M3 - Pollen Volume Estimate by 100% Survey');

    // Check 'x' button
    cy.get('#orchard-female-gametic')
      .siblings('[title="Clear selected item"]')
      .click();

    cy.get('#orchard-female-gametic')
      .should('have.value', '');

    cy.get('#orchard-male-gametic')
      .siblings('[title="Clear selected item"]')
      .click();

    cy.get('#orchard-male-gametic')
      .should('have.value', '');

    // Enter female and male gametic contribution methodology again
    cy.get('#orchard-female-gametic')
      .siblings()
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('F2 - Measured Cone Volume')
      .click();

    cy.get('#orchard-male-gametic')
      .siblings()
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('M3 - Pollen Volume Estimate by 100% Survey')
      .click();

    // Change radio inputs of gamete section
    cy.get('#controlled-cross-yes')
      .check({ force: true });

    cy.get('#controlled-cross-yes')
      .should('be.checked');

    cy.get('#biotech-yes')
      .check({ force: true });

    cy.get('#biotech-yes')
      .should('be.checked');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Pollen information', () => {
    cy.get('#pollen-contam-no')
      .should('be.checked');

    cy.get('#orchard-breading-perc')
      .should('not.exist');

    cy.get('#orchard-is-regional')
      .should('not.exist');
  });

  it('Change pollen information', () => {
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

    cy.get(`button.${prefix}--number__control-btn[title="Increment number"]`)
      .click();

    cy.get('#orchard-breading-perc')
      .should('have.value', '15');

    cy.get(`button.${prefix}--number__control-btn[title="Decrement number"]`)
      .click();

    cy.get('#orchard-breading-perc')
      .should('have.value', '5');

    // Save changes
    cy.saveSeedlotRegFormProgress();

    // Press next button
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Next')
      .click();

    cy.get('ul.spar-seedlot-reg-progress-bar').scrollIntoView({ easing: 'linear' })

    // Check svg with complete checkmark on Step 3
    cy.get('ul.spar-seedlot-reg-progress-bar li')
      .eq(3)
      .should('have.class', `${prefix}--progress-step--complete`);
  });
});
