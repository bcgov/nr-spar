package ca.bc.gov.oracleapi.dto.consep;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * This record serves the purpose of mapping fields the FE should
 * send to the BE, to update a Activity entry.
 */
@Schema(description = "JSON object with the values to be updated in the Activity table")
public record ActivityFormDto(
    // Shape only: auto save sends partial records, so missing dates and category are
    // allowed here and enforced by validate/accept (ActivityService.validateActivityData).
    String testCategoryCode,
    LocalDateTime actualBeginDateTime,
    LocalDateTime actualEndDateTime,
    @Size(max = 2000) String riaComment,
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "The update_timestamp the client read; used for optimistic locking",
        example = "2025-01-18T16:00:00")
    @NotNull LocalDateTime updateTimestamp
) {}
