package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.LatLongRequestDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeLatLongDto;
import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
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
   * @return A List of {@link ParentTreeLatLongDto} containing the result rows.
   */
  @PostMapping("/lat-long-elevation")
  @Operation(
      summary = "Request lat long for a Parent Tree ID list",
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
  public List<ParentTreeLatLongDto> getLatLongParentTreeData(
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "A list of Parent Tree id to fetch lat and long data.",
              required = true)
          @RequestBody
          List<LatLongRequestDto> ptIds) {
    return parentTreeService.getLatLongParentTreeData(ptIds);
  }
}
