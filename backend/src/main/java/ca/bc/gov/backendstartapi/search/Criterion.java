package ca.bc.gov.backendstartapi.search;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * A single filter condition, e.g. {@code status IN ["PND", "SUB"]}, or a child-table condition,
 * e.g. {@code orchards EXISTS where orchardId = "405"}.
 */
@Schema(description = "A single filter condition")
public record Criterion(
    @Schema(description = "Searchable field or child collection name", example = "status")
        @NotBlank
        String field,
    @Schema(description = "Comparison operator", example = "IN") @NotNull SearchOperator operator,
    @Schema(
            description =
                "Values for the operator. Dates use ISO-8601 (2026-01-31, 2026-01-31T00:00:00).",
            example = "[\"PND\", \"SUB\"]")
        @Size(max = SearchLimits.MAX_IN_VALUES)
        List<Object> values,
    @Schema(
            description =
                "EXISTS / NOT_EXISTS only: conditions that must all match the same child row."
                    + " Omit to test whether any child row exists.")
        @Valid
        FilterGroup where) {

  /** Convenience constructor for field criteria. */
  public Criterion(String field, SearchOperator operator, List<Object> values) {
    this(field, operator, values, null);
  }
}
