package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.MoistureContentConesDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
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
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

  MoistureContentConesEndpoint(MoistureContentService moistureContentService) {
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
  * Validate moisture content cones data.
  *
  * @throws Exception if the table doesn't match the format.
  */
  @PostMapping(path = "/{riaKey}/validate")
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
  @PostMapping(path = "/{riaKey}/accept")
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
  public void deleteReplicate(
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
  }
}
