package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.TestRankResponseDto;
import ca.bc.gov.oracleapi.response.ApiAuthResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes germination test resources API. */
@RestController
@RequestMapping("/api/germination-tests")
@RequiredArgsConstructor
@Validated
@Tag(name = "Germination Tests", description = "Resource to manage germination tests.")
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
          Integer acceptResultInd
  ) {

    String rank =
        testResultService.determineTestRank(
          seedlotNumber,
          testCategoryCd,
          acceptResultInd
        );

    return new TestRankResponseDto(rank);
  }
}
