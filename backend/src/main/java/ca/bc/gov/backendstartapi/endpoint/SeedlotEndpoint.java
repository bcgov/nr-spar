package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.response.DefaultSpringExceptionResponse;
import ca.bc.gov.backendstartapi.response.ValidationExceptionResponse;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class contains resources for handling {@link Seedlot} operations. */
@RestController
@RequestMapping(path = "/api/seedlots", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(
    name = "Seedlots",
    description = "This class contains resources for handling `Seedlot` operations.")
public class SeedlotEndpoint {

  private final SeedlotService seedlotService;

  /**
   * Created a new Seedlot in the system.
   *
   * @param createDto A {@link SeedlotCreateDto} containig all required field to get a new
   *     registration started.
   * @return A {@link SeedlotCreateResponseDto} with all created values.
   */
  @PostMapping(consumes = MimeTypeUtils.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('user_write')")
  @Operation(
      summary = "Creates a Seedlot",
      description = """
          Creates a Seedlot with minimum required fields.
          """)
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "The Seedlot entity was successfully created"),
        @ApiResponse(
            responseCode = "400",
            description = "One or more fields has invalid values.",
            content =
                @Content(
                    mediaType = "application/json",
                    schema =
                        @Schema(
                            oneOf = {
                              ValidationExceptionResponse.class,
                              DefaultSpringExceptionResponse.class
                            }))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public ResponseEntity<SeedlotCreateResponseDto> createSeedlot(
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "Body containing minimum required fields to create a seedlot",
              required = true)
          @RequestBody
          @Valid
          SeedlotCreateDto createDto) {
    SeedlotCreateResponseDto response = seedlotService.createSeedlot(createDto);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
}
