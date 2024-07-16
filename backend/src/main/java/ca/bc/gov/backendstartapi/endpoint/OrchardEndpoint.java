package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import ca.bc.gov.backendstartapi.service.OrchardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** This class exposes endpoints for fetching Orchard related information. */
@RestController
@RequestMapping(path = "/api/orchards", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Orchards")
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
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
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
   * Get all parent trees under a species (VegCode).
   *
   * @return A list of {@link ParentTreeDto}
   */
  @GetMapping(path = "/parent-trees/vegetation-codes/{vegCode}", produces = "application/json")
  @Operation(
      summary = "Retrieves all parent trees under a species (VegCode)",
      description = "Returns a list containing all parent trees under a species (VegCode).")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "An array of parent tree dto.",
            content =
                @Content(
                    array =
                        @ArraySchema(schema = @Schema(implementation = SameSpeciesTreeDto.class)),
                    mediaType = "application/json")),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public List<SameSpeciesTreeDto> getAllParentTreeByVegCode(
      @PathVariable("vegCode")
          @Pattern(regexp = "^[a-zA-Z]{1,8}$")
          @Parameter(
              name = "vegCode",
              in = ParameterIn.PATH,
              description = "Identifier of the Orchard.")
          String vegCode) {
    return orchardService.findParentTreesByVegCode(vegCode);
  }
}
