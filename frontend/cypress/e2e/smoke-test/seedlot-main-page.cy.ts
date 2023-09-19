import { NavigationLabels } from '../../utils/labels';

describe('Seedlot Main page test', () => {
  let seedlotMainPageData: {
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
    cy.fixture('seedlot-main-page').then((fData) => {
      seedlotMainPageData = fData;
    });
  });

  it('seedlot main page is displayed and loads correctly', () => {
    // SPAR log in
    cy.login();

    cy.wait(10 * 1000); // login is lagging, remove this in the future

    cy.isPageTitle(NavigationLabels.Dashboard);

    cy.navigateTo(NavigationLabels.Seedlots);

    cy.isPageTitle(NavigationLabels.Seedlots);
    cy.get('.title-section')
      .find('.subtitle-section')
      .should('have.text', seedlotMainPageData.subtitle);
    cy.get('.recent-seedlots-title')
      .find('h2')
      .should('have.text', seedlotMainPageData.secondSectionTitle);
    cy.get('.recent-seedlots-title')
      .find('.recent-seedlots-subtitle')
      .should('have.text', seedlotMainPageData.secondSectionSubtitle);
  });
});
