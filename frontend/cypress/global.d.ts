/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-testid attribute.
     *
     * @param selector {string} - The data-testid attribute of the object to be selected
     * @example
     * cy.getByDataTest('main')
     */
    getByDataTest(selector: string): Chainable<JQuery<HTMLElement>>

    /**
     * Custom command to log in on app.
     *
     * @example
     * cy.login()
     */
    login(): void

    /**
     * Custom command to navigate using the app side menu.
     *
     * @example
     * cy.navigateTo('Menu Item Name')
     */
    navigateTo(menuItem: string): void

    /**
     * Custom command to check the current page title.
     *
     * @example
     * cy.isPageTitle('Page Title')
     */
    isPageTitle(pageTitle: string): void

    /**
     * Custom command to toogle favourite feature of the current page.
     *
     * @example
     * cy.isPageTitle('Page Title')
     */
    toogleFavourite(): void

    /**
     * Custom command to save current form or section of page.
     *
     * @example
     * cy.saveButton()
     */
    saveSeedlotRegFormProgress(): void
  }
}
