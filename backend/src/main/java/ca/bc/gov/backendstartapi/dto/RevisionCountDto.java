package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/** An object containing the revision count of a record. */
@Schema(description = "An object containing the revision count of a record.")
public record RevisionCountDto(@NotNull Integer revisionCount) {}
