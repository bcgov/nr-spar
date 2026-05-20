package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.GermCountDto;
import ca.bc.gov.oracleapi.response.ApiAuthResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.GermCountService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes germination count resources API. */
@RestController
@RequestMapping("/api/germ-counts")
@RequiredArgsConstructor
@Validated
@Tag(name = "Germination Counts", description = "Resource to retrieve daily germination count data.")
public class GermCountEndpoint {

  private final GermCountService germCountService;

  /**
   * Retrieves the daily germination count record for a given RIA_SKEY.
   *
   * @param riaSkey the request item activity key
   * @return the germination count data for the test
   */
  @GetMapping("/{riaSkey}")
  @ResponseStatus(HttpStatus.OK)
  @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved germination count data.",
      content = @Content(schema = @Schema(implementation = GermCountDto.class))
  )
  @ApiResponse(responseCode = "404", description = "No germination count data found for the given RIA_SKEY.")
  @ApiAuthResponse
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public GermCountDto getGermCounts(@PathVariable BigDecimal riaSkey) {
    return germCountService.getGermCounts(riaSkey);
  }
}
