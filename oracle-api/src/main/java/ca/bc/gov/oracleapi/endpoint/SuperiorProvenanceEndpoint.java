package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.SuperiorProvenanceDto;
import ca.bc.gov.oracleapi.repository.SuperiorProvenanceRepository;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Resources for B+ superior provenance reference data from Oracle. */
@RestController
@RequestMapping(path = "/api/superior-provenances", produces = "application/json")
@Tag(
    name = "superiorProvenances",
    description = "B+ superior provenance options by species vegetation code.")
public class SuperiorProvenanceEndpoint {

  private final SuperiorProvenanceRepository superiorProvenanceRepository;

  SuperiorProvenanceEndpoint(SuperiorProvenanceRepository superiorProvenanceRepository) {
    this.superiorProvenanceRepository = superiorProvenanceRepository;
  }

  /**
   * Lists valid superior provenance options for a species.
   *
   * @param vegetationCode species vegetation code filter
   * @return matching provenance rows, possibly empty
   */
  @GetMapping
  @Operation(
      summary = "List superior provenances by vegetation code",
      description =
          "Returns non-expired B+ superior provenance rows for the given species vegetation code.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Matching provenance rows (may be empty).",
            content =
                @Content(
                    array =
                        @ArraySchema(
                            schema = @Schema(implementation = SuperiorProvenanceDto.class)))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public List<SuperiorProvenanceDto> findByVegetationCode(
      @RequestParam("vegetationCode")
          @Parameter(
              name = "vegetationCode",
              in = ParameterIn.QUERY,
              required = true,
              description = "Species vegetation code.",
              example = "FDC")
          @NonNull
          String vegetationCode) {
    SparLog.info("Fetching superior provenances for vegetation code {}", vegetationCode);

    List<SuperiorProvenanceDto> results =
        superiorProvenanceRepository.findValidByVegetationCode(vegetationCode.toUpperCase());
    SparLog.info(
        "{} superior provenances found for vegetation code {}", results.size(), vegetationCode);

    return results;
  }
}
