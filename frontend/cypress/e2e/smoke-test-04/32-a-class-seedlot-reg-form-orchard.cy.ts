import prefix from '../../../src/styles/classPrefix';
import { THIRTY_SECONDS, TYPE_DELAY } from '../../constants';
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
  const F2GameticValue = 'F2 - Measured Cone Volume';
  const M3GameticValue = 'M3 - Pollen Volume Estimate by 100% Survey';

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

    cy.get('.seedlot-gamete-title-row')
      .find('h2')
      .should('have.text', regFormData.orchard.gameteTitle);

    cy.get('.seedlot-gamete-title-row')
      .find('.subtitle-section')
      .should('have.text', regFormData.orchard.gameteSubtitle);

    cy.get('.seedlot-orchard-title-row')
      .find('h2')
      .eq(1)
      .should('have.text', regFormData.orchard.pollenTitle);

    cy.get('.seedlot-orchard-title-row')
      .find('.subtitle-section')
      .eq(1)
      .should('have.text', regFormData.orchard.pollenSubtitle);
  });

  it('Orchard dropdown section', () => {
    cy.get('#primary-orchard-selection')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .as('orchardDropdown')
      .contains('219 - VERNON - S - PRD')
      .click();

    // Intercept the call before step 5 mounts
    cy.intercept({
      method: 'GET',
      url: '**/api/parent-trees/vegetation-codes/*'
    }).as('parentTreesUnderVegCode');

    // Go to next step to get error msg
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    // Wait for the data for table in Step 5 to load
    cy.wait('@parentTreesUnderVegCode', { timeout: THIRTY_SECONDS }).its('response.statusCode').should('equal', 200);

    // Verify table data is loaded
    cy.get('#parentTreeNumber');

    cy.get('@progressBar')
      .contains('Orchard')
      .click();

    cy.get('#primary-orchard-selection')
      .siblings(`button.${prefix}--list-box__selection[title="Clear selected item"]`)
      .as('cancelOrchard')
      .click();

    // Check change orchard modal is visible
    cy.get(`.${prefix}--modal-container[aria-label="Change orchard"]`)
      .should('be.visible');

    cy.get(`.${prefix}--modal-container[aria-label="Change orchard"]`)
      .find(`h2.${prefix}--modal-header__heading`)
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

    cy.get('#primary-orchard-selection')
      .should('have.value', '');

    // Add orchard from dropdown
    cy.get('#primary-orchard-selection')
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

    cy.get(`label.${prefix}--label[for="secondary-orchard-selection"]`)
      .should('have.text', regFormData.orchard.additionalOrchardLabel);

    cy.get('#secondary-orchard-selection')
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

    // Verify table data is loaded
    cy.get('#parentTreeNumber');

    cy.get('@progressBar')
      .contains('Orchard')
      .click();

    // Delete secondary orchard
    cy.get('.seedlot-orchard-add-orchard')
      .find('button')
      .contains('Delete secondary orchard')
      .as('deleteOrchard')
      .click();

    // Check delete orchard modal is visible
    cy.get(`.${prefix}--modal-container[aria-label="Delete orchard"]`)
      .should('be.visible');

    cy.get(`.${prefix}--modal-container[aria-label="Delete orchard"]`)
      .find(`h2.${prefix}--modal-header__heading`)
      .should('have.text', regFormData.orchard.doubleOrchardError);

    // Check 'Cancel' button of change orchard modal
    cy.get(`.${prefix}--modal-container[aria-label="Delete orchard"]`)
      .find(`button.${prefix}--btn`)
      .contains('Cancel')
      .click();

    cy.get('@deleteOrchard')
      .click();

    // Check 'Delete secondary orchard' button of change orchard modal
    cy.get(`.${prefix}--modal-container[aria-label="Delete orchard"]`)
      .find(`button.${prefix}--btn`)
      .contains('Delete secondary orchard')
      .click();

    cy.get('#secondary-orchard-selection')
      .should('not.exist');

    cy.get('@cancelOrchard')
      .click();

    cy.get('#primary-orchard-selection')
      .should('have.value', '');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('store first Orchard Parent Tree Number in an array', () => {
    cy.get('#primary-orchard-selection')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .as('orchardDropdown')
      .contains('219 - VERNON - S - PRD')
      .click();

    // Intercept the call before step 5 mounts
    cy.intercept({
      method: 'GET',
      url: '**/api/parent-trees/vegetation-codes/*'
    }).as('parentTreesUnderVegCode');

    // Go to next step 'Parent tree and SMP'
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    cy.wait('@parentTreesUnderVegCode', { timeout: THIRTY_SECONDS }).its('response.statusCode').should('equal', 200);

    // Verify table data is loaded
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
    cy.get('#primary-orchard-selection')
      .siblings(`button.${prefix}--list-box__selection[title="Clear selected item"]`)
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Change orchard"]`)
      .find(`button.${prefix}--btn`)
      .contains('Change orchard')
      .click();

    cy.get('#primary-orchard-selection')
      .should('have.value', '');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('store second Orchard Parent Tree Number in an array', () => {
    // Enter new orchard
    cy.get('#primary-orchard-selection')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('222 - VERNON - S - PRD')
      .click();

    // Intercept the call before step 5 mounts
    cy.intercept({
      method: 'GET',
      url: '**/api/parent-trees/vegetation-codes/*'
    }).as('parentTreesUnderVegCode');

    // Go to next step 'Parent tree and SMP'
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    cy.wait('@parentTreesUnderVegCode', { timeout: THIRTY_SECONDS }).its('response.statusCode').should('equal', 200);

    // Verify table data is loaded
    cy.get('#parentTreeNumber');

    // Push first 6 parent tree number in an array
    for (let i = 0; i < lengthOfArray; i += 1) {
      cy.get('.parent-tree-step-table-container-col')
        .find('table tbody tr')
        .eq(i)
        .find('td:nth-child(1)')
        .invoke('text')
        .then(($number) => {
          parentTreeSet.add($number);
        });
    }

    // Go back to 'Orchard'
    cy.get('@progressBar')
      .contains('Orchard')
      .click();

    // Cancel orchard
    cy.get('#primary-orchard-selection')
      .siblings(`button.${prefix}--list-box__selection[title="Clear selected item"]`)
      .click();

    cy.get(`.${prefix}--modal-container[aria-label="Change orchard"]`)
      .find(`button.${prefix}--btn`)
      .contains('Change orchard')
      .click();

    cy.get('#primary-orchard-selection')
      .should('have.value', '');

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Linkage of Step 4 and Step 5', () => {
    cy.get('#primary-orchard-selection')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('219 - VERNON - S - PRD')
      .click();

    // Save changes
    cy.saveSeedlotRegFormProgress();

    // Add additional orchard
    cy.get('.seedlot-orchard-add-orchard')
      .find('button')
      .contains('Add additional orchard')
      .click();

    cy.get('#secondary-orchard-selection')
      .siblings(`button.${prefix}--list-box__menu-icon[title="Open"]`)
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains('222 - VERNON - S - PRD')
      .click();

    // Save changes
    cy.saveSeedlotRegFormProgress();

    // Intercept the call before step 5 mounts
    cy.intercept({
      method: 'GET',
      url: '**/api/parent-trees/vegetation-codes/*'
    }).as('parentTreesUnderVegCode');

    // Go to next step 'Parent tree and SMP'
    cy.get('.seedlot-registration-progress')
      .find(`button.${prefix}--progress-step-button`)
      .as('progressBar')
      .contains('Parent tree and SMP')
      .click();

    cy.wait('@parentTreesUnderVegCode', { timeout: THIRTY_SECONDS }).its('response.statusCode').should('equal', 200);

    // Verify table data is loaded
    cy.get('#parentTreeNumber');

    // Get parent tree number in an array
    for (let i = 0; i < lengthOfArray; i += 1) {
      cy.get('.parent-tree-step-table-container-col')
        .find('table tbody tr')
        .eq(i)
        .find('td:nth-child(1)')
        .invoke('text')
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
      .contains(F2GameticValue)
      .click();

    cy.get('#orchard-female-gametic')
      .should('have.value', F2GameticValue);

    // Select male gametic contribution methodology
    cy.get('#orchard-male-gametic')
      .siblings()
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains(M3GameticValue)
      .click();

    cy.get('#orchard-male-gametic')
      .should('have.value', M3GameticValue);

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
      .contains(F2GameticValue)
      .click();

    cy.get('#orchard-female-gametic')
      .should('have.value', F2GameticValue);

    cy.get('#orchard-male-gametic')
      .siblings()
      .click();

    cy.get(`.${prefix}--list-box--expanded`)
      .find('ul li')
      .contains(M3GameticValue)
      .click();

    cy.get('#orchard-male-gametic')
      .should('have.value', M3GameticValue);

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

    cy.get('#orchard-breading-perc-helper-text')
      .should('have.text', regFormData.orchard.pollenHelperText);

    // Check pollen breeding % error msg
    cy.get('#orchard-breading-perc')
      .clear()
      .type('-1', { delay: TYPE_DELAY })
      .blur();

    cy.get('#orchard-breading-perc-error-msg')
      .should('have.text', regFormData.orchard.pollenError);

    cy.get('#orchard-breading-perc')
      .clear()
      .type('101', { delay: TYPE_DELAY })
      .blur();

    cy.get('#orchard-breading-perc-error-msg')
      .should('have.text', regFormData.orchard.pollenError);

    cy.get('#orchard-breading-perc')
      .clear()
      .type('21.1576', { delay: TYPE_DELAY })
      .blur();

    cy.get('#orchard-breading-perc-error-msg')
      .should('have.text', regFormData.orchard.pollenError);

    cy.get('#orchard-breading-perc')
      .clear()
      .type('5', { delay: TYPE_DELAY })
      .blur();

    // Save changes
    cy.saveSeedlotRegFormProgress();
  });

  it('Step complete status', () => {
    // Press next button
    cy.get('.seedlot-registration-button-row')
      .find('button.form-action-btn')
      .contains('Next')
      .click();

    // Check step complete status
    cy.get(`.${prefix}--progress-step--complete`)
      .contains('Orchard');
  });
});
