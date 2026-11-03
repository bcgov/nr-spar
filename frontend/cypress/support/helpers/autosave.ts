import type { Interception } from 'cypress/types/net-stubbing';

export type RouteAlias = `@${string}`;

export type SavedRequest = { body: unknown; url: string };

type RequestMatcher = (request: SavedRequest) => boolean;

const MAX_REQUESTS_TO_SCAN = 500;

// cy.wait consumes requests in order, so skip saves of partial input until `matches` is true.
export const waitForAutosave = (
  alias: RouteAlias,
  matches: RequestMatcher,
  remaining = MAX_REQUESTS_TO_SCAN
): Cypress.Chainable<Interception> => cy.wait(alias).then((interception) => {
  if (matches(interception.request)) {
    expect(interception.response?.statusCode).to.be.within(200, 299);
    return cy.wrap(interception);
  }
  expect(remaining, `no ${alias} request matched the expected payload`).to.be.greaterThan(1);
  return waitForAutosave(alias, matches, remaining - 1);
});

export const typeAndWaitForAutosave = (
  selector: string,
  value: string,
  alias: RouteAlias,
  matches: RequestMatcher,
  delay?: number
) => {
  const options = delay === undefined ? {} : { delay };
  // Re-query per command: the input re-mounts after each keystroke-driven save.
  cy.get(selector).clear();
  cy.get(selector).type(value, options);
  return waitForAutosave(alias, matches);
};
