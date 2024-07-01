package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.entity.FundingSource;
import ca.bc.gov.oracleapi.repository.FundingSourceRepository;
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

/** This class exposes funding sources resources API. */
@RestController
@RequestMapping("/api/funding-sources")
@Tag(name = "fundingSource", description = "Resource to retrieve Funding Source to Owners Agencies")
public class FundingSourceEndpoint {

  private FundingSourceRepository fundingSourceRepository;

  FundingSourceEndpoint(FundingSourceRepository fundingSourceRepository) {
    this.fundingSourceRepository = fundingSourceRepository;
  }

  /**
   * Retrieve all funding sources.
   *
   * @return A list of {@link FundingSource} with all found result.
   */
  @GetMapping(produces = "application/json")
  @Operation(
      summary = "Retrieve non-expired funding sources",
      description =
          "Retrieve all valid (non expired) funding source based on effectiveDate "
              + "and expiryDate, where 'today >= effectiveDate' and 'today < expiryDate'.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Returns a list containing all valid (non expired) funding sources",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = FundingSource.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public List<FundingSource> getAllValidFundingSources() {
    SparLog.info("Fetching all valid funding sources");

    List<FundingSource> resultList = fundingSourceRepository.findAllValid();
    SparLog.info("{} valid funding sources found.", resultList.size());

    return resultList;
  }
}
