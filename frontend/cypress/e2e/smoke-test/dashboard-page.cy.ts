import { HALF_SECOND } from '../../constants';
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

  it('dashboard page is displayed and loads correctly', () => {
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

  it('favourite activity is working properly', () => {
    // Navigate to Seedlot page
    cy.navigateTo(NavigationLabels.Seedlots);
    cy.wait(HALF_SECOND);
    // Favourite Seedlot page
    cy.get('.title-favourite')
      .find(`.${prefix}--popover-container`)
      .click();
    cy.wait(HALF_SECOND);
    // Navigate to Dashboard page
    cy.navigateTo(NavigationLabels.Dashboard);
    cy.wait(HALF_SECOND);
    // Check if seedlot card is appearing at favourites activities
    cy.get('.favourite-activities-cards')
      .find('.fav-card-content')
      .find('.fav-card-title-large')
      .contains('Seedlots')
      .wait(HALF_SECOND)
      .click();
    cy.isPageTitle(NavigationLabels.Seedlots);

    // Favourite A class Seedlot page
    cy.get('.seedlot-activities-cards')
      .find('.std-card-title')
      .contains('Register an A class seedlot')
      .click();
    cy.get('.title-favourite')
      .find(`.${prefix}--popover-container`)
      .click();
    cy.wait(HALF_SECOND);

    // Navigate to Dashboard page
    cy.navigateTo(NavigationLabels.Dashboard);
    cy.wait(HALF_SECOND);

    // Check if Create A Class Seedlot card is appearing at favourites activities
    cy.get('.favourite-activities-cards')
      .find('.fav-card-content')
      .find('.fav-card-title-large')
      .contains('Create A class seedlot')
      .wait(HALF_SECOND)
      .click();

    cy.isPageTitle('Create A class seedlot');

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
    cy.wait(HALF_SECOND);

    // Navigate to Dashboard page
    cy.navigateTo(NavigationLabels.Dashboard);
    cy.wait(HALF_SECOND);

    // Check if My Seedlot card is appearing at favourites activities
    // and if redirects to the correct page
    cy.get('.favourite-activities-cards')
      .find('.fav-card-content')
      .find('.fav-card-title-large')
      .contains('My Seedlots')
      .wait(HALF_SECOND)
      .click();

    cy.isPageTitle('My Seedlots');
  });

  it('highlight favourite activity is working', () => {
  // Highlight Seedlots Card
    cy.get('.favourite-activities-cards')
      .find('.fav-card-main:first')
      .find('.fav-card-overflow')
      .click();
    cy.get(`.${prefix}--overflow-menu-options__option-content:first`)
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
    cy.get(`.${prefix}--overflow-menu-options__option-content:first`)
      .click();

    // Check if the Create A Class Seedlot card is unique and highlighted
    cy.get('.fav-card-main-highlighted')
      .should('have.length', 1)
      .should('contain.text', 'Create A class seedlot');
  });

  it('check if delete favourite activities is working', () => {
    // Delete Seedlots card
    cy.get('.favourite-activities-cards')
      .find('.fav-card-main:first')
      .find('.fav-card-overflow')
      .click();
    cy.get(`.${prefix}--overflow-menu-options__option-content:last`)
      .click();

    // Delete Create A Class Seedlot card
    cy.get('.fav-card-main-highlighted')
      .find('.fav-card-overflow')
      .click();
    cy.get(`.${prefix}--overflow-menu-options__option-content:last`)
      .click();

    // Delete Last card
    cy.get('.favourite-activities-cards')
      .find('.fav-card-main:first')
      .find('.fav-card-overflow')
      .click();
    cy.get(`.${prefix}--overflow-menu-options__option-content:last`)
      .click();

    // Check if the empty section is correctly appearing
    cy.get('.empty-section-title')
      .should('contain.text', "You don't have any favourites to show yet!");
  });
});
