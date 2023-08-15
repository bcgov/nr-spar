package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.GameticMethodologyDto;
import ca.bc.gov.backendstartapi.service.GameticMethodologyService;
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

/** Endpoints to fetch {@link GameticMethodologyDto}. */
@RestController
@RequestMapping("/api/gametic-methodologies")
@Tag(name = "GameticMethodologies")
public class GameticMethodologyEndpoint {

  private GameticMethodologyService gameticMethodologyService;

  GameticMethodologyEndpoint(GameticMethodologyService gameticMethodologyService) {
    this.gameticMethodologyService = gameticMethodologyService;
  }

  /**
   * Get all male/female methodologies.
   *
   * @return A list of {@link GameticMethodologyDto}
   */
  @GetMapping
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Retrieves all male and female gametic methodologies",
      description =
          """
      Returns a list of gametic methodology with helpful boolean indicators.
      The code field starts with a character (M/F) that indicate the sex of
      the methodology, this is a legacy from the oracle database.
      It is recommeneded to use the isFemaleMethodology flag instead.
      """)
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
                          name = "isFemaleMethodology",
                          schema =
                              @Schema(
                                  type = "boolean",
                                  description =
                                      "Indicate whether this methodology is applicable to female",
                                  example = "false")),
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
  public List<GameticMethodologyDto> getAllMaleFemaleMethodologies() {
    return gameticMethodologyService.getAllGameticMethodologies();
  }
}
