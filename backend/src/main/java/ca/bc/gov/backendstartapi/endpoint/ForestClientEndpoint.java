package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.service.ForestClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Pattern;
import java.io.Serializable;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;

/** Controller for ForestClient-related endpoints. */
@RestController
@RequestMapping(path = "/api/forest-clients", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
@Slf4j
@Tag(name = "ForestClient", description = "The many agencies that work with the ministry.")
public class ForestClientEndpoint {

  private final ForestClientService forestClientService;

  ForestClientEndpoint(ForestClientService forestClientService) {
    this.forestClientService = forestClientService;
  }

  /**
   * Fetch a ForestClient by its identifier (either its number or its acronym).
   *
   * @param identifier the number that identifies the desired client
   * @return the forest with client number or acronym {@code identifier}, if one exists
   */
  @GetMapping(path = "/{identifier}")
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Fetch a ForestClient",
      description =
          """
              Returns the ForestClient identified by `identifier` (a number or an acronym),
              if there is one.""",
      responses = {
        @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = ForestClientDto.class))),
        @ApiResponse(responseCode = "404", content = @Content(schema = @Schema(hidden = true)))
      })
  public ResponseEntity<Serializable> fetchClient(
      @PathVariable("identifier")
          @Pattern(regexp = "^\\d{8}$|^\\w{1,8}$")
          @Parameter(
              name = "identifier",
              in = ParameterIn.PATH,
              description = "Number or acronym that identifies the client to be fetched.")
          String identifier) {
    try {
      var response = forestClientService.fetchClient(identifier).map(Serializable.class::cast);
      return ResponseEntity.of(response);
    } catch (HttpStatusCodeException e) {
      log.warn("External error while retrieving ForestClient " + identifier, e);
      return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
    }
  }

  /**
   * Fetch up to the 10 first ForestClient's locations by the client number.
   *
   * @param clientNumber the ForestClient identifier to fetch their locations
   * @return a list of {@link ForestClientLocationDto} containing the client's locations data
   */
  @GetMapping(path = "/{clientNumber}/locations")
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Fetch up to the 10 first locations of the ForestClient.",
      description =
          """
              Returns a list up to the 10 first locations associated with the ForestClient,
              identified by it's number.""",
      responses = {
        @ApiResponse(
            responseCode = "200"),
        @ApiResponse(responseCode = "404", content = @Content(schema = @Schema(hidden = true)))
      })
  public List<ForestClientLocationDto> fetchClientLocations(
      @PathVariable("clientNumber")
          @Pattern(regexp = "^\\d{8}$", message = "The value must be an 8-digit number")
          @Parameter(
              name = "clientNumber",
              in = ParameterIn.PATH,
              description = "Number that identifies the client to get the locations.",
              required = true)
          String clientNumber) {
    return forestClientService.fetchClientLocations(clientNumber);
  }

  /**
   * Fetch the ForestClient location based on the client number and location code.
   *
   * @param clientNumber the ForestClient identifier to fetch their location
   * @param locationCode the location code that identifies the location to be fetched
   * @return {@link ForestClientLocationDto} containing the client's location data
   */
  @GetMapping(path = "/{clientNumber}/location/{locationCode}")
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Fetch the location of the ForestClient.",
      description =
          """
              Returns a single location associated with the ForestClient, identified
              by it's number and location code""",
      responses = {
        @ApiResponse(
            responseCode = "200"),
        @ApiResponse(responseCode = "404", content = @Content(schema = @Schema(hidden = true)))
      })
  public ForestClientLocationDto fetchSingleClientLocation(
      @PathVariable("clientNumber")
          @Pattern(regexp = "^\\d{8}$", message = "The value must be an 8-digit number")
          @Parameter(
              name = "clientNumber",
              in = ParameterIn.PATH,
              description = "Number that identifies the client to get the locations.")
          String clientNumber,
      @PathVariable("locationCode")
          @Parameter(
              name = "locationCode",
              in = ParameterIn.PATH,
              description = "Number that identify the location."
          )
          String locationCode) {
    return forestClientService.fetchSingleClientLocation(clientNumber, locationCode);
  }
}
