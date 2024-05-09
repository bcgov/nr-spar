package ca.bc.gov.backendstartapi.endpoint;

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
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MimeTypeUtils;
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
   * @param isApproved Boolean option defining if it was approved.
   */
  @PostMapping("/seedlots/{seedlotNumber}/approve/{isApproved}")
  @Operation(
      summary = "Enables a Seedlot registration approval or disapproval by the TSC Admin.",
      description = "The TSC Admin can either approve or disapprove a `Seedlot` registration.",
      responses = {
        @ApiResponse(
            responseCode = "204",
            description = "The Seedlot was successfully approved or disapproved. No content body.",
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
  public ResponseEntity<Void> approveOrDisapproveSeedlot(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "The Seedlot identification.",
              required = true,
              example = "63112")
          @PathVariable
          String seedlotNumber,
      @Parameter(
              name = "isApproved",
              in = ParameterIn.PATH,
              description = "Boolean option defining if the seedlot approval.",
              required = true,
              example = "true",
              schema = @Schema(type = "boolean", example = "true"))
          @PathVariable
          Boolean isApproved) {
    tscAdminService.approveOrDisapproveSeedlot(seedlotNumber, isApproved);
    return ResponseEntity.noContent().build();
  }

  /**
   * Saves the Seedlot submit form once submitted on step 6.
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
      @RequestBody SeedlotFormSubmissionDto form) {
    SeedlotStatusResponseDto updatedDto =
        seedlotService.updateSeedlotWithForm(seedlotNumber, form, true);
    return ResponseEntity.status(HttpStatus.OK).body(updatedDto);
  }
}
