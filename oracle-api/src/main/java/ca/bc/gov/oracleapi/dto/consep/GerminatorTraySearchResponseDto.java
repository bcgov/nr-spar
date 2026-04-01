package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/**
 * Response row for germinator tray search results.
 */
@Schema(description = "Germinator tray search result")
public record GerminatorTraySearchResponseDto(
    @Schema(description = "Germinator tray ID", example = "1311")
    Integer germinatorTrayId,

    @Schema(description = "Activity type code", example = "G10")
    String activityTypeCd,

    @Schema(description = "Actual start date/time", example = "2025-03-12T00:00:00")
    LocalDateTime actualStartDate,

    @Schema(description = "Date created", example = "2025-03-11T15:26:00")
    LocalDateTime dateCreated,

    @Schema(description = "Revision count", example = "0")
    Long revisionCount,

    @Schema(description = "System tray number", example = "2")
    Integer systemTrayNo,

    @Schema(description = "Germinator ID", example = "4")
    String germinatorId
) {
}
