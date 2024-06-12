package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.SpuDto;
import ca.bc.gov.backendstartapi.entity.FacilityTypes;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import ca.bc.gov.backendstartapi.service.SeedPlanUnitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class holds resources to provide {@link FacilityTypes} data. */
@RestController
@RequestMapping("/api/seed-plan-unit")
@Tag(name = "Seed Plan Unit", description = "Resource to retrieve data related to Seed Plan Unit")
public class SeedPlanUnitEndpoint {

  private SeedPlanUnitService seedPlanUnitService;

  SeedPlanUnitEndpoint(SeedPlanUnitService seedPlanUnitService) {
    this.seedPlanUnitService = seedPlanUnitService;
  }

  /**
   * Retrieve a SPU object with a given SPU ID.
   *
   * @return an Optional {@link SpuDto} with all found result
   */
  @GetMapping(path = "/{spuId}")
  @Operation(
      summary = "Retrieve a SPU object with a given SPU ID",
      description =
          "Returns a data object that contains row data in the Seed_Plan_Unit table along with"
              + " additional data such as SPZ code.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Returns a SPU dto",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = SpuDto.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "404",
            description = "Not Found",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public SpuDto getSpuById(
      @PathVariable("spuId") @Parameter(description = "The Seed Plan Unit Id") String spuId) {

    return seedPlanUnitService.getSpuById(spuId);
  }
}
