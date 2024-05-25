package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SpzDto;
import ca.bc.gov.backendstartapi.entity.FundingSource;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import ca.bc.gov.backendstartapi.service.AreaOfUseService;
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
@RequestMapping("/api/area-of-use")
@Tag(name = "AreaOfUse", description = "Resource to retrieve Area of Use data.")
public class AreaOfUseEndpoint {

  private AreaOfUseService areaOfUseService;

  AreaOfUseEndpoint(AreaOfUseService areaOfUseService) {
    this.areaOfUseService = areaOfUseService;
  }

  /**
   * Retrieve a list of SPZ under tested parent tree area of use.
   *
   * @return A list of {@link SpzDto} with all found result.
   */
  @GetMapping("/tested-parent-trees/spz-list")
  @Operation(
      summary = "Get a list of Seed Plan Zone",
      description = "Retrieve a list of SPZ under tested parent tree area of use.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description =
                "Successfully returned a list of SPZ under tested parent tree area of use.",
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
  public List<SpzDto> getAllSpz() {
    SparLog.info("Recevied request to fetch all SPZs for tested parent trees.");

    return areaOfUseService.getAllSpz();
  }
}
