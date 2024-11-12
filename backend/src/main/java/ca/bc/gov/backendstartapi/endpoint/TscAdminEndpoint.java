package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.response.DefaultSpringExceptionResponse;
import ca.bc.gov.backendstartapi.response.ValidationExceptionResponse;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import ca.bc.gov.backendstartapi.service.TscAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** This class contains resources for handling TSC Admin role requests. */
@RestController
@RequestMapping(path = "/api/tsc-admin", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(
    name = "TSC Admin",
    description = "This API contains resources for handling TSC Admin role requests.")
public class TscAdminEndpoint {

  private final TscAdminService tscAdminService;

  private final SeedlotService seedlotService;

  /**
   * Fetch all Seedlots for the TSC Admin role.
   *
   * @param page Optional page, zero-based, default 0.
   * @param size Optional page size, default 10.
   * @return A list of Seedlot or an empty list.
   */
  @GetMapping("/seedlots")
  @Operation(
      summary = "Fetch all Seedlots for the TSC Admin role.",
      description =
          "Returns a paginated list containing the `Seedlots` sorted by the updateTimestamp",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "A list containing found Seedlots or an empty list"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @CrossOrigin(exposedHeaders = "X-TOTAL-COUNT")
  @RoleAccessConfig({"SPAR_TSC_ADMIN"})
  public ResponseEntity<List<Seedlot>> getSeedlotsForReviewing(
      @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
      @RequestParam(value = "size", required = false, defaultValue = "10") Integer size) {
    Page<Seedlot> pageResult = tscAdminService.getTscAdminSeedlots(page, size);
    String totalCount = "0";
    List<Seedlot> seedlots = List.of();

    if (!Objects.isNull(pageResult) && pageResult.hasContent()) {
      totalCount = String.valueOf(pageResult.getTotalElements());
      seedlots = pageResult.getContent();
    }

    HttpHeaders responseHeaders = new HttpHeaders();
    responseHeaders.set("X-TOTAL-COUNT", totalCount);

    return ResponseEntity.ok().headers(responseHeaders).body(seedlots);
  }

  /**
   * Enables a {@link Seedlot} registration approval or disapproval by the TSC Admin.
   *
   * @param seedlotNumber The {@link Seedlot} identification.
   * @param status String option defining the Seedlot status code.
   */
  @PostMapping("/seedlots/{seedlotNumber}/status/{status}")
  @Operation(
      summary = "Enables a Seedlot registration approval or disapproval by the TSC Admin.",
      description = "The TSC Admin can either approve or disapprove a `Seedlot` registration.",
      responses = {
        @ApiResponse(
            responseCode = "204",
            description = "Update the Seedlot's status as per the request. No content body.",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "404",
            description = "The Seedlot was not found",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig("SPAR_TSC_ADMIN")
  public ResponseEntity<Void> updateSeedlotStatus(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "The Seedlot identification.",
              required = true,
              example = "63112")
          @PathVariable
          String seedlotNumber,
      @Parameter(
              name = "status",
              in = ParameterIn.PATH,
              description = "Seedlot status to be updated to, either PND or APP",
              required = true,
              example = "PND",
              schema = @Schema(type = "string", example = "true"))
          @PathVariable
          String status) {
    long started = Instant.now().toEpochMilli();
    tscAdminService.updateSeedlotStatus(seedlotNumber, status.toUpperCase());
    long finished = Instant.now().toEpochMilli();
    SparLog.info("Time spent: {} ms - approve or disapprove seedlot by tsc", (finished - started));
    return ResponseEntity.noContent().build();
  }

  /**
   * Edit a submitted seedlot, change the seedlot status to the specified value in the query param.
   *
   * @param form A {@link SeedlotFormSubmissionDto} containing all the form information
   * @return A {@link SeedlotStatusResponseDto} containing the seedlot number and status
   */
  @PutMapping("/seedlots/{seedlotNumber}/edit")
  @Operation(
      summary = "Edit a submitted seedlot",
      description = "This endpoint modifies an existing seedlot that is submitted.")
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
  @RoleAccessConfig({"SPAR_TSC_ADMIN"})
  public ResponseEntity<SeedlotStatusResponseDto> submitSeedlotForm(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Seedlot ID",
              required = true,
              schema = @Schema(type = "integer", format = "int64"))
          @PathVariable
          String seedlotNumber,
      @Parameter(
              name = "statusOnSave",
              in = ParameterIn.QUERY,
              description = "The status to set if the seedlot can be saved, one of [PND, SUB, APP]",
              required = true,
              example = "APP",
              schema = @Schema(type = "string"))
          @RequestParam
          String statusOnSave,
      @RequestBody SeedlotFormSubmissionDto form) {
    long started = Instant.now().toEpochMilli();
    String formattedStatus = statusOnSave.toUpperCase();
    SeedlotStatusResponseDto updatedDto =
        seedlotService.updateSeedlotWithForm(seedlotNumber, form, true, false, formattedStatus);
    long finished = Instant.now().toEpochMilli();
    SparLog.info("Time spent: {} ms - edit seedlot review form by tsc", (finished - started));
    return ResponseEntity.status(HttpStatus.OK).body(updatedDto);
  }
}
