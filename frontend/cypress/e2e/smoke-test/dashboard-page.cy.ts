import { NavigationLabels } from '../../utils/labels';
import prefix from '../../../src/styles/classPrefix';

describe('Dashboard page test', () => {
  let dashboardPageData: {
    subtitle: string,
    secondSectionTitle: string,
    secondSectionSubtitle: string,
  };

  beforeEach(() => {
    // Loading test data
    cy.fixture('dashboard-page').then((fData) => {
      dashboardPageData = fData;
    });
    cy.login();
    cy.visit('/');
    cy.url().should('contains', '/dashboard');
  });

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

  it('should be able to favourite the seedlots page', () => {
    // Navigate to Seedlot page
    cy.navigateTo(NavigationLabels.Seedlots);
    // Favourite Seedlot page
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

  it('should be able to favourite the a class seedlot page', () => {
    // Navigate to Seedlot page
    cy.navigateTo(NavigationLabels.Seedlots);

    // Favourite A class Seedlot page
    cy.get('.seedlot-activities-cards')
      .find('.std-card-title')
      .contains('Register an A class seedlot')
      .click();
    cy.get('.title-favourite')
      .find(`.${prefix}--popover-container`)
      .click();

    // Navigate to Dashboard page
    cy.navigateTo(NavigationLabels.Dashboard);

    // Check if Create A Class Seedlot card is appearing at favourites activities
    cy.get('.favourite-activities-cards')
      .find('.fav-card-content')
      .find('.fav-card-title-large')
      .contains('Create A class seedlot')
      .click();

    cy.isPageTitle('Create A class seedlot');
  });

  it('should be able to favourite my seedlot page', () => {
    // Navigate to My seedlot page
    cy.navigateTo(NavigationLabels.Seedlots);
    cy.get('.seedlot-activities-cards')
      .find('.std-card-title')
      .contains('My seedlots')
      .click();

    // Favourite My Seedlot page
    cy.get('.title-favourite')
      .find(`.${prefix}--popover-container`)
      .click();

    // Navigate to Dashboard page
    cy.navigateTo(NavigationLabels.Dashboard);

    // Check if My Seedlot card is appearing at favourites activities
    // and if redirects to the correct page
    cy.get('.favourite-activities-cards')
      .find('.fav-card-content')
      .find('.fav-card-title-large')
      .contains('My Seedlots')
      .click();

    cy.isPageTitle('My Seedlots');
  });

  it('should be able to highlight favourite cards at dashboard', () => {
  // Highlight Seedlots Card
    cy.get('.favourite-activities-cards')
      .find('.fav-card-main:first')
      .find('.fav-card-overflow')
      .click();
    cy.get(`.${prefix}--overflow-menu-options__option-content`)
      .contains('Highlight shortcut')
      .click();

    // Check if the Seedlots card is unique and highlighted
    cy.get('.fav-card-main-highlighted')
      .should('have.length', 1)
      .should('contain.text', 'Seedlots');

    // Highlight Create A Class Seedlot card
    cy.get('.favourite-activities-cards')
      .find('.fav-card-main:first')
      .find('.fav-card-overflow')
      .click();
    cy.get(`.${prefix}--overflow-menu-options__option-content`)
      .contains('Highlight shortcut')
      .click();

    // Check if the Create A Class Seedlot card is unique and highlighted
    cy.get('.fav-card-main-highlighted')
      .should('have.length', 1)
      .should('contain.text', 'Create A class seedlot');
  });

  it('should delete my seedlots card from favourite activities', () => {
    // Delete My Seedlots card
    cy.get('.favourite-activities-cards')
      .find('.fav-card-main:first')
      .find('.fav-card-overflow')
      .click();
    cy.get(`.${prefix}--overflow-menu-options__option-content`)
      .contains('Delete shortcut')
      .click();
    cy.get('.fav-card-main')
      .should('have.length', 1);
  });

  it('should delete a class seedlot card from favourite activities', () => {
    // Delete Create A Class Seedlot card
    cy.get('.fav-card-main-highlighted')
      .find('.fav-card-overflow')
      .click();
    cy.get(`.${prefix}--overflow-menu-options__option-content`)
      .contains('Delete shortcut')
      .click();
    cy.get('.fav-card-main-highlighted')
      .should('have.length', 0);
  });

  it('should delete seedlots card from favourite activities', () => {
    // Delete Seedlots card
    cy.get('.favourite-activities-cards')
      .find('.fav-card-main:first')
      .find('.fav-card-overflow')
      .click();
    cy.get(`.${prefix}--overflow-menu-options__option-content`)
      .contains('Delete shortcut')
      .click();
    cy.get('.fav-card-main')
      .should('have.length', 0);
  });

  it('should display empty section', () => {
    cy.get('.empty-section-title')
      .should('contain.text', "You don't have any favourites to show yet!");
  });
});
