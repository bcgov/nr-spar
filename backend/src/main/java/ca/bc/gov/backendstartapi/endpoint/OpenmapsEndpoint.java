package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import ca.bc.gov.backendstartapi.service.OpenmapsProxyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authenticated pass-through for DataBC OpenMaps JSON used by the seedlot map (WFS GetFeature and
 * WMS GetLegendGraphic). The upstream host is fixed in {@link OpenmapsProxyService}.
 */
@RestController
@RequestMapping(path = "/api/openmaps", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "OpenMaps", description = "Allowlisted proxy for DataBC OpenMaps JSON")
public class OpenmapsEndpoint {

  private final OpenmapsProxyService openmapsProxyService;

  OpenmapsEndpoint(OpenmapsProxyService openmapsProxyService) {
    this.openmapsProxyService = openmapsProxyService;
  }

  /**
   * Forward a validated OpenMaps WFS/WMS JSON query. Query parameters match the public GeoServer
   * names ({@code service}, {@code request}, {@code typeNames} / {@code layer}, {@code CQL_FILTER},
   * etc.).
   */
  @GetMapping
  @Operation(
      summary = "Proxy an OpenMaps JSON request",
      description =
          "Forwards WFS GetFeature or WMS GetLegendGraphic to openmaps.gov.bc.ca after validating "
              + "the service, request type, layer name, and query parameters. SPAR credentials are "
              + "not sent upstream.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Upstream GeoJSON or legend JSON"),
        @ApiResponse(
            responseCode = "400",
            description = "Query failed allowlist validation",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "502",
            description = "OpenMaps returned an error",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "504",
            description = "OpenMaps timed out",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public String proxy(@RequestParam MultiValueMap<String, String> query) {
    return openmapsProxyService.forward(query);
  }
}
