package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.exception.NotFoundException;
import ca.bc.gov.backendstartapi.service.ForestClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.server.ResponseStatusException;

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
  public ForestClientDto fetchClient(
      @PathVariable("identifier")
          @Pattern(regexp = "^\\d{8}$|^\\w{1,8}$")
          @Parameter(
              name = "identifier",
              in = ParameterIn.PATH,
              description = "Number or acronym that identifies the client to be fetched.")
          String identifier) {
    try {
      return forestClientService.fetchClient(identifier).orElseThrow(NotFoundException::new);
    } catch (HttpStatusCodeException e) {
      log.error(
          "Error while fetching from ForestClient! Message: {}, Status code:",
          e.getResponseBodyAsString(),
          e.getStatusCode());
      throw new ResponseStatusException(HttpStatusCode.valueOf(400));
    }
  }
}
