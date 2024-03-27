import { NavigationLabels } from '../../utils/labels';
import prefix from '../../../src/styles/classPrefix';

describe('Seedlot Main page test', () => {
  let seedlotMainPageData: {
    subtitle: string,
    secondSectionTitle: string,
    secondSectionSubtitle: string,
  };

  beforeEach(() => {
    // Loading test data
    cy.fixture('seedlot-main-page').then((fData) => {
      seedlotMainPageData = fData;
    });

    cy.login();
    cy.visit('/seedlots');
    cy.url().should('contains', '/seedlots');
  });

  it('should load and display seedlot main page correctly', () => {
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

  it('should Check if 4 seedlots are being rendered at the bottom', () => {
    cy.get(`table.${prefix}--data-table`)
      .should('be.visible');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(0)
      .find('td')
      .first()
      .should('have.text', '63001');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(1)
      .find('td')
      .first()
      .should('have.text', '63032');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(2)
      .find('td')
      .first()
      .should('have.text', '63002');

    cy.get(`table.${prefix}--data-table tbody tr`)
      .eq(3)
      .find('td')
      .first()
      .should('have.text', '63012');
  });
});
