package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.MaleFemaleMethodologyEnum;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints to fetch {@link MaleFemaleMethodologyEnum}. */
@RestController
@RequestMapping("/api/male-female-methodologies")
@Tag(name = "MaleFemaleMethodologies")
public class MaleFemaleMethodologyEndpoint {
  /**
   * Get all male/female methodologies.
   *
   * @return A list of {@link MaleFemaleMethodologyEnum}
   */
  @GetMapping
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Retrieves all male and female gametic methodologies",
      description = "Returns a list containing all male and female gametic methodologies.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "An array of objects containing code, description and isPliSpecies.",
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
                                  description = "This string represents a methodology code",
                                  example = "M1")),
                      @SchemaProperty(
                          name = "description",
                          schema =
                              @Schema(
                                  type = "string",
                                  description = "Describe the name of the methodology",
                                  example = "Portion of Ramets in Orchard")),
                      @SchemaProperty(
                          name = "isPliSpecies",
                          schema =
                              @Schema(
                                  type = "boolean",
                                  description =
                                      "Indicate whether this methodology is applicable to the"
                                          + " logepole pine species",
                                  example = "false"))
                    })),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public List<MaleFemaleMethodologyEnum> getAllMaleFemaleMethodologies() {
    return List.of(MaleFemaleMethodologyEnum.values());
  }
}
