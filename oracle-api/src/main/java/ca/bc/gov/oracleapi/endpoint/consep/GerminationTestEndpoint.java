package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.DailyAbnormalResponseDto;
import ca.bc.gov.oracleapi.response.ApiAuthResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * This class exposes germination test resources API.
 *
 * <p>Provides endpoint operations for retrieving daily abnormal germination
 * counts for a given daily germ key.
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
   * Retrieve daily abnormal germination counts by daily germ key.
   *
   * <p>Returns replicate-level abnormal count information (rep1 to rep4)
   * for the specified daily germ record.
   *
   * <p>@param dailyGermSkey the surrogate key of the daily germ record
   * @return a {@link DailyAbnormalResponseDto} containing abnormal counts for all replicates
   */
  @GetMapping("/daily-abnormals/{dailyGermSkey}")
  @ResponseStatus(HttpStatus.OK)
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
  public DailyAbnormalResponseDto getDailyAbnormalCounts(
      @PathVariable @Positive BigDecimal dailyGermSkey) {
    return testResultService.getDailyAbnormalCounts(dailyGermSkey);
  }

  /**
   * Handle path-variable constraint validation failures.
   *
   * <p>Converts bean validation {@code ConstraintViolationException}
   * into an HTTP 400 response for invalid daily germ key values.
   *
   * <p>@param ex the validation exception thrown by bean validation
   * @return a response body containing a validation error message
   */
  @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public java.util.Map<String, String> handleConstraintViolation(
      jakarta.validation.ConstraintViolationException ex) {
    return java.util.Map.of("message", "dailyGermSkey must be greater than 0");
  }
}
