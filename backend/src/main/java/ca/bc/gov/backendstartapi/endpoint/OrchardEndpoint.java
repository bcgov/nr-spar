package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.service.OrchardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** This class exposes endpoints for fetching Orchard related information. */
@RestController
@RequestMapping(path = "/api/orchards", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Orchard")
public class OrchardEndpoint {

  private OrchardService orchardService;

  OrchardEndpoint(OrchardService orchardService) {
    this.orchardService = orchardService;
  }

  /**
   * Gets all ParentTree data to an Orchard.
   *
   * @param orchardId {@link Orchard}'s identification
   * @return an {@link OrchardSpuDto}
   * @throws ResponseStatusException if no data is found
   */
  @GetMapping(path = "/{orchardId}/parent-tree-genetic-quality")
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Fetch the parent tree contribution data to an Orchard.",
      description = "Returns all parent tree contribution table given an Orchard ID and SPU ID.",
      responses = {
        @ApiResponse(responseCode = "200"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(responseCode = "404", content = @Content(schema = @Schema(hidden = true)))
      })
  public OrchardSpuDto getParentTreeGeneticQualityData(
      @PathVariable
          @Parameter(
              name = "orchardId",
              in = ParameterIn.PATH,
              description = "Identifier of the Orchard.")
          String orchardId) {
    return orchardService.findParentTreeGeneticQualityData(orchardId);
  }

  /**
   * Gets all orchards with vegCode.
   *
   * @param vegCode {@link Orchard}'s identification
   * @return a {@link List} of {@link OrchardDto}
   * @throws ResponseStatusException if no data is found
   */
  @GetMapping(path = "/vegetation-code/{vegCode}")
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Fetch a list of orchard based on the provided vegCode",
      description =
          "Returns all non-retired orchards under the provided vegCode, this is a proxy that calls"
              + " oracle-api.",
      responses = {
        @ApiResponse(responseCode = "200"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(responseCode = "404", content = @Content(schema = @Schema(hidden = true)))
      })
  public List<OrchardDto> getOrchardsByVegCode(
      @PathVariable
          @Parameter(
              name = "vegCode",
              in = ParameterIn.PATH,
              description = "Identifier of the Orchard.")
          String vegCode) {
    return orchardService.findOrchardsByVegCode(vegCode);
  }
}
