package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.AreaOfUseDto;
import ca.bc.gov.backendstartapi.dto.SpzDto;
import ca.bc.gov.backendstartapi.entity.FundingSource;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import ca.bc.gov.backendstartapi.service.AreaOfUseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
   * Retrieve a list of SPZ under a vegetation code.
   *
   * @return A list of {@link SpzDto} with all found result.
   */
  @GetMapping("/spz-list/vegetation-code/{vegCode}")
  @Operation(
      summary = "Get a list of Seed Plan Zone with a given vegetation code",
      description = "Retrieve a list of SPZ that is under a vegetation code.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully returned a list of SPZ under a vegetation code.",
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
  public List<SpzDto> getSpzByVegCode(
      @PathVariable
          @Parameter(name = "vegCode", in = ParameterIn.PATH, description = "The vegetation code.")
          String vegCode) {

    SparLog.info("Received request to fetch all SPZs for vegetation code: {}", vegCode);

    return areaOfUseService.getSpzByVegCode(vegCode.toUpperCase());
  }

  /**
   * Get SPZ and SPU-geospatial information.
   *
   * @param spuId A seed plan unit id.
   * @return A {@link SpzSpuGeoDto} containing the results.
   */
  @GetMapping(path = "/spu/{spuId}", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Get area of use information given an SPU id",
      description = "Fetch geospatial data for the SPU along with a list of SPZ information.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "A data object containing information found."),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public AreaOfUseDto getAreaOfUseData(
      @Parameter(description = "The SPU (Seed Planning Unit) ID") @PathVariable("spuId")
          Integer spuId) {
    return areaOfUseService.calcAreaOfUseData(spuId);
  }
}
