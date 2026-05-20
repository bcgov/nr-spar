package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.DailyAbnormalResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminationTestHeaderDto;
import ca.bc.gov.oracleapi.dto.consep.TestRankResponseDto;
import ca.bc.gov.oracleapi.response.ApiAuthResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * This class exposes germination test resources API.
 *
 * <p>Provides endpoint operations for retrieving suggested test rank,
 * daily abnormal germination counts, and germination test header metadata.
 *
 * <p>Input validation is handled through bean validation annotations and
 * local exception handling for constraint violations.
 */
@RestController
@RequestMapping("/api/germination-tests")
@RequiredArgsConstructor
@Validated
@Tag(name = "Germination Test", description = "Resource to manage germination tests.")
public class GerminationTestEndpoint {

  private final TestResultService testResultService;

  /**
   * Determines the suggested test rank for a seedlot.
   *
   * @param seedlotNumber the seedlot number used to scope the rank check
   * @param testCategoryCd the test category code
   * @param acceptResultInd the accepted indicator
   * @return a response containing the suggested rank
   */
  @GetMapping("/rank/{seedlotNumber}")
  @ApiResponse(
      responseCode = "200",
      description = "Successfully determined the test rank.",
      content = @Content(schema = @Schema(implementation = TestRankResponseDto.class)))
  @ApiAuthResponse
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public TestRankResponseDto determineTestRank(
      @PathVariable
          @NotBlank
          @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "The seedlot number.",
              required = true)
          String seedlotNumber,
      @RequestParam
          @Parameter(
              name = "testCategoryCd",
              in = ParameterIn.QUERY,
              description = "The test category code.",
              required = true)
          String testCategoryCd,
      @RequestParam
          @Parameter(
              name = "acceptResultInd",
              in = ParameterIn.QUERY,
              description = "The accepted result indicator.",
              required = true)
          Integer acceptResultInd) {

    String rank = testResultService.determineTestRank(
        seedlotNumber,
        testCategoryCd,
        acceptResultInd);

    return new TestRankResponseDto(rank);
  }

  /**
   * Retrieve daily abnormal germination counts by daily germ key.
   *
   * <p>Returns replicate-level abnormal count information (rep1 to rep4)
   * for the specified daily germ record.
   *
   * @param dailyGermSkey the surrogate key of the daily germ record
   * @return a {@link DailyAbnormalResponseDto} containing abnormal counts for all replicates
   */
  @GetMapping("/daily-abnormals/{dailyGermSkey}")
  @Operation(
      summary = "Get daily abnormal germination counts by dailyGermSkey",
      description = "Retrieve replicate-level abnormal germination counts for a daily germ record.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Daily abnormal germination counts for the specified daily germ record.",
            content = @Content(schema = @Schema(implementation = DailyAbnormalResponseDto.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid dailyGermSkey supplied",
            content = @Content(schema = @Schema(hidden = true))),
        @ApiResponse(
            responseCode = "404",
            description = "Daily abnormal counts not found for the given key",
            content = @Content(schema = @Schema(hidden = true))),
        @ApiResponse(
            responseCode = "422",
            description = "Daily abnormal counts contain invalid values",
            content = @Content(schema = @Schema(hidden = true)))
      })
  @ApiAuthResponse
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  @ResponseStatus(HttpStatus.OK)
  public DailyAbnormalResponseDto getDailyAbnormalCounts(
      @PathVariable @Positive BigDecimal dailyGermSkey) {
    return testResultService.getDailyAbnormalCounts(dailyGermSkey);
  }

  /**
   * Retrieve germination test header and activity metadata for a single RIA key.
   *
   * @param riaKey identifier key for test activity related tables
   * @return germination test header data for the given RIA key
   */
  @GetMapping("/{riaKey}")
  @Operation(
      summary = "Get germination test header by riaKey",
      description = "Retrieve germination test header and activity metadata under a riaKey.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully returned germination test header data.",
            content = @Content(schema = @Schema(implementation = GerminationTestHeaderDto.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input: riaKey must be a positive number",
            content = @Content(schema = @Schema(hidden = true))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "404",
            description = "No data found for the given riaKey",
            content = @Content(schema = @Schema(hidden = true))),
        @ApiResponse(
            responseCode = "500",
            description = "Data integrity error: more than one row returned",
            content = @Content(schema = @Schema(hidden = true)))
      })
  @ApiAuthResponse
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public GerminationTestHeaderDto getGerminationTestHeaderByRiaKey(
      @PathVariable
          @Positive(message = "riaKey must be a positive number")
          @Parameter(
              name = "riaKey",
              in = ParameterIn.PATH,
              description = "The ria key.",
              required = true)
          BigDecimal riaKey) {

    SparLog.info("Received request to fetch germination test header for key: {}", riaKey);
    return testResultService.getGerminationTestHeader(riaKey);
  }

  /**
   * Handle path-variable constraint validation failures.
   *
   * <p>Converts bean validation {@code ConstraintViolationException} into an HTTP 400 response for
   * invalid daily germ key values.
   *
   * @param ex the validation exception thrown by bean validation
   * @return a response body containing a validation error message
   */
  @ExceptionHandler(ConstraintViolationException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, String> handleConstraintViolation(ConstraintViolationException ex) {
    String message =
        ex.getConstraintViolations().stream()
            .findFirst()
            .map(
                cv -> {
                  String path = cv.getPropertyPath().toString();
                  String fieldName =
                      path.contains(".") ? path.substring(path.lastIndexOf('.') + 1) : path;
                  String violationMessage = cv.getMessage();

                  if ("dailyGermSkey".equals(fieldName)
                      && "must be greater than 0".equals(violationMessage)) {
                    return "dailyGermSkey must be greater than 0";
                  }

                  return violationMessage;
                })
            .orElse("Validation failed");

    return Map.of("message", message);
  }
}
