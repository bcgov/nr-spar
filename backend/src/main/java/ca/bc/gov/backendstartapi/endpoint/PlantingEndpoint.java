package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.SeedlotSpeciesDto;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import ca.bc.gov.backendstartapi.service.PlantingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * This class exposes planting related information to external applications.
 *
 * <p>Endpoints in this controller are intentionally gated with
 * {@link RoleAccessConfig#ANY_AUTHENTICATED} rather than SPAR roles: they are consumed by an
 * external application whose users authenticate through the same Cognito/IDIR pool but do not carry
 * SPAR roles. The exposed data (seedlot number + species) is non-sensitive reference data.
 * Replace the marker with specific roles (or add a dedicated group) if access ever needs to be
 * narrowed.
 */
@RestController
@RequestMapping(path = "/api/planting", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Planting", description = "Resource for external consumers to resolve planting data")
public class PlantingEndpoint {

  private final PlantingService plantingService;

  PlantingEndpoint(PlantingService plantingService) {
    this.plantingService = plantingService;
  }

  /**
   * Fetch the seedlot and species (vegetation code) for a request key.
   *
   * @param requestKey the request key to look up
   * @return the {@link SeedlotSpeciesDto} mapped to the request key
   * @throws ResponseStatusException with 404 status when the request key does not exist
   */
  @GetMapping("/request-key/{requestKey}")
  @Operation(
      summary = "Fetch the seedlot and species by request key",
      description =
          "Returns the seedlot number and species (vegetation code) mapped to a valid request"
              + " key. A request key maps to exactly one seedlot (1:1).",
      responses = {
        @ApiResponse(responseCode = "200"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(responseCode = "404", content = @Content(schema = @Schema(hidden = true)))
      })
  @RoleAccessConfig({RoleAccessConfig.ANY_AUTHENTICATED})
  public SeedlotSpeciesDto getSeedlotAndSpeciesByRequestKey(
      @PathVariable
          @Parameter(
              name = "requestKey",
              in = ParameterIn.PATH,
              description = "The request key to resolve to a seedlot and species.")
          Long requestKey) {
    return plantingService.getSeedlotAndSpeciesByRequestKey(requestKey);
  }
}
