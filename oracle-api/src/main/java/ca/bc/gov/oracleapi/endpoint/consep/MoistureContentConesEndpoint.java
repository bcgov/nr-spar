package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.ActivityFormDto;
import ca.bc.gov.oracleapi.dto.consep.MoistureContentConesDto;
import ca.bc.gov.oracleapi.dto.consep.Numbers;
import ca.bc.gov.oracleapi.dto.consep.ReplicateFormDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.ReplicateEntity;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.MoistureContentService;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** This class exposes moisture content cones resources API. */
@RestController
@RequestMapping("/api/moisture-content-cone")
@Tag(
    name = "MoistureContentCones",
    description = "Resource to retrieve Moisture Content Cones data.")
public class MoistureContentConesEndpoint {

  private MoistureContentService moistureContentService;

  @Autowired
  public MoistureContentConesEndpoint(
      MoistureContentService moistureContentService) {
    this.moistureContentService = moistureContentService;
  }

  /**
  * Retrieve a information related to the moisture content cone.
  *
  * @param riaKey An id for the tables in this request.
  * @return A {@link MoistureContentConesDto} with all the necessary information.
  */
  @GetMapping("/{riaKey}")
  @Operation(
      summary = "Get a moisture content cone data given a riaKey",
      description = "Retrieve a moisture content cone object that is under a riaKey.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = """
          Successfully returned moisture content cone data under a riaKey, an empty
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
  public Optional<MoistureContentConesDto> getMccByRiaKey(
      @PathVariable
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "The ria key.",
          required = true)
      BigDecimal riaKey) {

    SparLog.info("Received request to fetch MCC data for key: {}", riaKey);

    return moistureContentService.getMoistureConeContentData(riaKey);
  }

  /**
   * Updates replicate entities.
   *
   * @param riaKey The identifier for the MCC-related data.
   * @param replicateFormDtos A list of {@link ReplicateFormDto} containing the new values.
   * @return the {@link ReplicateEntity} updated
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
  public List<ReplicateEntity> updateReplicateField(
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "Identification key for MCC data",
          required = true)
      @PathVariable
      BigDecimal riaKey,
      @Valid
      @RequestBody
      List<ReplicateFormDto> replicateFormDtos) {
    return moistureContentService.updateReplicateField(riaKey, replicateFormDtos);
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
      @PathVariable BigDecimal riaKey,
      @Valid
      @RequestBody ActivityFormDto activityFormDto) {
    return moistureContentService.updateActivityField(riaKey, activityFormDto);
  }
    
  /**  
  * Validate moisture content cones data.
  *
  * @throws Exception if the table doesn't match the format.
  */
  @GetMapping(path = "/validate/{riaKey}")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "200",
          description = """
              Successfully validated moisture content cones data.
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
  public void validateMoistureContentData(
      @PathVariable
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "The ria key.",
          required = true)
      BigDecimal riaKey) throws Exception {
    try {
      Optional<MoistureContentConesDto> moistureContent = moistureContentService
            .getMoistureConeContentData(riaKey);

      if (moistureContent.isEmpty()) {
        throw new ResponseStatusException(
          HttpStatus.NOT_FOUND,
          "No data found for given RIA_KEY");
      }

      moistureContentService.validateMoistureConeContentData(
          moistureContent.get().replicatesList());

      ActivityEntity activityData = new ActivityEntity();
      activityData.setActualBeginDateTime(moistureContent.get().actualBeginDateTime());
      activityData.setActualEndDateTime(moistureContent.get().actualEndDateTime());
      activityData.setTestCategoryCode(moistureContent.get().testCategoryCode());
      moistureContentService.validateMoistureContentActivityData(activityData);
      moistureContentService.updateTestResultStatusToCompleted(riaKey);

    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
  * Accept moisture content cones data.
  *
  */
  @GetMapping(path = "/accept/{riaKey}")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "200",
          description = """
              Successfully accepted moisture content cones data.
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
  public void acceptMoistureContentData(
      @PathVariable
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "The ria key.",
          required = true)
      BigDecimal riaKey) throws Exception {

    try {
      moistureContentService.acceptMoistureContentData(riaKey);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Delete data from a moisture content cone entry.
   *
   * @param riaKey The id of the related tables
   */
  @DeleteMapping(value = "/{riaKey}", produces = "application/json")
  @Operation(
      summary = "Delete data from moisture content cone entry",
      description =
          "Remove data from all tables that contains the moisture content cone information")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "200",
          description = "The moisture content cone was successfully deleted",
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
          description = "The moisture content cone was not found",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class)))
  })
  @RoleAccessConfig({ "SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD" })
  public void deleteMcc(
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "Identification key for MCC data",
          required = true)
      @PathVariable BigDecimal riaKey) {
    moistureContentService.deleteFullMcc(riaKey);
  }

  /**
   * Delete a single replicate entry.
   *
   * @param riaKey The identifier for the MCC-related data.
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
          description = "Identification key for MCC data",
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
    moistureContentService.deleteMccReplicate(riaKey, replicateNumber);
    return replicateNumber;
  }
  
  @PostMapping(value = "/{riaKey}/replicates", produces = "application/json")
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
            description = "Identification key for MCC data",
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
    moistureContentService.deleteMccReplicates(riaKey, replicateNumbers);
    return replicateNumbers;
  }

  /**
   * Calculate the average of a list of numbers.
   *
   * @param numbers A list of numbers to calculate the average.
   * @return The calculated average.
   */
  @PostMapping("/calculate-average")
  @Operation(
      summary = "Calculate the average of a list of numbers",
      description = "Given a list of numbers, calculates and returns the average.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully calculated the average"),
      @ApiResponse(responseCode = "400", description = "Invalid input data"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<Double> calculateAverage(@RequestBody Numbers numbers) {
    try {
      double average = moistureContentService.calculateAverage(numbers.getNumbers());
      return ResponseEntity.status(HttpStatus.OK).body(average);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
  }
}
