package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.CsvTableParsingException;
import ca.bc.gov.backendstartapi.response.DefaultSpringExceptionResponse;
import ca.bc.gov.backendstartapi.response.ValidationExceptionResponse;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import ca.bc.gov.backendstartapi.service.parser.ConeAndPollenCountCsvTableParser;
import ca.bc.gov.backendstartapi.service.parser.SmpCalculationCsvTableParser;
import ca.bc.gov.backendstartapi.vo.parser.ConeAndPollenCount;
import ca.bc.gov.backendstartapi.vo.parser.SmpMixVolume;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/** This class contains resources for handling {@link Seedlot} operations. */
@RestController
@RequestMapping(path = "/api/seedlots", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(
    name = "Seedlots",
    description = "This class contains resources for handling `Seedlot` operations.")
public class SeedlotEndpoint {

  private final ConeAndPollenCountCsvTableParser contributionTableCsvParser;

  private final SmpCalculationCsvTableParser smpCalculationTableParser;

  private final SeedlotService seedlotService;

  /**
   * Parse the CSV table in {@code file} and return the data stored in it.
   *
   * @param file a CSV file containing the table to be parsed
   * @return a list with the data that has been parsed
   * @throws IOException in case of problems while accessing {@code file}'s content
   */
  @Operation(
      summary = "Upload a file containing a CSV table to be parsed",
      description =
          "Upload a file with a CSV table and parse it, returning a list of the table's content.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "A list with all the values parsed from the CSV table in `file`."),
        @ApiResponse(
            responseCode = "400",
            description = "Table doesn't match the format",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
      })
  @PostMapping(
      path = "/parent-trees-contribution/cone-pollen-count-table/upload",
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @PreAuthorize("hasRole('user_read')")
  public ResponseEntity<List<ConeAndPollenCount>> handleConeAndPollenCountTableUpload(
      @RequestParam("file")
          @Parameter(description = "The text file to be uploaded. It must contain a CSV table")
          MultipartFile file)
      throws IOException {
    try {
      // NEXT: validate the information against the seedlot's orchard
      //   All trees on the table must belong to the seedlot's orchard.
      return ResponseEntity.ok(contributionTableCsvParser.parse(getFileResource(file)));
    } catch (CsvTableParsingException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Parse CSV table in {@code file} and return the data stored in it.
   *
   * @param file a CSV file containing the table to be parsed
   * @return a list with the data that has been parsed
   * @throws IOException in case of problems while accessing {@code file}'s content
   */
  @Operation(
      summary = "Upload a file containing a CSV table to be parsed",
      description =
          "Upload a file with a CSV table and parse it, returning a list of the table's content.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "A list with all the values parsed from the CSV table in `file`."),
        @ApiResponse(
            responseCode = "400",
            description = "Table doesn't match the format",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
      })
  @PostMapping(
      path = "/parent-trees-contribution/smp-calculation-table/upload",
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @PreAuthorize("hasRole('user_read')")
  public ResponseEntity<List<SmpMixVolume>> handleSmpCalculationTableUpload(
      @RequestParam("file")
          @Parameter(description = "The text file to be uploaded. It must contain a CSV table")
          MultipartFile file)
      throws IOException {
    try {
      /*
       * NEXT:
       *   We must have the breeding values of all the trees (even those that don't belong to the
       *   seedlot's orchard).
       */
      return ResponseEntity.ok(smpCalculationTableParser.parse(getFileResource(file)));
    } catch (CsvTableParsingException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  private Resource getFileResource(MultipartFile file) {
    var resource = file.getResource();
    var filename = resource.getFilename();
    if (filename == null || !filename.substring(filename.lastIndexOf('.')).equals(".csv")) {
      throw new CsvTableParsingException("CSV files only");
    }
    return resource;
  }

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

  /**
   * Get information from a single seedlot.
   *
   * @param seedlotNumber the seedlot number to fetch the info for
   * @return A {@link Seedlot} with all the current information for the seedlot.
   */
  @GetMapping(path = "/{seedlotNumber}")
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Fetch a single seedlot information",
      description = """
          Fetch all current information from a single seedlot, identified by it's number
          """)
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "The Seedlot info was correctly found"),
        @ApiResponse(
          responseCode = "401",
          description = "Access token is missing or invalid",
          content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "404",
            description = "Could not find information for the given seedlot number")
      })
  public Optional<Seedlot> getSingleSeedlotInfo(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot ID",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          String seedlotNumber) {
    return seedlotService.getSingleSeedlotInfo(seedlotNumber);
  }
}
