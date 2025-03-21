package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;

/**
 * This record serves the purpose of mapping fields the FE should
 * send to the BE, to update a Activity entry.
 */
@Schema(description = "JSON object with the values to be updated in the Activity table")
public record ActivityFormDto(
    @NotNull String testCategoryCode,
    @NotNull String riaComment,
    @NotNull LocalDateTime actualBeginDateTime,
    @NotNull LocalDateTime actualEndDateTime
) {}
