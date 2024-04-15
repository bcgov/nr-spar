import { NavigationLabels } from '../../utils/labels';
// import prefix from '../../../src/styles/classPrefix';

describe('Seedlot Dashboard test', () => {
  let seedlotDashboardData: {
    subtitle: string,
    secondSectionTitle: string,
    secondSectionSubtitle: string,
    emptySectionTitle: string,
    emptySectionSubtitle: string
  };

  beforeEach(() => {
    // Loading test data
    cy.fixture('seedlot-dashboard').then((fData) => {
      seedlotDashboardData = fData;
    });

    cy.login();
    cy.visit('/seedlots');
    cy.url().should('contains', '/seedlots');
  });

  it('should display seedlot dashboard page title and subtitle', () => {
    cy.isPageTitle(NavigationLabels.Seedlots);
    cy.get('.title-section')
      .find('.subtitle-section')
      .should('have.text', seedlotDashboardData.subtitle);
    cy.get('.recent-seedlots-title')
      .find('h2')
      .should('have.text', seedlotDashboardData.secondSectionTitle);
    cy.get('.recent-seedlots-title')
      .find('.recent-seedlots-subtitle')
      .should('have.text', seedlotDashboardData.secondSectionSubtitle);
  });

  it('should display empty seedlot section', () => {
    cy.isPageTitle(NavigationLabels.Seedlots);
    cy.get('.empty-recent-seedlots')
      .find('p.empty-section-title')
      .should('have.text', seedlotDashboardData.emptySectionTitle);
    cy.get('.empty-recent-seedlots')
      .find('.empty-section-subtitle')
      .should('have.text', seedlotDashboardData.emptySectionSubtitle);
  });

  // it('should Check if 4 seedlots are being rendered at the bottom', () => {
  //   cy.get(`table.${prefix}--data-table`)
  //     .should('be.visible');

  //   cy.get(`table.${prefix}--data-table tbody tr`)
  //     .eq(0)
  //     .find('td')
  //     .first()
  //     .should('have.text', '63001');

  //   cy.get(`table.${prefix}--data-table tbody tr`)
  //     .eq(1)
  //     .find('td')
  //     .first()
  //     .should('have.text', '63032');

  //   cy.get(`table.${prefix}--data-table tbody tr`)
  //     .eq(2)
  //     .find('td')
  //     .first()
  //     .should('have.text', '63002');

  //   cy.get(`table.${prefix}--data-table tbody tr`)
  //     .eq(3)
  //     .find('td')
  //     .first()
  //     .should('have.text', '63012');
  // });
});
