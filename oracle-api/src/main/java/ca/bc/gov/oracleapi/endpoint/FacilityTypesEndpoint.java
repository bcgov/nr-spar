package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.entity.FacilityTypes;
import ca.bc.gov.oracleapi.repository.FacilityTypesRepository;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class holds resources to provide {@link FacilityTypes} data. */
@RestController
@RequestMapping("/api/facility-types")
@Tag(
    name = "facilityTypes",
    description = "Resource to retrieve Facility Types for Interim Agencies")
public class FacilityTypesEndpoint {

  private FacilityTypesRepository facilityTypesRepository;

  FacilityTypesEndpoint(FacilityTypesRepository facilityTypesRepository) {
    this.facilityTypesRepository = facilityTypesRepository;
  }

  /**
   * Retrieve all valid facility types.
   *
   * @return a list of {@link FacilityTypes} with all found result
   */
  @GetMapping(produces = "application/json")
  @Operation(
      summary = "Retrieve all valid facility types",
      description =
          "Retrieve all valid (non expired) facility types based on effectiveDate "
              + "and expiryDate, where 'today >= effectiveDate' and 'today < expiryDate'.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Returns a list containing all facility types",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = FacilityTypes.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public List<FacilityTypes> getAllValidFacilityTypes() {
    SparLog.info("Fetching all valid facility types");

    List<FacilityTypes> resultList = facilityTypesRepository.findAllValid();
    SparLog.info("{} valid facillity type found", resultList.size());

    return resultList;
  }
}
