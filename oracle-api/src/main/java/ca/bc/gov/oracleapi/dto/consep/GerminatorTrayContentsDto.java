package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/** A DTO containing the fields for the contents of tests in germinator tray from consep. */
public record GerminatorTrayContentsDto(
    @Schema(description = "Germinator tray id", example = "1311")
    Integer germinatorTrayId,

    @Schema(description = "Request ID of the test result entry", example = "RTS20042360")
    String requestId,

    @Schema(description = "Seedlot number", example = "30350")
    String seedlotNumber,

    LocalDateTime warmStratStartDate,

    LocalDateTime drybackStartDate,

    LocalDateTime germinatorEntry,

    LocalDateTime stratStartDate,

    @Schema(description = "Test complete indicator", example = "0")
    Integer testCompleteInd,

    @Schema(description = "Accept result indicator", example = "0")
    Integer acceptResultInd,

    @Schema(description = "Timestamp for the last update", example = "2025-01-20T12:00:00")
    LocalDateTime updateTimestamp
) {
}
