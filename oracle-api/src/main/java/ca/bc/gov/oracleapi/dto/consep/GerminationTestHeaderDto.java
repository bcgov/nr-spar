package ca.bc.gov.oracleapi.dto.consep;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for germination test header and activity metadata by RIA_SKEY.
 */
@Schema(description = "Germination test header and activity metadata for a specific ria_skey")
public record GerminationTestHeaderDto(

    @Schema(description = "Request item activity key", example = "1234567890")
    BigDecimal riaSkey,

    @Schema(description = "Activity type code", example = "G64")
    String activityTypeCd,

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Actual begin datetime", example = "2026-04-15T08:30:00")
    LocalDateTime actualBeginDtTm,

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Actual end datetime", example = "2026-04-18T16:00:00")
    LocalDateTime actualEndDtTm,

    @Schema(description = "Test category code", example = "TST")
    String testCategoryCd,

    @Schema(description = "Moisture status code", example = "MOI")
    String moistureStatusCd,

    @Schema(description = "Sample description", example = "Primary sample")
    String sampleDesc,

    @Schema(description = "Accepted result indicator", example = "1")
    Integer acceptResultInd,

    @Schema(description = "Test complete indicator", example = "1")
    Integer testCompleteInd,

    @Schema(description = "Activity comment")
    String riaComment,

    @Schema(description = "Standard test indicator", example = "1")
    Integer standardTestInd,

    @Schema(description = "Test rank", example = "A")
    String testRank,

    @Schema(description = "Germination percentage", example = "95")
    Integer germinationPct,

    @Schema(description = "Germination value", example = "90")
    Integer germinationValue,

    @Schema(description = "Peak value germination percent", example = "88")
    Integer peakValueGrmPct,

    @Schema(description = "Peak value number of days", example = "14")
    Integer peakValueNoDays,

    @Schema(description = "Seed withdrawal date", example = "2026-04-10")
    LocalDate seedWithdrawalDate,

    @Schema(description = "Revised start date", example = "2026-04-01")
    LocalDate revisedStartDt,

    @Schema(description = "Revised end date", example = "2026-04-20")
    LocalDate revisedEndDt,

    @Schema(description = "Activity duration", example = "72")
    Integer activityDuration,

    @Schema(description = "Activity time unit status", example = "HRS")
    String actvtyTmUnitSt,

    @Schema(description = "Stratification start date", example = "2026-03-20")
    LocalDate stratStartDt,

    @Schema(description = "Dryback start date", example = "2026-03-25")
    LocalDate drybackStartDate,

    @Schema(description = "Warm stratification start date", example = "2026-03-22")
    LocalDate warmStratStartDate,

    @Schema(description = "Germinator entry date", example = "2026-03-30")
    LocalDate germinatorEntry,

    @Schema(description = "Germinator tray id", example = "101")
    Integer germinatorTrayId,

    @Schema(description = "Germinator id", example = "A")
    String germinatorId,

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Computed soak end datetime (actual_begin_dt_tm + soak_hours/24)", example = "2026-04-15T20:30:00")
    LocalDateTime soakEndDate,

    @Schema(description = "Imbibed weight", example = "12.345")
    BigDecimal imbibedWt,

    @Schema(description = "Dry weight", example = "10.220")
    BigDecimal dryWeight,

    @Schema(description = "Dryback weight", example = "9.880")
    BigDecimal drybackWeight,

    @Schema(description = "Intermediate cleaner indicator", example = "0")
    Integer intrmdtCleanrInd,

    @Schema(description = "Request type status", example = "TSC")
    String requestTypeSt
) {
}
