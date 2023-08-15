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

/** Controller for forest client-related endpoints. */
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
   * Fetch a forest client by its identifier (either its number or its acronym).
   *
   * @param identifier the number that identifies the desired client
   * @return the forest with client number or acronym {@code identifier}, if one exists
   */
  @GetMapping(path = "/{identifier}")
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Fetch a forest client",
      description =
          """
              Returns the forest client identified by `identifier` (a number or an acronym),
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
      log.warn("External error while retrieving forest client " + identifier, e);
      return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
    }
  }

  /**
   * Fetch up to the 10 first forest client locations by the client number.
   *
   * @param number the number that identifies the client to fetch the locations
   * @return the forest client locations
   */
  @GetMapping(path = "/{number}/locations")
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Fetch up to the 10 first locations of the forest client.",
      description =
          """
              Returns a list up to the 10 first locations associated with the forest client,
              identified by it's number.""",
      responses = {
        @ApiResponse(
            responseCode = "200"),
        @ApiResponse(responseCode = "404", content = @Content(schema = @Schema(hidden = true)))
      })
  public List<ForestClientLocationDto> fetchClientLocations(
      @PathVariable("number")
          @Pattern(regexp = "^\\d{8}$", message = "The value must an 8-digit number")
          @Parameter(
              name = "number",
              in = ParameterIn.PATH,
              description = "Number that identifies the client to get the locations.",
              required = true)
          String number) {
    return forestClientService.fetchClientLocations(number);
  }
}
