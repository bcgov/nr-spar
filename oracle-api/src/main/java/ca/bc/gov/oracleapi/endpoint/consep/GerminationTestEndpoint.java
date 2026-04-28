package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.GerminationTestHeaderDto;
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
import java.math.BigDecimal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes germination test resources API. */
@RestController
@RequestMapping("/api/germination-tests")
@Tag(
    name = "GerminationTests",
    description = "Resource to retrieve Germination Test header and activity metadata.")
public class GerminationTestEndpoint {

  private TestResultService testResultService;

  GerminationTestEndpoint(TestResultService testResultService) {
    this.testResultService = testResultService;
  }

  /**
   * Retrieve germination test header and activity metadata for a single RIA key.
   *
   * @param riaKey Identifier key for test activity related tables.
   * @return Germination test header data for the given RIA key.
   */
  @GetMapping("/{riaKey}")
  @Operation(
      summary = "Get germination test header by riaKey",
      description = "Retrieve germination test header and activity metadata under a riaKey.")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "200",
          description = "Successfully returned germination test header data."),
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
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public GerminationTestHeaderDto getGerminationTestHeaderByRiaKey(
      @PathVariable
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "The ria key.",
          required = true)
      BigDecimal riaKey) {

    SparLog.info("Received request to fetch germination test header for key: {}", riaKey);
    return testResultService.getGerminationTestHeader(riaKey);
  }
}
