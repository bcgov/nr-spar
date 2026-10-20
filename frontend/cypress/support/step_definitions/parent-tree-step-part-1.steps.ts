import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';
import { TYPE_DELAY } from '../../constants';

const parentTreeField = (parentTreeNumber: string, field: string) => cy.get(`#${parentTreeNumber}-${field}-value-input`);

When('I ensure primary and secondary orchards are selected', () => {
  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .contains('Back')
    .click();

  const chooseOrchard = (inputId: string, orchard: string) => {
    cy.get(`#${inputId}`).then(($input) => {
      if (!$input.val()) {
        cy.get(`#${inputId}`).click();
        cy.get(`.${prefix}--list-box--expanded`)
          .find('ul li')
          .contains(orchard)
          .click();
      }
    });
  };

  chooseOrchard('primary-orchard-selection', '219 - VERNON - S - PRD');
  cy.get('#secondary-orchard-selection').then(($input) => {
    if (!$input.length) {
      cy.get('.seedlot-orchard-add-orchard')
        .find('button')
        .contains('Add additional orchard')
        .click();
    }
  });
  chooseOrchard('secondary-orchard-selection', '222 - VERNON - S - PRD');

  cy.saveSeedlotRegFormProgress();
  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .contains('Next')
    .click();
  cy.get('#parentTreeNumber')
    .scrollIntoView();
  cy.saveSeedlotRegFormProgress();
});

Then('the parent tree page title should be {string}', (text: string) => {
  cy.get('.title-row')
    .find('h2')
    .should('have.text', text);
});

Then('the parent tree page subtitle should be {string}', (text: string) => {
  cy.get('.title-row')
    .find('.subtitle-section')
    .should(($el) => {
      expect($el.text().trim()).to.equal(text);
    });
});

Then('the parent tree accordion should be visible', () => {
  cy.get(`.${prefix}--accordion__wrapper`)
    .should('be.visible');
});

When('I download the parent tree template {string} as {string}', (label: string, fileName: string) => {
  cy.get('ul.donwload-templates-list')
    .find('li')
    .contains(label)
    .click();
  cy.readFile(`${Cypress.config('downloadsFolder')}/${fileName}`);
});

When('I collapse parent tree accordion {int}', (index: number) => {
  cy.get(`ul.${prefix}--accordion > li`)
    .eq(index - 1)
    .find(`button.${prefix}--accordion__heading`)
    .click();
  cy.get(`ul.${prefix}--accordion > li`)
    .eq(index - 1)
    .find(`.${prefix}--accordion__wrapper`)
    .should('not.be.visible');
});

When('I enter {string} in parent tree field {string}', (value: string, field: string) => {
  const selector = `#212-${field}-value-input`;
  cy.get(selector)
    .clear();
  cy.get(selector)
    .type(value, { delay: TYPE_DELAY });
  cy.get(selector)
    .blur();
});

When('I clear the cone and pollen count fields for parent tree {string}', (parentTreeNumber: string) => {
  parentTreeField(parentTreeNumber, 'pollenCount')
    .clear()
    .blur();
  parentTreeField(parentTreeNumber, 'coneCount')
    .clear()
    .blur();
});

When('I enter sample values into cone and pollen counts', () => {
  parentTreeField('212', 'coneCount')
    .clear()
    .type('16')
    .blur();
  parentTreeField('212', 'pollenCount')
    .clear()
    .type('17')
    .blur();
  parentTreeField('219', 'coneCount')
    .clear()
    .type('23')
    .blur();
  parentTreeField('219', 'pollenCount')
    .clear()
    .type('28')
    .blur();
});

Then('the cone and pollen counts for parent trees {string} and {string} should be empty', (first: string, second: string) => {
  [first, second].forEach((parentTreeNumber) => {
    parentTreeField(parentTreeNumber, 'coneCount')
      .should('have.value', '');
    parentTreeField(parentTreeNumber, 'pollenCount')
      .should('have.value', '');
  });
});

Then('parent tree {string} should have cone count {string} and pollen count {string}', (number: string, cone: string, pollen: string) => {
  parentTreeField(number, 'coneCount')
    .should('have.value', cone);
  parentTreeField(number, 'pollenCount')
    .should('have.value', pollen);
});

When('I set the parent tree page size to {string}', (size: string) => {
  cy.get(`.${prefix}--pagination`)
    .scrollIntoView();
  cy.get(`.${prefix}--pagination__left`)
    .find('select')
    .select(size);
});

Then('the parent tree pagination range should be {string}', (range: string) => {
  cy.get(`.${prefix}--pagination__left`)
    .find(`.${prefix}--pagination__items-count`)
    .should('include.text', range);
});

Then('the parent tree table should contain {int} rows', (count: number) => {
  cy.get(`table.${prefix}--data-table tbody tr`)
    .should('have.length', count);
});

When('I select parent tree page {string}', (page: string) => {
  cy.get(`.${prefix}--pagination__right`)
    .find(`select.${prefix}--select-input`)
    .select(page);
});

When('I move forward one parent tree page', () => {
  cy.get(`.${prefix}--pagination__control-buttons`)
    .find(`button.${prefix}--pagination__button--forward`)
    .click();
});

When('I move backward one parent tree page', () => {
  cy.get(`.${prefix}--pagination__control-buttons`)
    .find(`button.${prefix}--pagination__button--backward`)
    .click();
});

Then('the selected parent tree page should be {string}', (page: string) => {
  cy.get(`.${prefix}--pagination__right`)
    .find(`select.${prefix}--select-input`)
    .should('have.value', page);
});
