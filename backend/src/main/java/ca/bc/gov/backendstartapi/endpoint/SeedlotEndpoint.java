package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.SaveSeedlotFormDtoClassA;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.CsvTableParsingException;
import ca.bc.gov.backendstartapi.response.DefaultSpringExceptionResponse;
import ca.bc.gov.backendstartapi.response.ValidationExceptionResponse;
import ca.bc.gov.backendstartapi.service.SaveSeedlotFormService;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import ca.bc.gov.backendstartapi.service.parser.ConeAndPollenCountCsvTableParser;
import ca.bc.gov.backendstartapi.service.parser.SmpCalculationCsvTableParser;
import ca.bc.gov.backendstartapi.vo.parser.ConeAndPollenCount;
import ca.bc.gov.backendstartapi.vo.parser.SmpMixVolume;
import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

  private final SaveSeedlotFormService saveSeedlotFormService;

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
   * Resource to fetch all seedlots to a given user id.
   *
   * @param userId user identification to fetch seedlots to
   * @return A {@link List} of {@link Seedlot} populated or empty
   */
  @GetMapping("/users/{userId}")
  @CrossOrigin(exposedHeaders = "X-TOTAL-COUNT")
  @Operation(
      summary = "Fetch all seedlots registered by a given user.",
      description = "Returns a paginated list containing the seedlots",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "A list containing found Seedlots or an empty list"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public ResponseEntity<List<Seedlot>> getUserSeedlots(
      @PathVariable
          @Parameter(
              name = "userId",
              in = ParameterIn.PATH,
              description = "User's identification",
              example = "dev-abcdef123456@idir")
          String userId,
      @RequestParam(value = "page", required = false, defaultValue = "0") int page,
      @RequestParam(value = "size", required = false, defaultValue = "10") int size) {
    Optional<Page<Seedlot>> optionalResult = seedlotService.getUserSeedlots(userId, page, size);
    List<Seedlot> result = optionalResult.isEmpty() ? List.of() : optionalResult.get().getContent();
    String totalCount =
        optionalResult.isEmpty() ? "0" : String.valueOf(optionalResult.get().getTotalElements());
    HttpHeaders responseHeaders = new HttpHeaders();
    responseHeaders.set("X-TOTAL-COUNT", totalCount);
    return ResponseEntity.ok().headers(responseHeaders).body(result);
  }

  /**
   * Get information from a single seedlot.
   *
   * @param seedlotNumber the seedlot number to fetch the info for
   * @return A {@link Seedlot} with all the current information for the seedlot.
   */
  @GetMapping("/{seedlotNumber}")
  @Operation(
      summary = "Fetch a single seedlot information",
      description =
          """
          Fetch all current information from a single seedlot, identified by it's number
          """)
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "The Seedlot info was correctly found"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "404",
            description = "Could not find information for the given seedlot number")
      })
  public Seedlot getSingleSeedlotInfo(
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

  /**
   * PATCH an entry on the Seedlot table.
   *
   * @param patchDto A {@link SeedlotApplicationPatchDto} containig all required field to get a new
   *     registration started.
   * @return A {@link Seedlot} with all updated values.
   */
  @PatchMapping(
      consumes = MimeTypeUtils.APPLICATION_JSON_VALUE,
      path = "/{seedlotNumber}/application-info")
  @Operation(
      summary = "Updates a seedlot's applicant email and other fields",
      description =
          """
          Updates a seedlot's applicant email, source_code, to_be_registered_ind and bc_source_ind
          """)
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "The Seedlot entity was successfully updated"),
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
  public Seedlot patchApplicantAndSeedlotInfo(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot ID",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          String seedlotNumber,
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "Body containing minimum required fields to create a seedlot",
              required = true)
          @RequestBody
          @Valid
          SeedlotApplicationPatchDto patchDto) {

    return seedlotService.patchApplicantionInfo(seedlotNumber, patchDto);
  }

  /**
   * Saves the Seedlot submit form once submitted on step 6.
   *
   * @param form A {@link SeedlotFormSubmissionDto} containing all the form information
   * @return A {@link SeedlotCreateResponseDto} containing the seedlot number and status
   */
  @PutMapping("/{seedlotNumber}/a-class-form-submission")
  @Operation(
      summary = "Saves the Seedlot form when submitted or edited",
      description =
          "This API is responsible for receiving the entire seedlot form, once submitted or"
              + " edited.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "201", description = "Successfully saved."),
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
  public ResponseEntity<SeedlotCreateResponseDto> submitSeedlotForm(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot ID",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          String seedlotNumber,
      @RequestBody SeedlotFormSubmissionDto form) {
    SeedlotCreateResponseDto createDto = seedlotService.submitSeedlotForm(seedlotNumber, form);
    return ResponseEntity.status(HttpStatus.CREATED).body(createDto);
  }

  /**
   * Saves the Seedlot reg form progress.
   *
   * @param data A {@link SaveSeedlotFormDtoClassA} containing all the form information
   * @return 204 on success.
   */
  @PutMapping("{seedlotNumber}/a-class-form-progress")
  @Operation(
      summary = "Save the progress of an a-class reg form.",
      description =
          "This endpoint saves the progress of an A-class registration form, it is NOT to be used"
              + " for form submission.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "204", description = "Successfully saved or updated."),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public ResponseEntity<Void> saveFormProgressClassA(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot Number",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          String seedlotNumber,
      @RequestBody SaveSeedlotFormDtoClassA data) {

    saveSeedlotFormService.saveFormClassA(seedlotNumber, data);

    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }

  /** Retrieves the saved Seedlot reg form. */
  @GetMapping("{seedlotNumber}/a-class-form-progress")
  @Operation(
      summary = "Retrieve the progress and data of an a-class reg form.",
      description = "This endpoint retrieves the progress of an A-class registration form")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved."),
        @ApiResponse(
            responseCode = "404",
            description = "Seedlot form progress not found",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public SaveSeedlotFormDtoClassA getFormProgressClassA(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot Number",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          String seedlotNumber) {

    return saveSeedlotFormService.getFormClassA(seedlotNumber);
  }

  /** Retreive only the progress_status column from the form progress table. */
  @GetMapping("{seedlotNumber}/a-class-form-progress/status")
  @Operation(
      summary = "Retrieve the progress status of an a-class reg form.",
      description =
          "This endpoint retrieves the progress status only of an A-class registration form")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved."),
        @ApiResponse(
            responseCode = "404",
            description = "Seedlot form progress not found",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public JsonNode getFormProgressStatusClassA(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot Number",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          String seedlotNumber) {

    return saveSeedlotFormService.getFormStatusClassA(seedlotNumber);
  }
}
