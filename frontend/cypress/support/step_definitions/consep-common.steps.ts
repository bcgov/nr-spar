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
