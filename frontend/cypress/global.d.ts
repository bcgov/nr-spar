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
    /**
     * Custom command to close the side menu if it's open (for smaller screen sizes).
     *
     * @example
     * cy.closeMenuIfOpen()
     */
    closeMenuIfOpen(): void
    /**
     * Custom command to wait for table data to be loaded by checking for the presence of rows.
     *
     * @param tableSelector {string} - The selector for the table element
     * @param timeout {number} - Optional timeout in milliseconds
     * @example
     * cy.waitForTableData('.my-table')
     */
    waitForTableData(tableSelector: string, timeout?: number): void
  }
}
