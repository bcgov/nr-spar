import { NavigationLabels } from '../../utils/labels';

describe('Dashboard page test', () => {
  let dashboardPageData: {
    subtitle: string,
    secondSectionTitle: string,
    secondSectionSubtitle: string,
  };

  beforeEach(() => {
    cy.visit('/');
    cy.wait(2 * 1000);

    // Clear cookies and local storage
    cy.clearCookies({ log: true });
    cy.clearLocalStorage({ log: true });

    // Loading test data
    cy.fixture('dashboard-page').then((fData) => {
      dashboardPageData = fData;
    });
  });

  it('dashboard page is displayed and loads correctly', () => {
    // SPAR log in
    cy.login();

    cy.wait(10 * 1000); // login is lagging, remove this in the future

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
});
