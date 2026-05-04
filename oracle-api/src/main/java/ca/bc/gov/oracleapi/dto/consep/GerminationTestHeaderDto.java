package ca.bc.gov.oracleapi.dto.consep;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for germination test header and activity metadata by RIA_SKEY.
 */
@Schema(description = "Germination test header and activity metadata for a specific ria_skey")
public record GerminationTestHeaderDto(

    @Schema(description = "Primary key of the activity", example = "7338")
    @NotNull
    BigDecimal riaSkey,

    @Schema(description = "A code which represents the type of Result which will be, or has been recorded against a particular Activity for a Request", example = "MC")
    String activityTypeCd,

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Actual begin datetime", example = "2026-04-15T08:30:00")
    LocalDateTime actualBeginDtTm,

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Actual end datetime", example = "2026-04-18T16:00:00")
    LocalDateTime actualEndDtTm,

    @Schema(description = "A code which represents the category of test being performed. Note: Only Standard type tests will be reported to SPAR users", example = "QA")
    String testCategoryCd,

    @Schema(description = "A code which represents the moisture content status of the sample being tested", example = "MOI")
    String moistureStatusCd,

    @Schema(description = "A free format description which describes where the sample was taken", example = "Primary sample")
    String sampleDesc,

    @Schema(description = "An indicator which represents whether or not the test result is Accepted", example = "0")
    Integer acceptResultInd,

    @Schema(description = "An indicator which represents whether or not the test result is considered completed", example = "0")
    Integer testCompleteInd,

    @Schema(description = "A free format comment related to an activity performed against a Request Item", example = "unkilned portion only")
    String riaComment,

    @Schema(description = "An indicator which represents whether or not the test result is considered Standard", example = "-1")
    Integer standardTestInd,

    @Schema(description = "Test rank", example = "A")
    String testRank,

    @Schema(description = "Germination of a seed in a laboratory test is the emergence and development from the seed embryo of those essential structures which are indicative of the ability to produce a normal plant under favorable conditions", example = "69")
    Integer germinationPct,

    @Schema(description = "The germination value assigned to a seedlot", example = "11")
    Integer germinationValue,

    @Schema(description = "The peak germination percentage achieved in a certain number of days", example = "62")
    Integer peakValueGrmPct,

    @Schema(description = "The number of days to reach the peak value germination percentage", example = "14")
    Integer peakValueNoDays,

    @Schema(description = "Seed withdrawal date", example = "2026-04-10")
    LocalDate seedWithdrawalDate,

    @Schema(description = "Revised start date", example = "2026-04-01")
    LocalDate revisedStartDt,

    @Schema(description = "Revised end date", example = "2026-04-20")
    LocalDate revisedEndDt,

    @Schema(description = "The number of standard time units for which an Activity should be completed", example = "1")
    Integer activityDuration,

    @Schema(description = "A code which represents a time unit of measure. i.e. Years, Months, Weeks, Days, Hours... etc", example = "DY")
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

    @Schema(description = "Germinator id", example = "6")
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
