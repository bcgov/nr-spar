package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.RepAcceptedUpdateDto;
import ca.bc.gov.oracleapi.dto.consep.TestRepGermDto;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.TestRepGermService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes germination test replicate resources API. */
@RestController
@RequestMapping("/api/test-replicates")
@Validated
@Tag(
    name = "TestReplicates",
    description = "Resource to retrieve germination test replicate data.")
public class TestRepGermEndpoint {

  private final TestRepGermService testRepGermService;

  TestRepGermEndpoint(TestRepGermService testRepGermService) {
    this.testRepGermService = testRepGermService;
  }

  /**
   * Retrieve all germination test replicates for a given riaKey,
   * ordered by replicate number.
   *
   * @param riaKey An id for the tables in this request.
   * @return A list of {@link TestRepGermDto}.
   */
  @GetMapping("/{riaKey}")
  @Operation(
      summary = "Get test replicates given a riaKey",
      description = "Retrieve test replicates that are under a riaKey, "
          + "ordered by test_replicate_no.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = """
          Successfully returned test replicates under a riaKey, an empty
          list is returned if nothing is found.
      """),
      @ApiResponse(
          responseCode = "400",
          description = "Invalid input: riaKey must be a positive number",
          content = @Content(schema = @Schema(hidden = true))),
      @ApiResponse(
          responseCode = "401",
          description = "Access token is missing or invalid",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class))),
      @ApiResponse(
          responseCode = "403",
          description = "User does not have the required role",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class)))
  })
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public List<TestRepGermDto> getTestReplicates(
      @PathVariable
      @Positive(message = "riaKey must be a positive number")
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "The ria key.",
          required = true)
      BigDecimal riaKey) {
    return testRepGermService.getTestReplicates(riaKey);
  }

  /**
   * Tick or untick one replicate's Accept box (#2756). Allowed on a completed test, refused
   * once the test is accepted.
   */
  @PatchMapping("/{riaKey}/{replicateNumber}")
  @Operation(
      summary = "Include or exclude a replicate from the germination calculations",
      description = "Sets REP_ACCEPTED_IND. Works on a completed test; an accepted test is "
          + "locked.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "The updated replicate"),
      @ApiResponse(responseCode = "400", description = "Invalid path or body",
          content = @Content(schema = @Schema(hidden = true))),
      @ApiResponse(responseCode = "404", description = "Test or replicate not found",
          content = @Content(schema = @Schema(hidden = true))),
      @ApiResponse(responseCode = "409", description = "The test is accepted",
          content = @Content(schema = @Schema(hidden = true)))
  })
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public TestRepGermDto updateRepAccepted(
      @PathVariable @Positive(message = "riaKey must be a positive number") BigDecimal riaKey,
      @PathVariable @Min(1) @Max(4) Integer replicateNumber,
      @Valid @RequestBody RepAcceptedUpdateDto body) {
    return testRepGermService.updateRepAccepted(riaKey, replicateNumber, body.repAcceptedInd());
  }
}
