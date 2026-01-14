package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.TestCodeDto;
import ca.bc.gov.oracleapi.response.ApiAuthResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.TestCodeService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * This class exposes test code API.
 */
@RestController
@RequestMapping("/api/test-codes")
@RequiredArgsConstructor
@Validated
@Tag(name = "TestCode", description = "Resource to retrieve test codes.")
public class TestCodeEndpoint {
  private final TestCodeService testCodeService;

  /**
   * Retrieve all valid test activity type codes.
   *
   * @return A list of {@link TestCodeDto} representing test activity type codes.
   */
  @GetMapping("/type")
  @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved all valid test activity type codes."
  )
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<TestCodeDto> getTestTypeCodes() {
    return testCodeService.getTestTypeCodes();
  }

  /**
   * Retrieve all valid test category codes.
   *
   * @return A list of {@link TestCodeDto} representing test category codes.
   */
  @GetMapping("/category")
  @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved all valid test category codes."
  )
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<TestCodeDto> getTestCategoryCodes() {
    return testCodeService.getTestCategoryCodes();
  }

  @GetMapping("/by-activity")
  @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved all valid codes for the specified activity."
  )
  @ApiAuthResponse
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public List<String> getCodesByActivity(
      @Parameter(
        description = """
        Activity name used to filter test codes.
        This value corresponds to the columnName field in TestCodeEntity.
        Must be a non-blank string.
        """,
        required = true,
        example = "SEEDLOT_TEST")
      @RequestParam String activity
  ) {
    if (activity == null || activity.trim().isEmpty()) {
      throw new IllegalArgumentException("activity must not be blank");
    }
    return testCodeService.getCodesByColumnActivity(activity);
  }

  /**
   * Retrieve all valid request type codes used for testing activities.
   *
   * @return A list of {@link TestCodeDto} representing request type codes.
   */
  @GetMapping("/request-types")
  @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved all valid request types."
  )
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<TestCodeDto> getRequestTypes() {
    return testCodeService.getRequestTypes();
  }

  /**
   * Retrieve all valid activity duration time unit codes.
   *
   * @return A list of activity duration time unit codes (e.g. "HR", "DY").
   */
  @GetMapping("/activity-duration-units")
  @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved all valid activity duration time unit codes."
  )
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<String> getActivityDurationTimeUnits() {
    return testCodeService.getActivityDurationTimeUnits();
  }
}
