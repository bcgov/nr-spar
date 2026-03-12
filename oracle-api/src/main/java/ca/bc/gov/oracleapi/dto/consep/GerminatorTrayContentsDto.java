package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** A DTO containing the fields for the contents of tests in germinator tray from consep. */
public record GerminatorTrayContentsDto(
    @Schema(description = "Germinator tray id", example = "1311")
    Integer germinatorTrayId,

    @Schema(description = "Vegetation code", example = "PLI")
    String vegetationSt,

    @Schema(description = "Activity type code", example = "G20")
    String activityTypeCd,

    @Schema(
        description = "Actual start date/time of the test",
        example = "2026-03-12T10:30:00",
        type = "string",
        format = "date-time"
    )
    LocalDateTime actualStartDate,

    @Schema(
        description = "Record creation date/time",
        example = "2026-03-12T10:30:00",
        type = "string",
        format = "date-time"
    )
    LocalDateTime dateCreated,

    @Schema(description = "RIA Key of the test result entry", example = "123")
    BigDecimal riaSkey,

    @Schema(description = "Request ID of the test result entry", example = "RTS20042360")
    String requestId,

    @Schema(description = "Request SKey for the test result", example = "456")
    Long requestSkey,

    @Schema(description = "Item ID of the test result entry", example = "A")
    String itemId,

    @Schema(description = "Request type of the test result entry", example = "RTS")
    String requestTypeSt,

    @Schema(description = "Seedlot number", example = "30350")
    String seedlotNumber,

    LocalDateTime soakStartDate,

    LocalDateTime soakEndDate,

    LocalDateTime seedWithdrawDate,

    LocalDateTime warmStratStartDate,

    LocalDateTime drybackStartDate,

    LocalDateTime germinatorEntry,

    LocalDateTime stratStartDate,

    @Schema(description = "Germinator ID", example = "1")
    String germinatorId,

    @Schema(description = "Standard activity ID", example = "G10")
    String standardActivityId,

    @Schema(description = "Test category code", example = "STD")
    String testCategoryCd
) {
}
