package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.DrybackScreenDto;
import ca.bc.gov.oracleapi.response.ApiAuthResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.DrybackScreenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoint for the G64 Dryback Calculation screen.
 * Provides API operations for retrieving dryback activity data and moisture content test results.
 */
@RestController
@RequestMapping("/api/dryback")
@RequiredArgsConstructor
@Validated
@Tag(
    name = "Dryback Calculation",
    description = "Resource to manage G64 Dryback Calculation screen data"
)
public class DrybackScreenEndpoint {

  private final DrybackScreenService drybackScreenService;

  /**
   * Retrieves all data required to populate the G64 Dryback Calculation screen.
   * Includes the Request Item Activity (RIA) record with all dryback-related fields
   * and the current accepted Moisture Content (MC) test value (or null if no accepted test exists).
   * Returns previously saved dryback values without any recalculation.
   *
   * @param riaSkey the request item activity key
   * @return the dryback screen data for the activity
   */
  @GetMapping("/{riaSkey}")
  @Operation(
      summary = "Get Dryback Calculation screen data",
      description =
          "Retrieves all required data to populate the G64 Dryback Calculation screen "
              + "for a specified Request Item Activity. Includes the RIA record with dryback fields "
              + "and current accepted MC test value (if available)."
  )
  @ApiResponses({
      @ApiResponse(
          responseCode = "200",
          description = "Successfully retrieved dryback screen data",
          content = @Content(schema = @Schema(implementation = DrybackScreenDto.class))
      ),
      @ApiResponse(
          responseCode = "404",
          description = "Request Item Activity with the specified riaSkey not found"
      ),
      @ApiResponse(
          responseCode = "400",
          description = "Invalid or missing riaSkey parameter"
      )
  })
  @ApiAuthResponse
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public DrybackScreenDto getDrybackScreenData(
      @PathVariable
          @Positive
          @Parameter(
              name = "riaSkey",
              in = ParameterIn.PATH,
              description = "The Request Item Activity SKEY (unique numeric identifier)",
              example = "7338",
              required = true
          )
          BigDecimal riaSkey
  ) {
    SparLog.info("Retrieving dryback screen data for riaSkey: {}", riaSkey);
    return drybackScreenService.getDrybackScreenData(riaSkey);
  }
}
