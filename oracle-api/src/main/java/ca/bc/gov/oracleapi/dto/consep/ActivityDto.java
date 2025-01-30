package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * This class represents a {@link ca.bc.gov.backendstartapi.entity.consep.Activity} object.
 */
@Schema(description = "This class represents an activity object.")
public record ActivityDto(

    @Schema(description = "Primary key of the activity entry", example = "1234567890")
    BigDecimal riaSkey,

    @Schema(description = "Identifier of the request", example = "REQ123456")
    String requestId,

    @Schema(description = "Foreign key for the request", example = "987654321")
    BigDecimal requestSkey,

    @Schema(description = "Identifier for the item", example = "A")
    String itemId,

    @Schema(description = "Seedlot number associated with the activity", example = "12345")
    String seedlotNumber,

    @Schema(description = "Family lot number associated with the activity", example = "FMLY12345")
    String familyLotNumber,

    @Schema(description = "State of vegetation associated with the activity", example = "ACTIVE")
    String vegetationState,

    @Schema(description = "Standard activity identifier", example = "STD123")
    String atandardActivityId,

    @Schema(description = "Activity type code", example = "ATC")
    String activityTypeCode,

    @Schema(description = "Test category code", example = "TST")
    String testCategoryCode,

    @Schema(description = "Earliest start date for the activity", example = "2025-01-01")
    LocalDate earliestStartDate,

    @Schema(description = "Latest start date for the activity", example = "2025-01-10")
    LocalDate latestStartDate,

    @Schema(description = "Planned start date for the activity", example = "2025-01-05")
    LocalDate plannedStartDate,

    @Schema(description = "Revised start date for the activity", example = "2025-01-07")
    LocalDate revisedStartDate,

    @Schema(description = "Earliest end date for the activity", example = "2025-01-15")
    LocalDate earliestEndDate,

    @Schema(description = "Latest end date for the activity", example = "2025-01-20")
    LocalDate latestEndDate,

    @Schema(description = "Planned end date for the activity", example = "2025-01-18")
    LocalDate plannedEndDate,

    @Schema(description = "Revised end date for the activity", example = "2025-01-22")
    LocalDate revisedEndDate,

    @Schema(description = "Actual begin date of the activity", example = "2025-01-05T08:00:00")
    LocalDateTime actualBeginDateTime,

    @Schema(description = "Actual end date of the activity", example = "2025-01-18T16:00:00")
    LocalDateTime actualEndDateTime,

    @Schema(description = "Duration of the activity in hours", example = "120")
    Integer activityDuration,

    @Schema(description = "Time unit for the activity duration", example = "HRS")
    String activityTimeUnit,

    @Schema(description = "Indicator for significant status", example = "1")
    Integer significantStatusIndicator,

    @Schema(description = "Indicator for process commit", example = "1")
    Integer processCommitIndicator,

    @Schema(description = "Timestamp for the last update", example = "2025-01-20T12:00:00")
    LocalDateTime updateTimestamp,

    @Schema(description = "Indicator for the process result", example = "1")
    Integer processResultIndicator,

    @Schema(description = "Indicator for the test result", example = "1")
    Integer testResultIndicator,

    @Schema(description = "Associated RIA key", example = "6543210987")
    BigDecimal associatedRiaKey,

    @Schema(description = "Identifier for the work centre", example = "WC1")
    String workCentreId,

    @Schema(description = "Blending method code", example = "BLD")
    String blendingMethod,

    @Schema(description = "Dryer used code", example = "DRY")
    String dryerUsed,

    @Schema(description = "Deck type code", example = "DT1")
    String deckType,

    @Schema(description = "DSP method code", example = "DSP")
    String dspMethod,

    @Schema(description = "Total soak hours", example = "48")
    Integer totalSoakHours,

    @Schema(description = "Total soak minutes", example = "30")
    Integer totalSoakMinutes,

    @Schema(description = "Target percentage for floaters", example = "15")
    Integer targetFloaters,

    @Schema(description = "Target percentage for sinkers", example = "85")
    Integer targetSinkers,

    @Schema(description = "Minimum water temperature", example = "18")
    Integer waterTempMin,

    @Schema(description = "Maximum water temperature", example = "22")
    Integer waterTempMax,

    @Schema(description = "Dewing method code", example = "DWM")
    String dewingMethod,

    @Schema(description = "Average drum speed", example = "120")
    String averagerumSpeed,

    @Schema(description = "Water temperature code", example = "WT1")
    String waterTemp,

    @Schema(description = "Total hours per batch", example = "6")
    Integer totalHoursBatch,

    @Schema(description = "Total minutes per batch", example = "30")
    Integer totalMinutesBatch,

    @Schema(description = "Total misting minutes", example = "15")
    Integer totalMistingMinutes,

    @Schema(description = "Total misting seconds", example = "45")
    Integer totalMistingSeconds,

    @Schema(description = "Dewing separation ease code", example = "DSE")
    String dewingSeparation,

    @Schema(description = "Indicator for hand dewing required", example = "1")
    Integer handDewing,

    @Schema(description = "Process machine code", example = "PMC")
    String processMachine,

    @Schema(description = "Separation machine code", example = "SMC")
    String sepMachine,

    @Schema(description = "Number of pneumatic separators", example = "3")
    Integer noPneumatic,

    @Schema(description = "Dry weight in grams", example = "500.123")
    BigDecimal dryWeight,

    @Schema(description = "Prior moisture content percentage", example = "10.5")
    BigDecimal priorMoist,

    @Schema(description = "Target fresh weight in grams", example = "600.1")
    BigDecimal targetFreshWeight,

    @Schema(description = "Target moisture content percentage", example = "9.8")
    BigDecimal targetMoistureContent,

    @Schema(description = "Dryback weight in grams", example = "450.234")
    BigDecimal drybackWeight,

    @Schema(description = "Dryback moisture content percentage", example = "8.2")
    BigDecimal drybackMoist,

    @Schema(description = "Drying method code", example = "DM1")
    String dryingMethod,

    @Schema(description = "Temperature in degrees Celsius", example = "25")
    Integer temperature,

    @Schema(description = "Depth per tray in millimeters", example = "10")
    Integer depthPerTray,

    @Schema(description = "First screen machine code", example = "SM1")
    String screenMachineOne,

    @Schema(description = "Second screen machine code", example = "SM2")
    String screenMachineTwo,

    @Schema(description = "Third screen machine code", example = "SM3")
    String screenMachineThree,

    @Schema(description = "Number of times the process is repeated", example = "2")
    Integer noTimesRepeated,

    @Schema(description = "Water type code", example = "WT2")
    String waterType,

    @Schema(description = "Tumbler type code", example = "TT1")
    String tumblerType,

    @Schema(description = "Tumbler slope angle in degrees", example = "15")
    Integer tumblerSlope,

    @Schema(description = "Tumbler RPM", example = "120.50")
    BigDecimal tumblerRpm,

    @Schema(description = "Indicator for intermediate cleaner required", example = "1")
    Integer intermediateCleaner,

    @Schema(description = "Closed percentage", example = "80")
    Integer closedPercentage,

    @Schema(description = "Slight flex percentage", example = "10")
    Integer slightFlex,

    @Schema(description = "Moderate flex percentage", example = "5")
    Integer moderateFlex,

    @Schema(description = "Full flex percentage", example = "5")
    Integer fullFlex,

    @Schema(description = "Kiln program identifier", example = "KP123")
    String kilnProgram,

    @Schema(description = "Indicator for turning performed", example = "1")
    Integer turningPrfmd,

    @Schema(description = "Hours required for the activity", example = "4.5")
    BigDecimal hoursRequired,

    @Schema(description = "Filled seed average percentage", example = "95.75")
    BigDecimal filledSeedAverage,

    @Schema(description = "Comments for the activity", example = "Activity completed successfully")
    String riaComment,

    @Schema(description = "Imbibed weight in grams", example = "300.456")
    BigDecimal imbibedWeight,

    @Schema(description = "Dryback time in hours", example = "12")
    Integer drybackTime,

    @Schema(description = "Target 30% moisture content in grams", example = "400.123")
    BigDecimal targetThirtyMoist,

    @Schema(description = "Target 35% moisture content in grams", example = "500.456")
    BigDecimal targetThirtyFiveMoist,

    @Schema(description = "Stratification end weight in grams", example = "700.789")
    BigDecimal stratEndWeight
) {}
