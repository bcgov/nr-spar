package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.ActivityFormDto;
import ca.bc.gov.oracleapi.dto.consep.PurityReplicateFormDto;
import ca.bc.gov.oracleapi.dto.consep.PurityTestDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.PurityReplicateEntity;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.ActivityService;
import ca.bc.gov.oracleapi.service.consep.PurityTestService;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** This class exposes purity tests resources API. */
@RestController
@RequestMapping("/api/purity-tests")
@Tag(
    name = "PurityTests",
    description = "Resource to retrieve Purity Tests data.")
public class PurityTestsEndpoint {

  //TODO: Add everything related to impurities here (probably)

  private PurityTestService purityTestService;

  private ActivityService activityService;

  private TestResultService testResultService;

  PurityTestsEndpoint(
    PurityTestService purityTestService,
    ActivityService activityService,
    TestResultService testResultService
  ) {
    this.purityTestService = purityTestService;
    this.activityService = activityService;
    this.testResultService = testResultService;
  }

  /**
  * Retrieve a information related to a single purity test.
  *
  * @param riaKey An id for the tables in this request.
  * @return A {@link PurityTestDto} with all the necessary information.
  */
  @GetMapping("/{riaKey}")
  @Operation(
      summary = "Get a purity test data given a riaKey",
      description = "Retrieve a purity test object that is under a riaKey.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = """
          Successfully returned purity test data under a riaKey, an empty
          object is returned if nothing is found.
      """),
      @ApiResponse(
        responseCode = "401",
        description = "Access token is missing or invalid",
        content =
            @Content(
                schema = @Schema(implementation = Void.class))),
      @ApiResponse(
        responseCode = "404",
        content =
            @Content(
                schema = @Schema(hidden = true)))
  })
  @RoleAccessConfig({ "SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD" })
  public Optional<PurityTestDto> getPurityTestByRiaKey(
      @PathVariable
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "The ria key.",
          required = true)
      BigDecimal riaKey) {

    SparLog.info("Received request to fetch purity test data for key: {}", riaKey);

    return purityTestService.getPurityTestData(riaKey);
  }

  /**
   * Updates purity replicate entities.
   *
   * @param riaKey The identifier for the test activities related data.
   * @param replicateFormDtos A list of {@link PurityReplicateFormDto} containing the new values.
   * @return the {@link PurityReplicateEntity} updated
   */
  @PatchMapping(
      value = "replicate/{riaKey}",
      consumes = "application/json",
      produces = "application/json")
  @Operation(
      summary = "Update the fields of a replicate entity",
      description = "Updates a replicate."
  )
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "Field successfully updated"),
          @ApiResponse(responseCode = "400", description = "Invalid object"),
          @ApiResponse(responseCode = "404", description = "Replicate not found")
      })
  public List<PurityReplicateEntity> updateReplicateField(
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "Identification key for test activity data",
          required = true)
      @PathVariable
      BigDecimal riaKey,
      @Valid
      @RequestBody
      List<PurityReplicateFormDto> replicateFormDtos) {

    return purityTestService.updateReplicateField(riaKey, replicateFormDtos);
  }

  /**
   * Updates an activity record.
   *
   * @param riaKey The identifier for the activity-related data.
   * @param activityFormDto An object containing the new values.
   * @return the {@link ActivityEntity} updated
   */
  @PatchMapping(value = "/{riaKey}", consumes = "application/json", produces = "application/json")
  @Operation(
      summary = "Update an activity record",
      description = "Given the new values, updates an activity entry."
  )
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "Field successfully updated"),
          @ApiResponse(responseCode = "400", description = "Invalid object"),
          @ApiResponse(responseCode = "404", description = "Activity entry not found")
      })
  public ActivityEntity updateActivityField(
      @Parameter(
        name = "riaKey",
        in = ParameterIn.PATH,
        description = "Identification key for activity data",
        required = true)
      @PathVariable
      BigDecimal riaKey,
      @Valid
      @RequestBody ActivityFormDto activityFormDto) {
    return activityService.updateActivityField(riaKey, activityFormDto);
  }

  /**
  * Validate purity tests data.
  *
  * @param riaKey The identifier for the test activities related data.
  * @throws Exception if the table doesn't match the format.
  */
  @GetMapping(path = "/validate/{riaKey}")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "200",
          description = """
              Successfully validated purity tests data.
          """),
      @ApiResponse(
          responseCode = "401",
          description = "Access token is missing or invalid",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class))),
      @ApiResponse(
          responseCode = "404",
          content =
              @Content(
                  schema = @Schema(hidden = true)))
  })
  @RoleAccessConfig({ "SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD" })
  public void validatePurityTestData(
      @PathVariable
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "The ria key.",
          required = true)
      BigDecimal riaKey) throws Exception {
    try {
      Optional<PurityTestDto> purityContent = purityTestService
            .getPurityTestData(riaKey);

      if (purityContent.isEmpty()) {
        throw new ResponseStatusException(
          HttpStatus.NOT_FOUND,
          "No data found for given RIA_KEY");
      }

      purityTestService.validatePurityReplicateData(
          purityContent.get().replicatesList());

      ActivityEntity activityData = new ActivityEntity();
      activityData.setActualBeginDateTime(purityContent.get().actualBeginDateTime());
      activityData.setActualEndDateTime(purityContent.get().actualEndDateTime());
      activityData.setTestCategoryCode(purityContent.get().testCategoryCode());

      activityService.validateActivityData(activityData);
      testResultService.updateTestResultStatusToCompleted(riaKey);

    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
  * Accept purity test data.
  *
  * @param riaKey The identifier for the test activities related data.
  * @throws Exception if the table doesn't match the format.
  */
  @GetMapping(path = "/accept/{riaKey}")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "200",
          description = """
              Successfully accepted purity test data.
          """),
      @ApiResponse(
          responseCode = "401",
          description = "Access token is missing or invalid",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class))),
      @ApiResponse(
          responseCode = "404",
          content =
              @Content(
                  schema = @Schema(hidden = true)))
  })
  @RoleAccessConfig({ "SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD" })
  public void acceptPurityTestData(
      @PathVariable
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "The ria key.",
          required = true)
      BigDecimal riaKey) throws Exception {

    try {
      testResultService.acceptTestResult(riaKey);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Delete data from a purity test entry.
   *
   * @param riaKey The identifier for the test activities related data
   */
  @DeleteMapping(value = "/{riaKey}", produces = "application/json")
  @Operation(
      summary = "Delete data from purity test entry",
      description =
          "Remove data from all tables that contains purity test information")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "200",
          description = "The purity test was successfully deleted",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class))),
      @ApiResponse(
          responseCode = "401",
          description = "Access token is missing or invalid",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class))),
      @ApiResponse(
          responseCode = "404",
          description = "The purity test was not found",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class)))
  })
  @RoleAccessConfig({ "SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD" })
  public void deleteFullPurityTest(
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "Identification key for testing activities data",
          required = true)
      @PathVariable BigDecimal riaKey) {
    purityTestService.deleteFullPurityTest(riaKey);
  }

  /**
   * Delete a single replicate entry.
   *
   * @param riaKey The identifier for the testing activities data.
   * @param replicateNumber The replicate number to be deleted.
   */
  @DeleteMapping(value = "/{riaKey}/{replicateNumber}", produces = "application/json")
  @Operation(
      summary = "Delete a single replicate entry",
      description = "Removes a replicate entry from the database using its identifiers.")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "200",
          description = "The replicate entry was successfully deleted",
          content =
              @Content(
                   schema = @Schema(implementation = Void.class))),
      @ApiResponse(
          responseCode = "401",
          description = "Access token is missing or invalid",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class))),
      @ApiResponse(
          responseCode = "404",
          description = "The replicate entry was not found",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class)))
  })
  @RoleAccessConfig({ "SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD" })
  public Integer deleteReplicate(
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "Identification key for testing activities data",
          required = true)
      @PathVariable
      BigDecimal riaKey,
      @Parameter(
          name = "replicateNumber",
          in = ParameterIn.PATH,
          description = "Number of the replicate to delete",
          required = true)
      @PathVariable
          Integer replicateNumber) {
    purityTestService.deleteSinglePurityReplicate(riaKey, replicateNumber);
    return replicateNumber;
  }

  @DeleteMapping(value = "/{riaKey}/replicates", produces = "application/json")
  @Operation(
      summary = "Delete replicate entries in bulk",
      description = "Removes multiple replicate entries from the database using their identifiers.")
  @ApiResponses(value = {
    @ApiResponse(
          responseCode = "200",
          description = "The replicate entry was successfully deleted",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class))),
    @ApiResponse(
          responseCode = "401",
          description = "Access token is missing or invalid",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class))),
    @ApiResponse(
          responseCode = "404",
          description = "The replicate entry was not found",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class)))
  })
  @RoleAccessConfig({ "SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD" })
    public List<Integer> deleteReplicates(
        @Parameter(
            name = "riaKey",
            in = ParameterIn.PATH,
            description = "Identification key for testing activities data",
            required = true)
        @PathVariable
        BigDecimal riaKey,
        @Parameter(
            name = "replicateNumbers",
            in = ParameterIn.QUERY,
            description = "List of replicate numbers to delete",
            required = true)
        @RequestBody
            List<Integer> replicateNumbers) {
    purityTestService.deletePurityReplicates(riaKey, replicateNumbers);
    return replicateNumbers;
  }
}
