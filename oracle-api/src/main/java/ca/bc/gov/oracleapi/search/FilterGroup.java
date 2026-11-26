package ca.bc.gov.oracleapi.search;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * A group of criteria and nested groups combined with a single logic operator. Nesting allows
 * expressions such as {@code status = PND AND (species = SX OR species = PLI)}.
 */
@Schema(description = "Criteria and nested groups combined with AND or OR")
public record FilterGroup(
    @Schema(description = "How the parts are combined; defaults to AND") Logic logic,
    @Size(max = SearchLimits.MAX_CRITERIA) List<@Valid Criterion> criteria,
    @Size(max = SearchLimits.MAX_CRITERIA) List<@Valid FilterGroup> groups) {

  /** Logical operator for combining a group's parts. */
  public enum Logic {
    AND,
    OR
  }

  public Logic logicOrDefault() {
    return logic == null ? Logic.AND : logic;
  }
}
