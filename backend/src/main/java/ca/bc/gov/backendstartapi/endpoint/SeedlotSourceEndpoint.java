package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.service.SeedlotSourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.SchemaProperty;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints to fetch {@link SeedlotSourceEntity}. */
@RestController
@RequestMapping(path = "/api/seedlot-sources", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@Tag(name = "SeedlotSources")
public class SeedlotSourceEndpoint {

  private SeedlotSourceService seedlotSourceService;

  SeedlotSourceEndpoint(SeedlotSourceService seedlotSourceService) {
    this.seedlotSourceService = seedlotSourceService;
  }

  /**
   * Get all seedlot source.
   *
   * @return A list of {@link SeedlotSourceEntity}
   */
  @GetMapping(produces = "application/json")
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Retrieves all seedlot source",
      description = "Returns a list containing all seedlot source.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "An array of objects containing code and description for each value.",
            content =
                @Content(
                    array = @ArraySchema(schema = @Schema(type = "object")),
                    mediaType = "application/json",
                    schemaProperties = {
                      @SchemaProperty(
                          name = "code",
                          schema =
                              @Schema(
                                  type = "string",
                                  description = "This object represents a seedlot source",
                                  example = "CUS")),
                      @SchemaProperty(
                          name = "description",
                          schema =
                              @Schema(
                                  type = "string",
                                  description = "Name of a seedlot source",
                                  example = "Custom Lot"))
                    })),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public List<CodeDescriptionDto> getAllSeedlotSource() {
    return seedlotSourceService.getAllSeedlotSource();
  }
}
