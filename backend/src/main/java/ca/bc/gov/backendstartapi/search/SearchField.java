package ca.bc.gov.backendstartapi.search;

import java.util.Set;

/**
 * A field a client is allowed to filter and/or sort on. Declared through {@link
 * SearchSchema.Builder}; anything not declared cannot be queried.
 *
 * @param apiName name clients use in requests, e.g. {@code "updatedAt"}
 * @param entityPath JPA attribute path, dot-separated, e.g. {@code
 *     "auditInformation.updateTimestamp"}
 * @param javaType Java type values are converted to; decided by the server, never the client
 * @param sortable whether clients may sort by this field
 * @param operators operators allowed on this field
 * @param ignoreCase whether EQ, NE, IN and STARTS_WITH compare text case-insensitively
 */
public record SearchField(
    String apiName,
    String entityPath,
    Class<?> javaType,
    boolean sortable,
    Set<SearchOperator> operators,
    boolean ignoreCase) {

  /** Copies the operator set so the record stays immutable. */
  public SearchField {
    operators = Set.copyOf(operators);
  }

  /** Returns a copy that compares text case-insensitively. */
  public SearchField withIgnoreCase() {
    return new SearchField(apiName, entityPath, javaType, sortable, operators, true);
  }
}
