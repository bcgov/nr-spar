package ca.bc.gov.backendstartapi.search;

/**
 * Operators a client may use in a {@link Criterion}. Each operator declares how many values it
 * takes, so value-count validation lives in one place.
 */
public enum SearchOperator {
  EQ(1, 1),
  NE(1, 1),
  IN(1, SearchLimits.MAX_IN_VALUES),
  GT(1, 1),
  GTE(1, 1),
  LT(1, 1),
  LTE(1, 1),
  BETWEEN(2, 2),
  /** Case-insensitive "contains". String fields only. */
  CONTAINS(1, 1),
  /** "Starts with"; case-sensitive unless the field is declared case-insensitive. */
  STARTS_WITH(1, 1),
  IS_NULL(0, 0),
  IS_NOT_NULL(0, 0),
  /** At least one child row matches the criterion's {@code where} (or any child row exists). */
  EXISTS(0, 0),
  /** No child row matches the criterion's {@code where} (or no child rows exist). */
  NOT_EXISTS(0, 0);

  private final int minValues;
  private final int maxValues;

  SearchOperator(int minValues, int maxValues) {
    this.minValues = minValues;
    this.maxValues = maxValues;
  }

  public int minValues() {
    return minValues;
  }

  public int maxValues() {
    return maxValues;
  }

  /** Whether this operator only makes sense on text columns. */
  public boolean isTextOnly() {
    return this == CONTAINS || this == STARTS_WITH;
  }

  /** Whether this operator applies to a child collection rather than a field. */
  public boolean isChildOperator() {
    return this == EXISTS || this == NOT_EXISTS;
  }
}
