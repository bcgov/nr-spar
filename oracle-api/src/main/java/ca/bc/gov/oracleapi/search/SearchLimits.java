package ca.bc.gov.oracleapi.search;

/** Guardrails shared by every search endpoint. */
public final class SearchLimits {

  public static final int DEFAULT_PAGE_SIZE = 20;
  public static final int MAX_PAGE_SIZE = 100;
  public static final int MAX_PAGE_NUMBER = 10_000;
  /** Nesting levels, counting both nested groups and child-table {@code where} clauses. */
  public static final int MAX_FILTER_DEPTH = 5;
  /** Total criteria plus nested groups in one filter, child-table {@code where}s included. */
  public static final int MAX_CRITERIA = 50;
  public static final int MAX_SORT_FIELDS = 3;
  /** Oracle rejects IN lists longer than 1000; we apply the same cap everywhere. */
  public static final int MAX_IN_VALUES = 1000;

  private SearchLimits() {}
}
