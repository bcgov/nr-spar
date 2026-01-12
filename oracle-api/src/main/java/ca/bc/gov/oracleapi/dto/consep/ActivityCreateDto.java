package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

/**
 * A DTO containing only the fields needed for
 * creating a new {@link ca.bc.gov.oracleapi.entity.consep.ActivityEntity} instance.
 */
public record ActivityCreateDto(
    @Schema(description = "A surrogate key to uniquely identify each Spar Request")
    @Digits(integer = 10, fraction = 0)
    @NotNull
    BigDecimal riaKey,

    @Schema(description = "Standard activity identifier")
    @Size(max = 3)
    @NotBlank
    String standardActivityId,

    @Schema(description = "Activity type code")
    @Size(max = 3)
    String activityTypeCd,

    @Schema(description = "Test category code")
    @Size(max = 3)
    String testCategoryCd,

    @Schema(description = "Associated RIA key")
    @Digits(integer = 10, fraction = 0)
    BigDecimal associatedRiaKey,

    @Schema(description = "Planned start date for the activity")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @NotNull
    LocalDate plannedStartDate,

    @Schema(description = "Planned end date for the activity")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @NotNull
    LocalDate plannedEndDate,

    @Schema(description = "Revised start date for the activity")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    LocalDate revisedStartDate,

    @Schema(description = "Revised end date for the activity")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    LocalDate revisedEndDate,

    @Schema(description = "Duration of the activity")
    @Max(value = 999)
    @Min(value = 0)
    @NotNull
    Integer activityDuration,

    @Schema(description = "Time unit for the activity duration")
    @Size(max = 3)
    @NotNull
    String activityTimeUnit,

    @Schema(description = "Indicator for significant status")
    @Min(-1)
    @Max(0)
    Integer significantStatusIndicator,

    @Schema(description = "Indicator for process commit")
    @Min(-1)
    @Max(0)
    Integer processCommitIndicator,

    @Schema(description = "Indicator for the process result")
    @Min(-1)
    @Max(0)
    Integer processResultIndicator,

    @Schema(description = "Indicator for the test result")
    @Min(-1)
    @Max(0)
    Integer testResultIndicator,

    @Schema(description = "Foreign key for the request")
    @Digits(integer = 10, fraction = 0)
    @NotNull
    BigDecimal requestSkey,

    @Schema(description = "Identifier of the request")
    @Size(max = 11)
    @NotNull
    String requestId,

    @Schema(description = "Identifier for the item")
    @Size(max = 1)
    @NotNull
    String itemId,

    @Schema(description = "State of vegetation associated with the activity")
    @Size(max = 8)
    @NotNull
    String vegetationState,

    @Schema(description = "Seedlot number associated with the activity")
    @Size(max = 5)
    String seedlotNumber,

    @Schema(description = "Family lot number associated with the activity")
    @Size(max = 13)
    String familyLotNumber
){}
