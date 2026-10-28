export type RouteAlias = `@${string}`;

export const waitForAutosave = (alias: RouteAlias) => cy.wait(alias)
  .then(({ response }) => {
    expect(response?.statusCode).to.be.within(200, 299);
  });

export const typeAndWaitForAutosave = (
  selector: string,
  value: string,
  alias: RouteAlias,
  delay?: number
) => {
  const options = delay === undefined ? {} : { delay };
  // Re-query per command: the input re-mounts after each keystroke-driven save.
  cy.get(selector).clear();
  cy.get(selector).type(value, options);
  return waitForAutosave(alias);
};
