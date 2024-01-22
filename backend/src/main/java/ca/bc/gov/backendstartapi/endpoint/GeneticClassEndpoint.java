package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.service.GeneticClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.SchemaProperty;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** This class exposes resources to handle all genetic class codes. */
@RestController
@RequestMapping(path = "/api/genetic-classes", produces = "application/json")
@Tag(name = "GeneticClasses", description = "Resources to handle all genetic classes")
public class GeneticClassEndpoint {

  private GeneticClassService geneticClassService;

  GeneticClassEndpoint(GeneticClassService geneticClassService) {
    this.geneticClassService = geneticClassService;
  }

  /**
   * Get all genetic class.
   *
   * @return A list of {@link GeneticClassEntity}
   */
  @GetMapping(produces = "application/json")
  @Operation(
      summary = "Retrieves all genetic class",
      description = "Returns a list containing all genetic class.")
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
                                  description = "This object represents a genetic class code",
                                  example = "A")),
                      @SchemaProperty(
                          name = "description",
                          schema =
                              @Schema(
                                  type = "string",
                                  description = "The description of a genetic class",
                                  example = "Orchard Seed or Cuttings"))
                    })),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public List<CodeDescriptionDto> getAllGeneticClass() {
    return geneticClassService.getAllGeneticClass();
  }

  /**
   * Gets a genetic class object by its code.
   *
   * @param code Identification of the genetic class.
   * @return A {@link GeneticClassEntity} if found, 404 otherwise
   * @throws ResponseStatusException if the class doesn't exist
   */
  @GetMapping(path = "/{code}", produces = "application/json")
  @Operation(
      summary = "Fetch a genetic class object by its code",
      description = "Returns the genetic class identified by `code`, if there is one.",
      responses = {
        @ApiResponse(responseCode = "200"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(responseCode = "404", content = @Content(schema = @Schema(hidden = true)))
      })
  public CodeDescriptionDto getOrchardById(
      @PathVariable
          @Parameter(
              name = "code",
              in = ParameterIn.PATH,
              required = true,
              description = "Identifier of the genetic class.")
          @NonNull
          String code) {
    return geneticClassService.getGeneticClassByCode(code);
  }
}
