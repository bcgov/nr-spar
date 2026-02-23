/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { NavigationLabels } from '../../utils/labels';
import prefix from '../../../src/styles/classPrefix';

describe('Dashboard page test', () => {
  let dashboardPageData: {
    emptySectionTitle: string,
    emptySectionSubtitle: string
  };

  beforeEach(function () {
    // Loading test data
    cy.fixture('dashboard-page').then((fData) => {
      dashboardPageData = fData;
    });

    cy.login();
    cy.visit('/');
    cy.url().should('contains', '/dashboard');
    // Wait for the page title to be visible before proceeding
    cy.get('.title-section h1')
      .should('have.text', NavigationLabels.Dashboard);
  });

  /**
   * Dashboard page should load correctly.
   */
  it('should load and display dashboard page correctly', () => {
    cy.isPageTitle(NavigationLabels.Dashboard);
  });

  it('should display empty favourite activities section correctly', () => {
    cy.isPageTitle(NavigationLabels.Dashboard);

    cy.get('.favourite-activities-cards')
      .should('exist')
      .within(() => {
        cy.contains('.empty-section-title', dashboardPageData.emptySectionTitle)
          .should('be.visible');

        cy.contains('.empty-section-subtitle', dashboardPageData.emptySectionSubtitle)
          .should('be.visible');
      });
  });

  /**
   * Click on the heart icon should favourite the seedlots dashboard page.
   */
  it('should be able to favourite the Seedlots Dashboard page', function () {
    // Navigate to Seedlots page
    cy.navigateTo(NavigationLabels.Seedlots);
    cy.url().should('contains', '/seedlots');

    // Favourite Seedlots page
    cy.get('.title-favourite')
      .find(`.${prefix}--popover-container`)
      .click();

    // Navigate back to Dashboard
    cy.navigateTo(NavigationLabels.Dashboard);

    // Check if seedlot card is appearing at favourites activities
    cy.get('.favourite-activities-cards')
      .should('exist')
      .within(() => {
        cy.contains('.fav-card-content .fav-card-title-large', 'Seedlots')
          .should('be.visible')
          .click();
      });

    cy.isPageTitle(NavigationLabels.Seedlots);
  });

  /**
   * Highlight a favourite card should make it appear highlighted.
   */
  it('should be able to highlight favourite cards at dashboard', function () {
    // Load the page with the data returned from the intercept above.
    cy.visit('/dashboard');
    cy.url().should('contains', '/dashboard');

    // Highlight Seedlots Dashboard Card
    cy.get('.favourite-activities-cards')
      .find('.fav-card-main')
      .should('have.length.at.least', 1)
      .first()
      .find('button.fav-card-overflow')
      .click();

    cy.get(`.${prefix}--overflow-menu-options__option-content`)
      .contains('Highlight shortcut')
      .click();

    // Check if the Seedlots Dashboard card is highlighted
    cy.get('.fav-card-main-highlighted')
      .should('have.length', 1)
      .should('contain.text', 'Seedlots');
  });

  /**
   * Delete a favourite card should remove it from the dashboard and display an empty section.
   */
  it('should delete a card from favourite activities', () => {
    // Delete the first highlighted card
    cy.get('.favourite-activities-cards')
      .find('.fav-card-main-highlighted')
      .should('have.length.at.least', 1)
      .first()
      .find('button.fav-card-overflow')
      .click();

    cy.get(`.${prefix}--overflow-menu-options__option-content`)
      .contains('Delete shortcut')
      .click();

    // Verify no highlighted cards remain
    cy.get('.fav-card-main-highlighted')
      .should('have.length', 0);

    // Verify empty section appears
    cy.get('.favourite-activities-cards')
      .should('exist')
      .within(() => {
        cy.contains('.empty-section-title', dashboardPageData.emptySectionTitle)
          .should('be.visible');
      });
  });
});
