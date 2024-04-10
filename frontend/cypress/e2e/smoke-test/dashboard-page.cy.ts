/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { NavigationLabels } from '../../utils/labels';
import prefix from '../../../src/styles/classPrefix';

describe('Dashboard page test', () => {
  let dashboardPageData: {
    subtitle: string,
    secondSectionTitle: string,
    secondSectionSubtitle: string,
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
  });

  /**
   * Dashboard page should load correctly.
   */
  it('should load and display dashboard page correctly', () => {
    cy.isPageTitle(NavigationLabels.Dashboard);

    cy.get('.title-section')
      .find('.subtitle-section')
      .should('have.text', dashboardPageData.subtitle);

    cy.get('.recent-activity-title-row')
      .find('h2')
      .should('have.text', dashboardPageData.secondSectionTitle);

    cy.get('.recent-activity-title-row')
      .find('.recent-activity-subtitle')
      .should('have.text', dashboardPageData.secondSectionSubtitle);
  });

  it('should load and display dashboard page correctly', () => {
    cy.isPageTitle(NavigationLabels.Dashboard);

    cy.get('.favourite-activities-cards')
      .find('.empty-section-title')
      .contains(dashboardPageData.emptySectionTitle);

    cy.get('.favourite-activities-cards')
      .find('.empty-section-subtitle')
      .contains(dashboardPageData.emptySectionSubtitle);
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

    // Navigate to Dashboard page
    cy.navigateTo(NavigationLabels.Dashboard);

    // Check if seedlot card is appearing at favourites activities
    cy.get('.favourite-activities-cards')
      .find('.fav-card-content')
      .find('.fav-card-title-large')
      .contains('Seedlots')
      .click();

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
    // Delete the first card
    cy.get('.favourite-activities-cards')
      .find('.fav-card-main-highlighted')
      .first()
      .find('button.fav-card-overflow')
      .click();

    cy.get(`.${prefix}--overflow-menu-options__option-content`)
      .contains('Delete shortcut')
      .click();

    cy.get('.fav-card-main-highlighted')
      .should('have.length', 0);

    cy.get('.favourite-activities-cards')
      .find('.empty-section-title')
      .should('have.text', dashboardPageData.emptySectionTitle);
  });
});
