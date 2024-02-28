package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.LatLongRequestDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeLatLongDto;
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
@Tag(name = "Parent Trees", description = "")
@RestController
@RequestMapping("/api/parent-trees")
@RequiredArgsConstructor
public class ParentTreeEndpoint {

  private final ParentTreeService parentTreeService;

  /**
   * Gets latitude, longite and elevation data for each parent tree given a list of orchard ids.
   *
   * @param orchardIds The {@link Orchard} identification list.
   * @return A List of {@link ParentTreeOrchardDto} containing the result rows.
   */
  @PostMapping("/lat-long-elevation")
  @Operation(
      summary = "",
      description = "",
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
              description = "A list of orchard id to fetch lat and long.",
              required = true)
          @RequestBody
          List<LatLongRequestDto> ptreeIds) {
    return parentTreeService.getLatLongElevation(ptreeIds);
  }
}
