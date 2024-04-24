package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.service.GeneticWorthService;
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

/** This class exposes resources to handle all genetic worths. */
@RestController
@RequestMapping(path = "/api/genetic-worth", produces = "application/json")
@Tag(name = "GeneticWorth", description = "Resources to handle all genetic worths.")
public class GeneticWorthEndpoint {

  private GeneticWorthService geneticWorthService;

  GeneticWorthEndpoint(GeneticWorthService geneticWorthService) {
    this.geneticWorthService = geneticWorthService;
  }

  /**
   * Get all genetic worth.
   *
   * @return A list of {@link GeneticWorthEntity}
   */
  @GetMapping(produces = "application/json")
  @Operation(
      summary = "Retrieves all genetic worth",
      description = "Returns a list containing all genetic worth.")
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
                                  description = "This object represents a genetic worth code",
                                  example = "AD")),
                      @SchemaProperty(
                          name = "description",
                          schema =
                              @Schema(
                                  type = "string",
                                  description = "The description of a genetic worth",
                                  example = "Animal browse resistance (deer)"))
                    })),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public List<CodeDescriptionDto> getAllGeneticWorth() {
    return geneticWorthService.getAllGeneticWorth();
  }

  /**
   * Gets a genetic worth object by its code.
   *
   * @param code Identification of the genetic worth.
   * @return A {@link GeneticWorthEntity} if found, 404 otherwise
   * @throws ResponseStatusException if the class doesn't exist
   */
  @GetMapping(path = "/{code}", produces = "application/json")
  @Operation(
      summary = "Fetch a genetic worth object by its code",
      description = "Returns the genetic worth identified by `code`, if there is one.",
      responses = {
        @ApiResponse(responseCode = "200"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(responseCode = "404", content = @Content(schema = @Schema(hidden = true)))
      })
  public CodeDescriptionDto getGeneticWorthByCode(
      @PathVariable
          @Parameter(
              name = "code",
              in = ParameterIn.PATH,
              description = "Identifier of the genetic worth.",
              required = true)
          @NonNull
          String code) {
    return geneticWorthService.getGeneticWorthByCode(code);
  }
}
