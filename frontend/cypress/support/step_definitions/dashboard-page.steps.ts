import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { NavigationLabels } from '../../utils/labels';
import prefix from '../../../src/styles/classPrefix';

const favouriteCurrentPage = () => {
  cy.get('.title-favourite')
    .find(`.${prefix}--popover-container`)
    .click();
};

Then('I can see the dashboard page title', () => {
  cy.isPageTitle(NavigationLabels.Dashboard);
});

Then("I can see the dashboard's empty favourite section title", () => {
  cy.fixture('dashboard-page').then((dashboardPageData) => {
    cy.get('.favourite-activities-cards')
      .should('exist')
      .within(() => {
        cy.contains('.empty-section-title', dashboardPageData.emptySectionTitle)
          .should('be.visible');
      });
  });
});

Then("I can see the dashboard's empty favourite section subtitle", () => {
  cy.fixture('dashboard-page').then((dashboardPageData) => {
    cy.get('.favourite-activities-cards')
      .should('exist')
      .within(() => {
        cy.contains('.empty-section-subtitle', dashboardPageData.emptySectionSubtitle)
          .should('be.visible');
      });
  });
});

When('I favourite the current page', () => {
  favouriteCurrentPage();
});

Then('I should see the dashboard favourite card {string}', (cardTitle: string) => {
  cy.get('.favourite-activities-cards')
    .should('exist')
    .within(() => {
      cy.contains('.fav-card-content .fav-card-title-large', cardTitle)
        .should('be.visible');
    });
});

// Navigates to the given card's page and favourites it, then returns to the dashboard.
Given('the dashboard has a favourite card {string}', (cardTitle: string) => {
  cy.navigateTo(cardTitle);
  cy.url().should('contains', '/seedlots');
  favouriteCurrentPage();
  cy.navigateTo(NavigationLabels.Dashboard);
});

When('I highlight the dashboard favourite card {string}', (cardTitle: string) => {
  cy.get('.favourite-activities-cards')
    .contains('.fav-card-main', cardTitle)
    .find('button.fav-card-overflow')
    .click();

  cy.get(`.${prefix}--overflow-menu-options__option-content`)
    .contains('Highlight shortcut')
    .click();
});

Then('the dashboard favourite card {string} should be highlighted', (cardTitle: string) => {
  cy.get('.fav-card-main-highlighted')
    .should('have.length', 1)
    .should('contain.text', cardTitle);
});

When('I delete the dashboard favourite card {string}', (cardTitle: string) => {
  cy.get('.favourite-activities-cards')
    .contains('.fav-card-main-highlighted', cardTitle)
    .find('button.fav-card-overflow')
    .click();

  cy.get(`.${prefix}--overflow-menu-options__option-content`)
    .contains('Delete shortcut')
    .click();
});

Then('I should not see the dashboard favourite card {string}', () => {
  cy.get('.fav-card-main-highlighted').should('have.length', 0);
});
