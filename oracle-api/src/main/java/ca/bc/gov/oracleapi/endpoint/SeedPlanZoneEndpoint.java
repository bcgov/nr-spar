package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.SeedPlanZoneCoastInteriorDto;
import ca.bc.gov.oracleapi.repository.SeedPlanZoneCodeRepository;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Pattern;
import java.util.Locale;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Resources for seed plan zone facts from Oracle. */
@RestController
@RequestMapping(path = "/api/seed-plan-zones", produces = "application/json")
@Validated
@Tag(name = "seedPlanZones", description = "Seed plan zone facts from Oracle.")
public class SeedPlanZoneEndpoint {

  private static final String COAST = "C";
  private static final String INTERIOR = "I";

  private final SeedPlanZoneCodeRepository seedPlanZoneCodeRepository;

  SeedPlanZoneEndpoint(SeedPlanZoneCodeRepository seedPlanZoneCodeRepository) {
    this.seedPlanZoneCodeRepository = seedPlanZoneCodeRepository;
  }

  /**
   * Classifies a seed plan zone as coast or interior, matching the legacy {@code
   * SPR_GET_SPZ_TYPE} function: coastal when listed under {@code COASTAL_ZONE_ST} in {@code
   * CODE_SUBSET_TBL}, otherwise interior.
   *
   * @param code seed plan zone code
   * @return the zone and its coast/interior code
   */
  @GetMapping("/{code}/coast-interior")
  @Operation(
      summary = "Coast or interior for a seed plan zone",
      description =
          """
          Returns C when the seed plan zone is coastal and I otherwise. Unknown zones are
          interior, as in the legacy SPR_GET_SPZ_TYPE function. Use the result as
          `coastInteriorCode` when searching transfer limits.""")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "The zone's coast/interior code.",
            content =
                @Content(schema = @Schema(implementation = SeedPlanZoneCoastInteriorDto.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid seed plan zone code",
            content = @Content(schema = @Schema(hidden = true))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(hidden = true)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public SeedPlanZoneCoastInteriorDto getCoastInterior(
      @PathVariable("code")
          @Parameter(
              in = ParameterIn.PATH,
              required = true,
              description = "Seed plan zone code.",
              example = "M")
          @Pattern(regexp = "[A-Za-z]{1,3}", message = "must be 1 to 3 letters")
          String code) {
    String spzCode = code.toUpperCase(Locale.ROOT);
    String coastInteriorCode =
        seedPlanZoneCodeRepository.isCoastalZone(spzCode) > 0 ? COAST : INTERIOR;
    SparLog.info("Seed plan zone {} is coast/interior {}", spzCode, coastInteriorCode);

    return new SeedPlanZoneCoastInteriorDto(spzCode, coastInteriorCode);
  }
}
