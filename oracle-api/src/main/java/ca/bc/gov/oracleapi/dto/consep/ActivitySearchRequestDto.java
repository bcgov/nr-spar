package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;


/**
 * This record serves the purpose of mapping fields the FE should send to the BE, to search a test activity.
 */
@Schema(description = "Search parameters for testing activity search API")
public record ActivitySearchRequestDto(
  @Schema(description = "Seedlot and Family Lot numbers", example = "[\"12345\", \"67890\"]")
  @Size(max = 5, message = "You can provide up to 5 lot numbers")
  List<@Size(max = 5, message = "Each lot number must be at most 5 characters") String> lotNumbers,
  // ? ask what's the difference between Seedlot and family lot number, string and number?

  @Schema(description = "Test activity type code", example = "SA")
  String testType, // do we have enum for test type, activity, category?

  @Schema(description = "Activity ID", example = "GSA")
  String activityId,

  @Schema(description = "Germinator Tray ID")
  @Size(max = 5)
  String germinatorTrayId,

  @Schema(description = "Withdrawal start date", example = "2025-07-01")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  @Min(value = 1900, message = "Year must be no earlier than 1900")
  @Max(value = 9999, message = "Year must be no later than 9999")
  LocalDate withdrawalStartDate,

  @Schema(description = "Withdrawal End date", example = "2025-07-01")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  LocalDate withdrawalEndDate,

  @Schema(description = "Include historical tests")
  Boolean includeHistoricalTests,

  @Schema(description = "Germ tests only")
  Boolean germTestsOnly,

  @Schema(description = "Request ID")
  @Size(max = 12)
  String requestId,

  @Schema(description = "Request type")
  String requestType,

  @Schema(description = "Request year", example = "2025")
  Integer requestYear,

  @Schema(description = "Orchard ID")
  @Size(max = 3)
  String orchardId,

  @Schema(description = "Category")
  String testCategory,

  @Schema(description = "Rank", example = "1")
  @Min(0)
  @Max(9)
  Integer rank,  // ? this can only be 0-9? what's the range

  @Schema(description = "Species")
  String species,

  @Schema(description = "Actual begin date from", example = "2025-01-01")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  LocalDate actualBeginDateFrom,

  @Schema(description = "Actual begin date to", example = "2025-01-31")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  LocalDate actualBeginDateTo,

  @Schema(description = "Actual end date from", example = "2025-02-01")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  LocalDate actualEndDateFrom,

  @Schema(description = "Actual end date to", example = "2025-02-28")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  LocalDate actualEndDateTo,

  @Schema(description = "Revised begin date from", example = "2025-03-01")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  LocalDate revisedStartDateFrom,

  @Schema(description = "Revised begin date to", example = "2025-03-31")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  LocalDate revisedStartDateTo,

  @Schema(description = "Revised end date from", example = "2025-04-01")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  LocalDate revisedEndDateFrom,

  @Schema(description = "Revised end date to", example = "2025-04-30")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  LocalDate revisedEndDateTo,

  @Schema(description = "Germ tray assignment status: -1 = Assigned, 0 = Unassigned")
  @Min(-1)
  @Max(0)
  Integer germTrayAssignment,

  @Schema(description = "Test completion status: -1 = Complete, 0 = Incomplete")
  @Min(-1)
  @Max(0)
  Integer completeStatus,

  @Schema(description = "Acceptance status: -1 = Accepted, 0 = Unaccepted")
  @Min(-1)
  @Max(0)
  Integer acceptanceStatus,

  @Schema(description = "Genetic class code: A = A Class, B = B Class", allowableValues = {"A", "B"})
  @Pattern(regexp = "[AB]", message = "geneticClassCode must be 'A' or 'B'")
  String seedlotClass
) {
}
