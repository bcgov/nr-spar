import { NavigationLabels } from '../../utils/labels';
import prefix from '../../../src/styles/classPrefix';

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

  it('should Check if 5 seedlots are being rendered at the bottom', () => {
    cy.get(`table.${prefix}--data-table`)
      .should('be.visible');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(0)
      .as('firstRow');

    cy.get('@firstRow')
      .find('td:nth-child(3)')
      .should('have.text', 'FDC - Coastal Douglas-fir');

    cy.get('@firstRow')
      .find('td:nth-child(4)')
      .children()
      .should('have.text', 'Pending');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(1)
      .as('secondRow');

    cy.get('@secondRow')
      .find('td:nth-child(3)')
      .should('have.text', 'EP - Paper birch');

    cy.get('@secondRow')
      .find('td:nth-child(4)')
      .children()
      .should('have.text', 'Pending');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(2)
      .as('thirdRow');

    cy.get('@thirdRow')
      .find('td:nth-child(3)')
      .should('have.text', 'DR - Red alder');

    cy.get('@thirdRow')
      .find('td:nth-child(4)')
      .children()
      .should('have.text', 'Pending');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(3)
      .as('fourthRow');

    cy.get('@fourthRow')
      .find('td:nth-child(3)')
      .should('have.text', 'CW - Western redcedar');

    cy.get('@fourthRow')
      .find('td:nth-child(4)')
      .children()
      .should('have.text', 'Pending');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(4)
      .as('fifthRow');

    cy.get('@fifthRow')
      .find('td:nth-child(3)')
      .should('have.text', 'PLI - Lodgepole pine');

    cy.get('@fifthRow')
      .find('td:nth-child(4)')
      .children()
      .should('have.text', 'Pending');
  });
});
