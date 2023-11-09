package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.service.ConeCollectionMethodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.SchemaProperty;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes resources to handle all cone collection method codes. */
@RestController
@RequestMapping("/api/cone-collection-methods")
@Tag(
    name = "ConeCollectionMethods",
    description = "Resources to handle all cone collection method codes")
public class ConeCollectionMethodEndpoint {

  private ConeCollectionMethodService coneCollectionMethodService;

  ConeCollectionMethodEndpoint(ConeCollectionMethodService coneCollectionMethodService) {
    this.coneCollectionMethodService = coneCollectionMethodService;
  }

  /**
   * Get all cone collection method codes.
   *
   * @return A list of {@link ConeCollectionMethodEntity}
   */
  @GetMapping(produces = "application/json")
  @Operation(
      summary = "Retrieves all cone collection method codes",
      description = "Returns a list containing all cone collection method codes.")
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
                                  description =
                                      "This object represents a cone collection method code",
                                  example = "1")),
                      @SchemaProperty(
                          name = "description",
                          schema =
                              @Schema(
                                  type = "string",
                                  description = "The code's meaning",
                                  example = "Aerial raking"))
                    })),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public List<CodeDescriptionDto> getAllConeCollectionMethods() {
    return coneCollectionMethodService.getAllConeCollectionMethods();
  }
}
