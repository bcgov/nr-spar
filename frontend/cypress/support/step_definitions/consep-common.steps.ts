import { Then } from '@badeball/cypress-cucumber-preprocessor';
import { DataTable } from '@badeball/cypress-cucumber-preprocessor';

Then('the activity results table should show these columns:', (dataTable: DataTable) => {
  const expectedColumns = dataTable.raw().flat().filter(Boolean);

  cy.get('.activity-result-container thead tr')
    .find('th')
    .then(($headers) => {
      const headerTexts = [...$headers].map((header) => (header.textContent || '').replace(/\s+/g, ' ').trim());

      expectedColumns.forEach((columnName: string) => {
        expect(
          headerTexts,
          `Missing activity results column: ${columnName}`
        ).to.include(columnName);
      });
    });
});
