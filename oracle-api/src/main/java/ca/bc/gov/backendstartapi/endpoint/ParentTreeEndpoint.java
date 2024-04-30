package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
import ca.bc.gov.backendstartapi.security.AccessLevel;
import ca.bc.gov.backendstartapi.security.AccessLevelRequired;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import ca.bc.gov.backendstartapi.service.ParentTreeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes resources for handling {@link ParentTreeEntity} records. */
@Tag(
    name = "Parent Trees",
    description = "The geographic location of a each Parent Tree sourced from a natural stand.")
@RestController
@RequestMapping("/api/parent-trees")
@RequiredArgsConstructor
public class ParentTreeEndpoint {

  private final ParentTreeService parentTreeService;

  /**
   * Gets latitude, longitude and elevation data for each parent tree given a list of parent tree
   * ids.
   *
   * @param ptIds The {@link ParentTreeEntity} identification list.
   * @return A List of {@link GeospatialRespondDto} containing the result rows.
   */
  @PostMapping("/geospatial-data")
  @Operation(
      summary = "Request geospatial data for a Parent Tree ID list",
      description = "Fetches all lat, long and elevation data given a list of Parent Tree IDs.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "List with found records or an empty list"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({
    @AccessLevel(role = "SPAR_TSC_ADMIN", crudAccess = 'R'),
    @AccessLevel(role = "SPAR_MINISTRY_ORCHARD", crudAccess = 'R'),
    @AccessLevel(role = "SPAR_NONMINISTRY_ORCHARD", crudAccess = 'R')
  })
  @AccessLevelRequired('R')
  public List<GeospatialRespondDto> getPtGeoSpatialData(
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "A list of Parent Tree id to fetch geospatial data.",
              required = true)
          @RequestBody
          List<GeospatialRequestDto> ptIds) {
    return parentTreeService.getPtGeoSpatialData(ptIds);
  }
}
