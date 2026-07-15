package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.RevisionCountDto;
import ca.bc.gov.backendstartapi.dto.SaveSeedlotFormDto;
import ca.bc.gov.backendstartapi.dto.SeedlotAclassFormDto;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotBclassFormDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCollectionGeometryDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDtoClassB;
import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.CsvTableParsingException;
import ca.bc.gov.backendstartapi.response.DefaultSpringExceptionResponse;
import ca.bc.gov.backendstartapi.response.ValidationExceptionResponse;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import ca.bc.gov.backendstartapi.service.SaveSeedlotFormService;
import ca.bc.gov.backendstartapi.service.SeedlotCollectionGeometryService;
import ca.bc.gov.backendstartapi.service.SeedlotCopyService;
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
import java.time.Instant;
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
import org.springframework.lang.NonNull;
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

  private final SeedlotCopyService seedlotCopyService;

  private final SaveSeedlotFormService saveSeedlotFormService;

  private final SeedlotCollectionGeometryService seedlotCollectionGeometryService;

  private final LoggedUserService loggedUserService;

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
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
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
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
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
   * @param createDto A {@link SeedlotCreateDto} containing all required field to get a new
   *     registration started.
   * @return A {@link SeedlotStatusResponseDto} with all created values.
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
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public ResponseEntity<SeedlotStatusResponseDto> createSeedlot(
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "Body containing minimum required fields to create a seedlot",
              required = true)
          @RequestBody
          @Valid
          SeedlotCreateDto createDto) {
    long started = Instant.now().toEpochMilli();
    SeedlotStatusResponseDto response = seedlotService.createSeedlot(createDto);
    long finished = Instant.now().toEpochMilli();
    SparLog.info("Time spent: {} ms - create seedlot first step", (finished - started));
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  /**
   * Resource to fetch all seedlots to a given client ID.
   *
   * @param clientId client id to fetch seedlots to
   * @return A {@link List} of {@link Seedlot} populated or empty
   */
  @GetMapping("/clients/{clientId}")
  @CrossOrigin(exposedHeaders = "X-TOTAL-COUNT")
  @Operation(
      summary = "Fetch all seedlots registered by a given client id.",
      description =
          """
          Returns a paginated list containing the seedlots. Note that the requested client id
          should be present on the user organization.
          """,
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "A list containing the found Seedlots or an empty list"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "403",
            description = "Client id requested not present on user profile and roles.",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public ResponseEntity<List<Seedlot>> getSeedlotByClientId(
      @PathVariable
          @Parameter(
              name = "clientId",
              in = ParameterIn.PATH,
              description = "Seedlot applicant's Forest Client ID",
              required = true,
              example = "12797")
          String clientId,
      @RequestParam(value = "page", required = false, defaultValue = "0") int page,
      @RequestParam(value = "size", required = false, defaultValue = "10") int size) {
    while (clientId.length() < 8) {
      clientId = "0" + clientId;
    }
    Optional<Page<Seedlot>> optionalResult =
        seedlotService.getSeedlotByClientId(clientId, page, size);
    String totalCount = "0";
    List<Seedlot> result = List.of();

    if (!optionalResult.isEmpty()) {
      totalCount = String.valueOf(optionalResult.get().getTotalElements());
      result = optionalResult.get().getContent();
    }

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
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public SeedlotDto getSingleSeedlotInfo(
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
   * Get full information from a single seedlot, including parent trees and calculation results,
   * divided by registration steps.
   *
   * @param seedlotNumber the seedlot number to fetch the info for
   * @return A {@link SeedlotAclassFormDto} with all the current information for the seedlot and
   *     parent tree data.
   */
  @GetMapping("/{seedlotNumber}/a-class-full-form")
  @Operation(
      summary =
          """
          Fetch single seedlot information, with all respective form fields,
          including parent tree data and calculation results
          """,
      description =
          """
          Fetch all current information from a single seedlot and respective
          parent tree data, identified by it's number
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
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public SeedlotAclassFormDto getFullSeedlotInfo(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot ID",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          String seedlotNumber) {
    return seedlotService.getAclassSeedlotFormInfo(seedlotNumber);
  }

  /**
   * PATCH an entry on the Seedlot table.
   *
   * @param patchDto A {@link SeedlotApplicationPatchDto} containing all required field to get a new
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
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
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

    return seedlotService.patchApplicantInfo(seedlotNumber, patchDto);
  }

  /**
   * Saves the Seedlot submit form once submitted on step 6.
   *
   * @param form A {@link SeedlotFormSubmissionDto} containing all the form information
   * @return A {@link SeedlotStatusResponseDto} containing the seedlot number and status
   */
  @PutMapping("/{seedlotNumber}/a-class-submission")
  @Operation(
      summary = "Saves the Seedlot form when submitted",
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
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "409",
            description = "Data conflict while saving, usually caused by existing rows in table",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public ResponseEntity<SeedlotStatusResponseDto> submitSeedlotForm(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot ID",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          String seedlotNumber,
      @RequestBody @Valid SeedlotFormSubmissionDto form) {
    long started = Instant.now().toEpochMilli();
    boolean isTscAdmin = loggedUserService.isTscAdminLogged();
    SeedlotStatusResponseDto createDto =
        seedlotService.updateSeedlotWithForm(seedlotNumber, form, isTscAdmin, true, "SUB");
    long finished = Instant.now().toEpochMilli();
    SparLog.info("Time spent: {} ms - submit seedlot regular form", (finished - started));
    return ResponseEntity.status(HttpStatus.CREATED).body(createDto);
  }

  /**
   * Saves the Seedlot reg form progress.
   *
   * @param data A {@link SaveSeedlotFormDto} containing all the form information
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
        @ApiResponse(responseCode = "200", description = "Successfully saved or updated."),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "403",
            description = "Client id requested not present on user profile and roles.",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "409",
            description = "Data conflict while saving",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public RevisionCountDto saveFormProgressClassA(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot Number",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          @NonNull
          String seedlotNumber,
      @RequestBody SaveSeedlotFormDto data) {

    RevisionCountDto revCountDto = saveSeedlotFormService.saveForm(seedlotNumber, data);

    return revCountDto;
  }

  /** Retrieves the saved Seedlot reg form. */
  @GetMapping("/{seedlotNumber}/a-class-form-progress")
  @Operation(
      summary = "Retrieve the progress and data of an a-class reg form.",
      description = "This endpoint retrieves the progress of an A-class registration form")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved."),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "403",
            description = "Client id requested not present on user profile and roles.",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "404",
            description = "Seedlot form progress not found",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public SaveSeedlotFormDto getFormProgressClassA(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot Number",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          @NonNull
          String seedlotNumber) {

    return saveSeedlotFormService.getForm(seedlotNumber);
  }

  /**
   * Creates a copy of an existing seedlot under a new seedlot number.
   *
   * @param seedlotNumber the source seedlot number to copy
   * @return a {@link SeedlotStatusResponseDto} with the new seedlot number and PND status
   */
  @PostMapping("/{seedlotNumber}/copy")
  @Operation(
      summary = "Copy a seedlot to a new seedlot number",
      description =
          "Copies an existing Class A or Class B seedlot to a new auto-assigned number in the"
              + " class-specific copy band (A: 62000–62998, B: 52000–52998).")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "201", description = "Seedlot successfully copied."),
        @ApiResponse(
            responseCode = "400",
            description = "Copy band exhausted or unsupported genetic class.",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid.",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "404",
            description = "Source seedlot not found.",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN"})
  public ResponseEntity<SeedlotStatusResponseDto> copySeedlot(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Source seedlot number",
              required = true,
              schema = @Schema(type = "string", pattern = "\\d{5}", example = "62001"))
      @PathVariable String seedlotNumber) {
    long started = Instant.now().toEpochMilli();
    String userId = loggedUserService.getLoggedUserId();
    SeedlotStatusResponseDto response = seedlotCopyService.copySeedlot(seedlotNumber, userId);
    long finished = Instant.now().toEpochMilli();
    SparLog.info("Time spent: {} ms - copy seedlot", (finished - started));
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  /** Retrieve only the progress_status column from the form progress table. */
  @GetMapping("/{seedlotNumber}/a-class-form-progress/status")
  @Operation(
      summary = "Retrieve the progress status of an a-class reg form.",
      description =
          "This endpoint retrieves the progress status only of an A-class registration form")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved."),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "403",
            description = "Client id requested not present on user profile and roles.",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "404",
            description = "Seedlot form progress not found",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public JsonNode getFormProgressStatusClassA(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot Number",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          String seedlotNumber) {

    return saveSeedlotFormService.getFormStatus(seedlotNumber);
  }

  /**
   * Saves the B-class Seedlot reg form progress.
   *
   * @param data A {@link SaveSeedlotFormDto} containing all the form information
   * @return revision count on success.
   */
  @PutMapping("{seedlotNumber}/b-class-form-progress")
  @Operation(
      summary = "Save the progress of a b-class reg form.",
      description =
          "This endpoint saves the progress of a B-class registration form, it is NOT to be used"
              + " for form submission.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully saved or updated."),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "403",
            description = "Client id requested not present on user profile and roles.",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "409",
            description = "Data conflict while saving",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public RevisionCountDto saveFormProgressClassB(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot Number",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          @NonNull
          String seedlotNumber,
      @RequestBody SaveSeedlotFormDto data) {
    return saveSeedlotFormService.saveForm(seedlotNumber, data);
  }

  /** Retrieves the saved B-class Seedlot reg form. */
  @GetMapping("/{seedlotNumber}/b-class-form-progress")
  @Operation(
      summary = "Retrieve the progress and data of a b-class reg form.",
      description = "This endpoint retrieves the progress of a B-class registration form")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved."),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "403",
            description = "Client id requested not present on user profile and roles.",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "404",
            description = "Seedlot form progress not found",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public SaveSeedlotFormDto getFormProgressClassB(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot Number",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          @NonNull
          String seedlotNumber) {
    return saveSeedlotFormService.getForm(seedlotNumber);
  }

  /** Retrieve only the progress_status column from the B-class form progress table. */
  @GetMapping("/{seedlotNumber}/b-class-form-progress/status")
  @Operation(
      summary = "Retrieve the progress status of a b-class reg form.",
      description =
          "This endpoint retrieves the progress status only of a B-class registration form")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved."),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "403",
            description = "Client id requested not present on user profile and roles.",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "404",
            description = "Seedlot form progress not found",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public JsonNode getFormProgressStatusClassB(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot Number",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          String seedlotNumber) {
    return saveSeedlotFormService.getFormStatus(seedlotNumber);
  }

  /** Returns collection area geometry for a Class B seedlot. */
  @GetMapping("/{seedlotNumber}/collection-geometry")
  @Operation(
      summary = "Retrieve collection area geometry for a Class B seedlot.",
      description = "Returns the natural-stand collection polygon and metadata when present.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved."),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "403",
            description = "Client id requested not present on user profile and roles.",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "404",
            description = "Seedlot or collection geometry not found",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public SeedlotCollectionGeometryDto getCollectionGeometry(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot Number",
              required = true,
              schema = @Schema(type = "string", pattern = "\\d{5}", example = "53001"))
          @PathVariable
          @NonNull
          String seedlotNumber) {
    return seedlotCollectionGeometryService.getBySeedlotNumber(seedlotNumber);
  }

  /**
   * Fetch the full normalized form data for a submitted B-class seedlot.
   *
   * @param seedlotNumber the seedlot number to fetch
   * @return a {@link SeedlotBclassFormDto} with all form step data
   */
  @GetMapping("/{seedlotNumber}/b-class-full-form")
  @Operation(
      summary = "Fetch all B-class form fields for a submitted seedlot",
      description =
          "Returns the normalized collection, ownership, interim, and extraction data for a"
              + " Class B seedlot identified by its number.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Seedlot info successfully retrieved."),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "404",
            description = "Seedlot not found",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public SeedlotBclassFormDto getBclassSeedlotFullForm(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot number",
              required = true,
              schema = @Schema(type = "string", pattern = "\\d{5}", example = "53001"))
          @PathVariable
          String seedlotNumber) {
    return seedlotService.getBclassSeedlotFormInfo(seedlotNumber);
  }

  /**
   * Submit a B-class seedlot registration, materializing the wizard draft to normalized tables.
   *
   * @param form the full B-class form payload
   * @return a {@link SeedlotStatusResponseDto} with the seedlot number and new status
   */
  @PutMapping("/{seedlotNumber}/b-class-submission")
  @Operation(
      summary = "Submit a B-class seedlot registration",
      description =
          "Materializes the wizard draft to the normalized seedlot tables and sets the"
              + " seedlot status to Submitted (SUB).")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "201", description = "Successfully submitted."),
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
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "404",
            description = "Seedlot not found",
            content = @Content(schema = @Schema())),
        @ApiResponse(
            responseCode = "409",
            description = "Data conflict while saving",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public ResponseEntity<SeedlotStatusResponseDto> submitBclassSeedlotForm(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot number",
              required = true,
              schema = @Schema(type = "string", pattern = "\\d{5}", example = "53001"))
          @PathVariable
          String seedlotNumber,
      @RequestBody @Valid SeedlotFormSubmissionDtoClassB form) {
    long started = Instant.now().toEpochMilli();
    boolean isTscAdmin = loggedUserService.isTscAdminLogged();
    SeedlotStatusResponseDto result =
        seedlotService.submitSeedlotFormClassB(seedlotNumber, form, isTscAdmin);
    long finished = Instant.now().toEpochMilli();
    SparLog.info("Time spent: {} ms - submit B-class seedlot form", (finished - started));
    return ResponseEntity.status(HttpStatus.CREATED).body(result);
  }
}
