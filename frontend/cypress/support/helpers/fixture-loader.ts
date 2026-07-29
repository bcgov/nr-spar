export const loadFixtureAndAlias = <T>(
  fixtureName: string,
  alias: string,
  assign?: (data: T) => void
) => cy.fixture(fixtureName).then((data: T) => {
  if (assign) assign(data);
  return cy.wrap(data).as(alias);
});
