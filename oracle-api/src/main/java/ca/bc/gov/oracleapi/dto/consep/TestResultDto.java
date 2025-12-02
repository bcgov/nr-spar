package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * This class represents a {@link ca.bc.gov.oracleapi.entity.consep.TestResult} object.
 */
@Schema(description = "This class represents a TestResultEntity")
public record TestResultDto(

    @Schema(description = "RIA Key of the test result entry", example = "123")
    BigDecimal riaKey,

    @Schema(description = "Code for the type of activity", example = "ABC")
    String activityType,

    @Schema(description = "Code for the standard test", example = "12345")
    Integer standardTest,

    @Schema(description = "Category code of the test", example = "CAT")
    String testCategory,

    @Schema(description = "Indicator if the result is accepted", example = "1")
    Integer acceptResult,

    @Schema(description = "Indicator if the test is complete", example = "1")
    Integer testCompleteInd,

    @Schema(description = "Indicator if it is the original test", example = "1")
    Integer originalTest,

    @Schema(description = "Indicator if it is the current test", example = "1")
    Integer currentTest,

    @Schema(description = "Rank of the test", example = "A")
    String testRank,

    @Schema(description = "Description of the sample", example = "Sample A")
    String sampleDesc,

    @Schema(description = "Code for the moisture status", example = "MOI")
    String moistureStatus,

    @Schema(description = "Germination percentage", example = "12.3")
    Integer germinationPct,

    @Schema(description = "Moisture percentage", example = "12.3")
    BigDecimal moisturePct,

    @Schema(description = "Germination value", example = "100")
    Integer germinationValue,

    @Schema(description = "Peak germination percentage value", example = "12")
    Integer peakValueGrmPct,

    @Schema(description = "Number of days to peak germination", example = "1")
    Integer peakValueNoDays,

    @Schema(description = "Weight per 100 seeds in grams", example = "1.234")
    BigDecimal weightPer100,

    @Schema(description = "Number of seeds per gram", example = "1000")
    Integer seedsPerGram,

    @Schema(description = "Purity percentage", example = "12.3")
    BigDecimal purityPct,

    @Schema(description = "Other test results", example = "45.678")
    BigDecimal otherTestResult,

    @Schema(description = "Timestamp of the last update", example = "2025-01-01")
    LocalDate updateTimestamp,

    @Schema(description = "Start date of stratification", example = "2025-01-05")
    LocalDate stratStartDate,

    @Schema(description = "Start date of germination counting", example = "2025-01-10")
    LocalDate germStartDate,

    @Schema(description = "Date of the next germination stage", example = "2025-01-15")
    LocalDate germNextStageDate,

    @Schema(description = "Date of seed withdrawal", example = "2025-01-20")
    LocalDate seedWithdrawDate,

    @Schema(description = "Start date of warm stratification", example = "2025-01-25")
    LocalDate warmStratStartDate,

    @Schema(description = "Start date of dryback", example = "2025-01-30")
    LocalDate drybackStartDate,

    @Schema(description = "Date of germinator entry", example = "2025-02-01")
    LocalDate germinatorEntry,

    @Schema(description = "ID of the germinator", example = "G")
    String germinatorId,

    @Schema(description = "ID of the germinator tray", example = "12345")
    Integer germinatorTrayId,

    @Schema(description = "Indicator for labeling", example = "1")
    Integer labelInd,

    @Schema(description = "Indicator for re-sampling", example = "1")
    Integer reSampleInd
) {}
