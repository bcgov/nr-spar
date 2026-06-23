package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.entity.NumberTreesCollectedCodeEntity;
import ca.bc.gov.oracleapi.repository.NumberTreesCollectedCodeRepository;
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

/** This class exposes number of trees collected from code table resources API. */
@RestController
@RequestMapping("/api/number-trees-collected")
@Tag(
    name = "numberTreesCollected",
    description = "Resource to retrieve Number of Trees Collected From codes (B-class)")
public class NumberTreesCollectedEndpoint {

  private final NumberTreesCollectedCodeRepository numberTreesCollectedCodeRepository;

  NumberTreesCollectedEndpoint(NumberTreesCollectedCodeRepository numberTreesCollectedCodeRepository) {
    this.numberTreesCollectedCodeRepository = numberTreesCollectedCodeRepository;
  }

  /**
   * Retrieve all valid number of trees collected from codes.
   *
   * @return A list of {@link NumberTreesCollectedCodeEntity} with all found result.
   */
  @GetMapping(produces = "application/json")
  @Operation(
      summary = "Retrieve non-expired number of trees collected from codes",
      description =
          "Retrieve all valid (non expired) codes based on effectiveDate "
              + "and expiryDate, where 'today >= effectiveDate' and 'today < expiryDate'.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description =
                "Returns a list containing all valid (non expired) number of trees collected from"
                    + " codes",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = NumberTreesCollectedCodeEntity.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public List<NumberTreesCollectedCodeEntity> getAllValidNumberTreesCollected() {
    SparLog.info("Fetching all valid number of trees collected from codes");

    List<NumberTreesCollectedCodeEntity> resultList = numberTreesCollectedCodeRepository.findAllValid();
    SparLog.info("{} valid number of trees collected from codes found.", resultList.size());

    return resultList;
  }
}
