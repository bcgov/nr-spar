/**
 * Shared CQL helpers for DataBC GeoServer filters.
 *
 * Every URL-param or user-supplied value that ends up inside a CQL string
 * literal MUST go through `cqlQuoted`. Quote-doubling is the ECQL escape;
 * keep it in one place so a future caller cannot forget it.
 */

/** Double single quotes — the ECQL string-literal escape. */
export const escapeCqlLiteral = (value: string): string => value.replace(/'/g, "''");

/** Quote a value as an ECQL string literal (`'foo''bar'`). */
export const cqlQuoted = (value: string): string => `'${escapeCqlLiteral(value)}'`;

/** Build a quoted IN-list (`'IDF','CWH'`) from string codes. */
export const cqlQuotedInList = (values: string[]): string => values.map(cqlQuoted).join(',');

/**
 * Build a numeric IN-list. Non-integers are dropped so a future caller
 * that forgets to parse cannot open a CQL injection hole. Throws when
 * nothing remains — an empty `IN ()` is a GeoServer syntax error and
 * would hide a programming mistake as a silent no-op overlay.
 */
export const cqlIntegerInList = (values: number[]): string => {
  const ints = values.filter((n) => Number.isInteger(n) && Number.isFinite(n));
  if (ints.length === 0) {
    throw new Error('No valid integer IDs for CQL IN list');
  }
  return ints.join(',');
};

/**
 * Identifiers that are safe to interpolate into CQL as unquoted tokens
 * (column values we also quote, but reject first so a forgotten quote
 * still cannot inject). Covers BEC codes (`IDF`, `IDFmw1`), species
 * (`FDC`), seedlot/veglot numbers, and SPZ codes (`M`).
 */
export const CQL_SAFE_IDENTIFIER = /^[A-Za-z0-9._-]{1,32}$/;

export const isCqlSafeIdentifier = (value: string): boolean => CQL_SAFE_IDENTIFIER.test(value);

/** Keep only identifier-shaped codes; drop blanks and anything with CQL metacharacters. */
export const filterCqlSafeIdentifiers = (values: string[]): string[] => (
  values.map((v) => v.trim()).filter(isCqlSafeIdentifier)
);
