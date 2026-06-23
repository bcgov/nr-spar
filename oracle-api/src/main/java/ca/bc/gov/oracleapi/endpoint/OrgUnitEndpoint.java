package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.entity.OrgUnitEntity;
import ca.bc.gov.oracleapi.repository.OrgUnitRepository;
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

/** Exposes Ministry of Forests district org unit resources. */
@RestController
@RequestMapping("/api/org-unit-districts")
@Tag(name = "orgUnitDistricts", description = "Resource to retrieve Ministry district org units")
public class OrgUnitEndpoint {

  private final OrgUnitRepository orgUnitRepository;

  OrgUnitEndpoint(OrgUnitRepository orgUnitRepository) {
    this.orgUnitRepository = orgUnitRepository;
  }

  /**
   * Retrieve all valid district org units.
   *
   * @return A list of {@link OrgUnitEntity} for all current, non-expired districts.
   */
  @GetMapping(produces = "application/json")
  @Operation(
      summary = "Retrieve non-expired district org units",
      description =
          "Retrieve all valid (non-expired) Ministry of Forests district org units. Districts are"
              + " identified by ORG_UNIT_NO = ROLLUP_DIST_NO. Only records where"
              + " effectiveDate <= today < expiryDate are returned.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Returns a list of all valid district org units",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = OrgUnitEntity.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public List<OrgUnitEntity> getAllDistrictOrgUnits() {
    SparLog.info("Fetching all valid district org units");

    List<OrgUnitEntity> resultList = orgUnitRepository.findAllDistricts();
    SparLog.info("{} valid district org units found.", resultList.size());

    return resultList;
  }
}
