package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.service.SeedlotStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.SchemaProperty;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints to fetch {@link SeedlotStatusEnum}. */
@RestController
@RequestMapping(path = "/api/seedlot-statuses", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@Tag(name = "SeedlotStatuses")
public class SeedlotStatusEndpoint {
  private SeedlotStatusService seedlotStatusService;

  SeedlotStatusEndpoint(SeedlotStatusService seedlotStatusService) {
    this.seedlotStatusService = seedlotStatusService;
  }

  /**
   * Get all seedlot status.
   *
   * @return A list of {@link SeedlotStatusEntity}
   */
  @GetMapping(produces = "application/json")
  @Operation(
      summary = "Retrieves all seedlot status",
      description = "Returns a list containing all seedlot status.")
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
                                  description = "This object represents a seedlot status",
                                  example = "APP")),
                      @SchemaProperty(
                          name = "description",
                          schema =
                              @Schema(
                                  type = "string",
                                  description = "Meaning of the code",
                                  example = "Approved"))
                    })),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public List<CodeDescriptionDto> getAllSeedlotStatus() {
    return seedlotStatusService.getAllSeedlotStatus();
  }
}
