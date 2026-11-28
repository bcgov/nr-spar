package ca.bc.gov.oracleapi.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/** Body of the 409 returned when an update lost an optimistic-lock race. */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Edit conflict: the record was changed by another user since it was read")
public record EditConflictResponse(
    @Schema(description = "Always EDIT_CONFLICT", example = "EDIT_CONFLICT")
    String code,
    @Schema(description = "Human-readable reason")
    String errorMessage,
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    @Schema(description = "The record's current update timestamp, when known")
    LocalDateTime currentUpdateTimestamp) {}
