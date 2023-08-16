package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.ListItemDto;
import ca.bc.gov.backendstartapi.dto.OrchardLotTypeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeDto;
import ca.bc.gov.backendstartapi.entity.Orchard;
import ca.bc.gov.backendstartapi.service.OrchardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** This class contains resources to handle Orchards. */
@RestController
@RequestMapping("/api/orchards")
@Tag(
    name = "orchard",
    description = "A location where class A seed or class A cuttings are produced.")
@Slf4j
public class OrchardEndpoint {

  private OrchardService orchardService;

  OrchardEndpoint(OrchardService orchardService) {
    this.orchardService = orchardService;
  }

  /**
   * Gets an Orchard by its code.
   *
   * @param id Identification of the Orchard.
   * @return A {@link Orchard} if found, 404 otherwise
   * @throws ResponseStatusException if the Orchard doesn't exist
   */
  @GetMapping(path = "/{id}", produces = "application/json")
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Fetch an orchard by its identifier",
      description = "Returns the orchard identified by `id`, if there is one.",
      responses = {
        @ApiResponse(responseCode = "200"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(responseCode = "404", content = @Content(schema = @Schema(hidden = true)))
      })
  public OrchardLotTypeDescriptionDto getOrchardById(
      @PathVariable
          @Parameter(name = "id", in = ParameterIn.PATH, description = "Identifier of the orchard.")
          String id) {
    Optional<OrchardLotTypeDescriptionDto> orchardLotType =
        orchardService.findNotRetiredOrchardValidLotType(id);

    return orchardLotType.orElseThrow(
        () ->
            new ResponseStatusException(
                HttpStatus.NOT_FOUND, String.format("Orchard %s not found.", id)));
  }

  /**
   * Gets {@link ca.bc.gov.backendstartapi.entity.ParentTree} data to an {@link Orchard}.
   *
   * @param orchardId {@link Orchard}'s identification
   * @param spuId Seed Planning Unit's identification
   * @return an {@link OrchardParentTreeDto}
   * @throws ResponseStatusException if no data is found
   */
  @GetMapping(
      path = "/parent-tree-genetic-quality/{orchardId}/{spuId}",
      produces = "application/json")
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
          String orchardId,
      @PathVariable
          @Parameter(
              name = "spuId",
              in = ParameterIn.PATH,
              description = "Identifier of the Seed Planning Unit")
          Long spuId) {
    Optional<OrchardParentTreeDto> parentTreeDto =
        orchardService.findParentTreeGeneticQualityData(orchardId, spuId);

    return parentTreeDto.orElseThrow(
        () ->
            new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                String.format(
                    "Orchard Parent Tree data not found for Orchard ID %s and SPU ID %d.",
                    orchardId, spuId)));
  }

  /**
   * Consumed by backend (postgres) service to retrieve a list of orchards with a vegCode.
   *
   * @param vegCode an {@link Orchard}'s vegCode
   * @return an {@link List} of {@link OrchardLotTypeDescriptionDto}
   * @throws ResponseStatusException if error occurs
   */
  @GetMapping(path = "/vegetation-code/{vegCode}", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Fetch the orchards with the provided vegCode.",
      description =
          "Returns a list of non retired orchards, it should be called from the new SPAR back-end"
              + " only, AVOID using it on the front-end",
      responses = {
        @ApiResponse(responseCode = "200"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(responseCode = "404", content = @Content(schema = @Schema(hidden = true)))
      })
  public List<OrchardLotTypeDescriptionDto> getOrchardsByVegCode(
      @PathVariable("vegCode") @Parameter(description = "The vegetation code of an orchard.")
          String vegCode) {
    log.info("Received GET request for orchards with vegCode: " + vegCode);
    return orchardService
        .findNotRetOrchardsByVegCode(vegCode)
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    String.format("Orchards not found with vegCode: %s.", vegCode)));
  }

  /**
   * Consumed by backend (postgres) service to retrieve a list of parent trees with a vegCode.
   *
   * @param vegCode an {@link Orchard}'s vegCode
   * @return an {@link List} of {@link ParentTreeDto}
   * @throws ResponseStatusException if error occurs
   */
  @GetMapping(path = "/parent-trees/vegetation-codes/{vegCode}")
  @PreAuthorize("hasRole('user_read')")
  public ResponseEntity<List<ListItemDto>> findParentTreesWithVegCode(
      @PathVariable("vegCode") @Parameter(description = "The vegetation code of an orchard.")
          String vegCode) {
    try {
      // NEXT: validate the information against the seedlot's orchard
      //   All trees on the table must belong to the seedlot's orchard.
      return ResponseEntity.ok(orchardService.findParentTreesWithVegCode(vegCode));
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }
}
