import prefix from '../../../src/styles/classPrefix';

export const openClientSearchModal = (agencyInputSelector: string) => {
  cy.get(agencyInputSelector)
    .closest('.agency-information-section')
    .find('button.client-search-toggle-btn')
    .click();
};

export const searchClientByAcronym = (
  acronym: string,
  typingDelay?: number
) => {
  cy.get('#client-search-dropdown')
    .find(`button.${prefix}--list-box__field`)
    .click();

  cy.get('#client-search-dropdown')
    .find('li')
    .contains('Acronym')
    .click();

  cy.get('#client-search-input').clear();

  if (typingDelay) {
    cy.get('#client-search-input')
      .type(acronym, { delay: typingDelay });
  } else {
    cy.get('#client-search-input')
      .type(acronym);
  }

  cy.get('#client-search-input').blur();

  cy.get('button.client-search-button')
    .contains('Search')
    .click();
};

export const selectFirstClientSearchResult = (): Cypress.Chainable<string> => {
  cy.get(`table.${prefix}--data-table tbody tr`)
    .eq(0)
    .find('td:nth-child(1)')
    .find(`input.${prefix}--radio-button`)
    .check({ force: true });

  return cy.get(`table.${prefix}--data-table tbody tr`)
    .eq(0)
    .find('td[id*="locationCode"]')
    .invoke('text')
    .then((locationCode) => locationCode.trim());
};

export const applySelectedClient = (force = false) => {
  cy.get(`button.${prefix}--btn--primary`)
    .contains('Apply selected client')
    .click({ force });
};
