package ca.bc.gov.oracleapi.dto.consep;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * This class represents a data object for the moisture content cone.
 */
@Schema(description = "This class represents a moisture content cone object.")
public record MoistureContentConesDto(
    // Begin - Result fields
    @Schema(description = "Indicator if the test is complete", example = "1")
    Integer testCompleteInd,

    @Schema(description = "Description of the sample", example = "Sample A")
    String sampleDesc,

    @Schema(description = "Code for the moisture status", example = "MOI")
    String moistureStatus,

    @Schema(description = "Moisture percentage", example = "12.3")
    BigDecimal moisturePct,

    @Schema(description = "Indicator if the result is accepted", example = "1")
    Integer acceptResult,
    // End - Result fields

    // Begin - Activity fields
    @Schema(description = "The test request identifier", example = "CSP20240013")
    String requestId,

    @Schema(description = "The respective seedlot this test is related to", example = "64132")
    String seedlotNumber,

    @Schema(description = "A code that identifies the type of the activity", example = "MC")
    String activityType,

    @Schema(description = "Test category code", example = "TST")
    String testCategoryCode,

    @Schema(description = "Comments for the activity", example = "Activity completed successfully")
    String riaComment,

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Actual begin date of the activity", example = "2025-01-05T08:00:00")
    LocalDateTime actualBeginDateTime,

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Actual end date of the activity", example = "2025-01-18T16:00:00")
    LocalDateTime actualEndDateTime,
    // End - Activity fields

    // Replicates fields
    @Schema(description = "Replicates information")
    List<MccReplicateDto> replicatesList) {
}
