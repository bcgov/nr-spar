package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.service.RequestLotService;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/request-seedlot-and-veglot")
@Tag(name = "CommitmentIndicator", description = "Resource to retrieve commitment indicator by request skey and item id")
public class RequestSeedlotAndVeglotEndpoint {

  private RequestLotService requestSeedlotAndVeglotService;

  RequestSeedlotAndVeglotEndpoint(RequestLotService requestSeedlotAndVeglotService) {
    this.requestSeedlotAndVeglotService = requestSeedlotAndVeglotService;
  }

  /**
   * Check commitment indicator.
   *
   * @return The commitment indicator for the given request skey and item id.
   */
  @GetMapping(
      path = "/commitment/{requestSkey}/{itemId}",
      produces = "application/json")
  @Operation(
      summary = "Retrieve commitment indicator by request skey and item id",
      description = "Retrieve commitment indicator by request skey and item id ")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Returns the commitment indicator for the given request skey and item id",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Boolean.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public boolean isCommitmentIndicatorYes(@PathVariable Long requestSkey, @PathVariable String itemId) {
    SparLog.info("Fetching commitment indicator for requestSkey {} and itemId {}", requestSkey, itemId);

    boolean commitmentChecked = requestSeedlotAndVeglotService.isCommitmentIndicatorYes(requestSkey, itemId);
    SparLog.info("Commitment indicator for requestSkey {} and itemId {}: {}", requestSkey, itemId, commitmentChecked);
    return commitmentChecked;
  }
}
