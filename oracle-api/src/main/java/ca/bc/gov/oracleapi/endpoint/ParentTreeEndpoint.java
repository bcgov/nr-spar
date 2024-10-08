package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.dto.GeospatialRequestDto;
import ca.bc.gov.oracleapi.dto.GeospatialRespondDto;
import ca.bc.gov.oracleapi.dto.ParentTreeByVegCodeDto;
import ca.bc.gov.oracleapi.entity.ParentTreeEntity;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.ParentTreeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public List<GeospatialRespondDto> getPtGeoSpatialData(
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "A list of Parent Tree id to fetch geospatial data.",
              required = true)
          @RequestBody
          List<GeospatialRequestDto> ptIds) {
    return parentTreeService.getPtGeoSpatialData(ptIds);
  }

  /**
   * Consumed by backend (postgres) service to retrieve a list of parent trees with a vegCode.
   *
   * @param vegCode a Seedlot's vegCode
   * @return an {@link List} of Map<{@link String}, {@link ParentTreeByVegCodeDto}> with parent tree
   *     number as the key.
   * @throws ResponseStatusException if error occurs
   */
  @GetMapping("/vegetation-codes/{vegCode}")
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public Map<String, ParentTreeByVegCodeDto> findParentTreesWithVegCode(
      @PathVariable("vegCode")
          @Parameter(description = "The vegetation code of an orchard.")
          @Pattern(regexp = "^[a-zA-Z]{1,8}$")
          String vegCode) {

    return parentTreeService.findParentTreesWithVegCode(vegCode.toUpperCase());
  }
}
