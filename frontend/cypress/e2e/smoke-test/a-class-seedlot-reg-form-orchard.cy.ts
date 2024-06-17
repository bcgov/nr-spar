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
  const firstParentTreeArray: string[] = [];
  const secondParentTreeArray: string[] = [];
  let uniqueArray: string[];
  let unionParentTreeArray: string[];

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

  it('check orchard dropdown section', () => {
    cy.get('#orchard-combobox-0')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .as('orchardDropdown')
      .eq(1)
      .click();

    // Save changes
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains(/Save changes|Changes saved!/g)
      .click();

    // Go to next step to get error msg
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    cy.get('.title-row')
      .find('h2')
      .should('have.text', 'Cone and pollen count and SMP data');

    // Save changes
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains(/Save changes|Changes saved!/g)
      .click();

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

    cy.get('#orchard-combobox-0')
      .should('have.value', '219 - VERNON - S - PRD');

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
      .eq(1)
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
      .eq(5)
      .click();

    // Save changes
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains(/Save changes|Changes saved!/g)
      .click();

    // Go to next step to get error msg
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    cy.get('.title-row')
      .find('h2')
      .should('have.text', 'Cone and pollen count and SMP data');

    // Save changes
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains(/Save changes|Changes saved!/g)
      .click();

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

    cy.get('#orchard-combobox-1')
      .should('have.value', '228 - PGTIS - S - PRD');

    cy.get('@deleteOrchard')
      .click();

    // Check 'Delete additional orchard' button of change orchard modal
    cy.get(`.${prefix}--modal-container[aria-label="Delete orchard"]`)
      .find(`button.${prefix}--btn`)
      .contains('Delete additional orchard')
      .click();

    cy.get('#orchard-combobox-1')
      .should('have.value', '');
  });

  it('store first Parent Tree Number in an array', () => {
    cy.get('#orchard-combobox-0')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .as('orchardDropdown')
      .eq(1)
      .click();

    // Go to next step 'Parent tree and SMP'
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    // Push first 5 parent tree number in an array
    for (let i = 0; i < 5; i += 1) {
      cy.get('.parent-tree-step-table-container-col')
        .find('table tbody tr')
        .eq(i)
        .find('td:nth-child(1)')
        .invoke('text')
        .then(($number) => {
          firstParentTreeArray.push($number);
        });
    }

    // Save changes
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains(/Save changes|Changes saved!/g)
      .click();

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
  });

  it('store second Parent Tree Number in an array', () => {
    // Enter new orchard
    cy.get('#orchard-combobox-0')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .eq(5)
      .click();

    // Go to next step 'Parent tree and SMP'
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    // Push first 5 parent tree number in an array
    for (let i = 0; i < 5; i += 1) {
      cy.get('.parent-tree-step-table-container-col')
        .find('table tbody tr')
        .eq(i)
        .find('td:nth-child(1)')
        .invoke('text')
        // eslint-disable-next-line no-loop-func
        .then(($number) => {
          secondParentTreeArray.push($number);
          const combinedArray = (firstParentTreeArray.concat(secondParentTreeArray)).sort();
          return combinedArray;
        })
        // eslint-disable-next-line no-loop-func
        .then(($array) => {
          // Remove duplicate tree numbers from array
          uniqueArray = Array.from(new Set($array));
        });
    }
  });

  it('check linkage of Step 4 and Step 5', () => {
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
      .eq(1)
      .click();

    // Go to next step 'Parent tree and SMP'
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    // Get parent tree number in an array
    for (let i = 0; i < uniqueArray.length; i += 1) {
      cy.get('.parent-tree-step-table-container-col')
        .find('table tbody tr')
        .eq(i)
        .find('td:nth-child(1)')
        .invoke('text')
        .then(($number) => {
          unionParentTreeArray.push($number);
        })
        // eslint-disable-next-line no-loop-func
        .then(() => {
          // Compare two arrays
          expect(uniqueArray).to.deep.eq(unionParentTreeArray);
        });
    }
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

    cy.get('.gametic-combobox')
      .eq(0)
      .find('ul li')
      .eq(1)
      .click();

    cy.get('#orchard-female-gametic')
      .should('have.value', 'F2 - Measured Cone Volume');

    // Select male gametic contribution methodology
    cy.get('.gametic-combobox')
      .eq(1)
      .find(`button.${prefix}--list-box__menu-icon`)
      .click();

    cy.get('.gametic-combobox')
      .eq(1)
      .find('ul li')
      .eq(2)
      .click();

    cy.get('#orchard-male-gametic')
      .should('have.value', 'M3 - Pollen Volume Estimate by 100% Survey');

    // Check 'x' button
    cy.get('.gametic-combobox')
      .eq(0)
      .find(`button.${prefix}--list-box__selection[title="Clear selected item"]`)
      .click();

    cy.get('#orchard-female-gametic')
      .should('have.value', '');

    cy.get('.gametic-combobox')
      .eq(1)
      .find(`button.${prefix}--list-box__selection[title="Clear selected item"]`)
      .click();

    cy.get('#orchard-male-gametic')
      .should('have.value', '');

    // Enter female and male gametic contribution methodology again
    cy.get('.gametic-combobox')
      .eq(0)
      .find(`button.${prefix}--list-box__menu-icon`)
      .click();

    cy.get('.gametic-combobox')
      .eq(0)
      .find('ul li')
      .eq(1)
      .click();

    cy.get('.gametic-combobox')
      .eq(1)
      .find(`button.${prefix}--list-box__menu-icon`)
      .click();

    cy.get('.gametic-combobox')
      .eq(1)
      .find('ul li')
      .eq(1)
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
  });

  it('check pollen information', () => {
    cy.get('#pollen-contam-no')
      .should('be.checked');

    cy.get('#orchard-breading-perc')
      .should('not.exist');

    cy.get('#orchard-is-regional')
      .should('not.exist');
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

    cy.get(`button.${prefix}--number__control-btn[title="Increment number"]`)
      .click();

    cy.get('#orchard-breading-perc')
      .should('have.value', '15');

    cy.get(`button.${prefix}--number__control-btn[title="Decrement number"]`)
      .click();

    cy.get('#orchard-breading-perc')
      .should('have.value', '5');
  });

  it('check complete checkmark on progress bar', () => {
    // Press next button
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Next')
      .click();

    // Check svg with complete checkmark on Step 3
    cy.get('ul.spar-seedlot-reg-progress-bar li')
      .eq(4)
      .should('have.class', `${prefix}--progress-step--complete`);
  });
});
