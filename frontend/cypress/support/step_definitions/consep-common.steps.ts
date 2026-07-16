import { Then, DataTable } from '@badeball/cypress-cucumber-preprocessor';

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

Then('the activity results table should show these columns:', (dataTable: DataTable) => {
  const expectedColumns = dataTable.raw().flat().filter(Boolean);

  cy.get('.activity-result-container thead th')
    .then(($headers) => {
      const headerTexts = [...$headers].map((header) => normalize(header.textContent || ''));

      expectedColumns.forEach((columnName: string) => {
        const expected = normalize(columnName);

        const matches = headerTexts.some((headerText) => headerText === expected || headerText.includes(expected) || expected.includes(headerText));

        assert.isTrue(
          matches,
          `Missing activity results column: ${columnName}. Found: ${headerTexts.join(' | ')}`
        );
      });
    });
});

Then('the activity summary should match the seedlot replicate info', () => {
  cy.get('@seedlotData').then((seedlotData: any) => {
    cy.get('.activity-summary')
      .find('.activity-summary-info-value')
      .eq(0)
      .should('have.text', seedlotData.activityType);

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
      .should(($el) => {
        const displayedValue = ($el.text() || '').trim();
        const expectedValue = seedlotData.moisturePct == null
          ? ''
          : Number(seedlotData.moisturePct).toFixed(1);

        expect(displayedValue).to.eq(expectedValue);
      });
  });
});
