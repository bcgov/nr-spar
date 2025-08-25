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
  @Schema(description = "Seedlot and/or Family Lot numbers", example = "[\"12345\", \"F20082140146\"]")
  @Size(max = 5, message = "You can provide up to 5 lot numbers")
  List<@Size(max = 13, message = "Each lot number must be at most 13 characters") String> lotNumbers,

  @Schema(description = "Test activity type code, used to filter activity_type_cd")
  @Size(max = 3)
  String testType,

  @Schema(description = "Activity ID, used to filter stndrd_activity_id")
  @Size(max = 3)
  String activityId,

  @Schema(description = "Germinator Tray ID, used to filter germinator_tray_id")
  @Max(value = 99999, message = "Germinator Tray ID must be at most 5 digits")
  @Min(value = 0)
  Integer germinatorTrayId,

  @Schema(description = "Withdrawal start date", example = "2025-07-01")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  LocalDate seedWithdrawalStartDate,

  @Schema(description = "Withdrawal End date", example = "2025-07-01")
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  LocalDate seedWithdrawalEndDate,

  @Schema(description = "Include historical tests, used to filter request_skey")
  Boolean includeHistoricalTests,

  @Schema(description = "Germ tests only, used to filter germ_test_ind")
  Boolean germTestsOnly,

  @Schema(description = "Request ID, used to filter req_id (first 11 char) and item_id (the 12th char)")
  @Size(max = 12)
  String requestId,

  @Schema(description = "Request type, used to filter request_type_st")
  @Size(max = 3)
  String requestType,

  @Schema(description = "Request year between 1900 and 9999, used to filter request_yr")
  @Min(value = 1900)
  @Max(value = 9999)
  Integer requestYear,

  @Schema(description = "Orchard ID, used to filter orchard_id")
  @Size(max = 3)
  String orchardId,

  @Schema(description = "Category, used to filter test_category_cd")
  @Size(max = 3)
  String testCategoryCd,

  @Schema(description = "Rank, used to filter test_rank")
  @Size(max = 1)
  String testRank,

  @Schema(description = "Species, used to filter vegetation_st")
  @Size(max = 8)
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

  @Schema(description = "Germ tray assignment status: -1 = Assigned, 0 = Unassigned, used to filter assigned_tray_ind")
  @Min(-1)
  @Max(0)
  Integer germTrayAssignment,

  @Schema(description = "Test completion status: -1 = Complete, 0 = Incomplete, used to filter test_complete_ind")
  @Min(-1)
  @Max(0)
  Integer completeStatus,

  @Schema(description = "Acceptance status: -1 = Accepted, 0 = Unaccepted, used to filter accept_result_ind")
  @Min(-1)
  @Max(0)
  Integer acceptanceStatus,

  @Schema(description = "Genetic class code: A = A Class, B = B Class", allowableValues = {"A", "B"})
  @Pattern(regexp = "[AB]", message = "geneticClassCode must be 'A' or 'B'")
  String seedlotClass
) {
}
