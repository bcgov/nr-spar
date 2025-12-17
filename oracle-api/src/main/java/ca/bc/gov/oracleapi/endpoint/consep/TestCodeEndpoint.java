package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.TestCodeDto;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.TestCodeService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

  @GetMapping("/type")
  @ApiResponses(value = {
    @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved all valid test activity type codes."
    ),
    @ApiResponse(
      responseCode = "401",
      description = "Access token is missing or invalid",
      content = @Content(schema = @Schema(implementation = Void.class))
    )
  })
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<TestCodeDto> getTestTypeCodes() {
    return testCodeService.getTestTypeCodes();
  }

  @GetMapping("/category")
  @ApiResponses(value = {
    @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved all valid test category codes."
    ),
    @ApiResponse(
      responseCode = "401",
      description = "Access token is missing or invalid",
      content = @Content(schema = @Schema(implementation = Void.class))
    )
  })
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<TestCodeDto> getTestCategoryCodes() {
    return testCodeService.getTestCategoryCodes();
  }

  @GetMapping("/by-activity")
  @ApiResponses(value = {
    @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved all valid codes for the specified activity."
    ),
    @ApiResponse(
      responseCode = "401",
      description = "Access token is missing or invalid",
      content = @Content(schema = @Schema(implementation = Void.class))
    )
  })
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<String> getCodesByActivity(
      @RequestParam String activity) {
    return testCodeService.getCodesByColumnActivity(activity);
  }
}
