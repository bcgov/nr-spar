package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * This record serves the purpose of mapping fields the FE should
 * send to the BE, to update a Activity entry.
 */
@Schema(description = "JSON object with the values to be updated in the Activity table")
public record ActivityFormDto(
    @NotNull String testCategoryCode,
    @NotNull LocalDateTime actualBeginDateTime,
    @NotNull LocalDateTime actualEndDateTime,
    String riaComment
) {}
