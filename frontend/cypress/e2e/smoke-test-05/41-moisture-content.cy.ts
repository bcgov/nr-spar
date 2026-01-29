import { TYPE_DELAY } from '../../constants';
import { mockMoistureContentApi } from '../../support/mockApiConsep';
import { MoistureContentType, SeedlotReplicateInfoType } from '../../definitions';

describe('Moisture Content Screen page', () => {
  let mcData: MoistureContentType;
  let seedlotData: SeedlotReplicateInfoType;
  beforeEach(() => {
    cy.fixture('moisture-content').then((jsonData) => {
      mcData = jsonData;
    });
    cy.fixture('seedlot-replicate-info').then((jsonData) => {
      seedlotData = jsonData;
    });
    mockMoistureContentApi();
    cy.login();
    cy.visit('/consep/manual-moisture-content/514330');
    cy.url().should('contains', '/consep/manual-moisture-content/514330');
  });

  it('should load and display manual moisture content page correctly', () => {
    // Check if the page title is displayed correctly
    cy.get('.consep-moisture-content-title')
      .find('h1')
      .contains(mcData.mc.title);

    // Check if the table title is displayed correctly
    cy.get('.activity-result-actions-title')
      .find('h3')
      .contains(mcData.table.title);
  });

  it('should display breadcrumbs correctly', () => {
    cy.get('.consep-moisture-content-breadcrumb')
      .find('li')
      .should('have.length', 3)
      .and('contain', 'CONSEP')
      .and('contain', 'Testing activities search')
      .and('contain', 'Testing list');
  });

  it('should display Activity summary section correctly', () => {
    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(0)
      .should('have.text', seedlotData.replicatesList[0].riaKey);

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(1)
      .should('have.text', seedlotData.seedlotNumber);

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(2)
      .should('have.text', seedlotData.requestId);

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(3)
      .should('have.text', `${seedlotData.vegetationCode} | ${seedlotData.geneticClassCode}`);

    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(4)
      .should('have.text', seedlotData.moisturePct);
  });

  it('Check Comment box', () => {
    // Check if the comment input exists
    cy.get('#moisture-content-comments').should('be.visible');

    // Type a comment
    cy.get('#moisture-content-comments')
      .clear()
      .type(mcData.mc.testComment, { delay: TYPE_DELAY })
      .blur()
      .should('have.value', mcData.mc.testComment);
  });
});
