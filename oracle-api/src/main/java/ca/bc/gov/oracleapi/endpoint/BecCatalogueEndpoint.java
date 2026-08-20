package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.BecCatalogueDto;
import ca.bc.gov.oracleapi.repository.SparBecCatalogueRepository;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Exposes the BEC biogeoclimatic catalogue for B-class seedlot zone selection. */
@RestController
@RequestMapping("/api/bec-catalogue")
@Tag(name = "becCatalogue", description = "Resource to retrieve BEC zone / subzone / variant combinations")
@RequiredArgsConstructor
public class BecCatalogueEndpoint {

  private final SparBecCatalogueRepository sparBecCatalogueRepository;

  /**
   * Returns all active (non-expired) BEC zone / subzone / variant rows from
   * {@code SPAR_BIOGEOCLIMATIC_CATALOGUE}, ordered by zone → subzone → variant.
   * The frontend filters this flat list client-side to build cascading zone,
   * subzone, and variant dropdowns.
   */
  @GetMapping(produces = "application/json")
  @Operation(
      summary = "Retrieve all active BEC catalogue entries",
      description =
          "Returns every non-expired row from SPAR_BIOGEOCLIMATIC_CATALOGUE ordered by"
              + " zone, subzone, and variant. Variant is null for zone/subzone combos"
              + " that have no variant.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "List of active BEC catalogue entries.",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = BecCatalogueDto.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public List<BecCatalogueDto> getAllActive() {
    SparLog.info("Fetching all active BEC catalogue entries");
    List<BecCatalogueDto> results = sparBecCatalogueRepository.findAllActive();
    SparLog.info("{} active BEC catalogue entries found.", results.size());
    return results;
  }
}
