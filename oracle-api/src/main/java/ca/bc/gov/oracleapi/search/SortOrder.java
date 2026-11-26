package ca.bc.gov.oracleapi.search;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Sort;

/** One sort key. */
@Schema(description = "A sort key")
public record SortOrder(
    @Schema(description = "Sortable field name", example = "updatedAt") @NotBlank String field,
    @Schema(description = "ASC or DESC; defaults to ASC") Sort.Direction direction) {}
