package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.service.OrchardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Tag(name = "Orchard")
public class OrchardEndpoint {

  private OrchardService orchardService;

  @Autowired
  OrchardEndpoint(OrchardService orchardService) {
    this.orchardService = orchardService;
  }

  /**
   * Gets all ParentTree data to an Orchard.
   *
   * @param orchardId {@link Orchard}'s identification
   * @return an {@link OrchardParentTreeDto}
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
  public OrchardParentTreeDto getParentTreeGeneticQualityData(
      @PathVariable
          @Parameter(
              name = "orchardId",
              in = ParameterIn.PATH,
              description = "Identifier of the Orchard.")
          String orchardId) {
    return orchardService.findParentTreeGeneticQualityData(orchardId);
  }

  /**
   * Gets all orchards with vegCode
   *
   * @param vegCode {@link Orchard}'s identification
   * @return an {@link String}
   * @throws ResponseStatusException if no data is found
   */
  @GetMapping(path = "/vegetation-code/{vegCode}")
  @PreAuthorize("hasRole('user_read')")
  public List<OrchardDto> getOrchardsByVegCode(
      @PathVariable
          @Parameter(
              name = "vegCode",
              in = ParameterIn.PATH,
              description = "Identifier of the Orchard.")
          String vegCode) {
    List<OrchardDto> tempList = new ArrayList<OrchardDto>();
    return tempList;
  }
}
