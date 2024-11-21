package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.entity.Seedlot;
import ca.bc.gov.oracleapi.repository.SeedlotRepository;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes seedlot resources API. */
@RestController
@RequestMapping("/api/seedlot")
@Tag(name = "seedlot", description = "Resource to retrieve seedlot")
public class SeedlotEndpoint {

  private SeedlotRepository seedlotRepository;

  SeedlotEndpoint(SeedlotRepository seedlotRepository) {
    this.seedlotRepository = seedlotRepository;
  }

  /**
   * Retrieve a seedlot by seedlot number.
   *
   * @return A record of {@link Seedlot}.
   */
  @GetMapping(
      path = "/{seedlotNumber}",
      produces = "application/json")
  @Operation(
      summary = "Retrieve a seedlot by seedlot number",
      description = "Retrieve a seedlot by seedlot number ")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Returns a record of seedlot",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Seedlot.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public Seedlot getSeedlotBySeedlotNumber(
          @PathVariable
          @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Identifier of the seedlot.")
              String seedlotNumber
  ) {
    SparLog.info("Fetch a seedlot by seedlot number");
    SparLog.info(seedlotNumber);
    Seedlot seedlot = seedlotRepository.findSeedlotBySeedlotNumber(seedlotNumber);
    SparLog.info("{} valid seedlot found.", seedlot);

    return seedlot;
  }
}
