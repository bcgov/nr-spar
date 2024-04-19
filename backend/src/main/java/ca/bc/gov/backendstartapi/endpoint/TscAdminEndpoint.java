package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.service.TscAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** This class contains resources for handling TSC Admin role requests. */
@RequestMapping("/api/tsc-admin")
@RestController
@RequiredArgsConstructor
@Tag(
    name = "TSC Admin",
    description = "This API contains resources for handling TSC Admin role requests.")
public class TscAdminEndpoint {

  private final TscAdminService tscAdminService;

  /**
   * Fetch all Seedlots for the TSC Admin role.
   *
   * @param page Optional page, zero-based, default 0.
   * @param size Optional page size, default 10.
   * @return A list of Seedlot or an empty list.
   */
  @GetMapping("/seedlots")
  @PreAuthorize("hasRole('SPAR_SPR_TREE_SEED_CENTRE_ADMIN')")
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
   * @param trueOrFalse Boolean option defining if it was approved.
   */
  @PostMapping("/seedlots/{seedlotNumber}/approved/{trueOrFalse}")
  @PreAuthorize("hasRole('SPAR_SPR_TREE_SEED_CENTRE_ADMIN')")
  @Operation(
      summary = "Enables a `Seedlot` registration approval or disapproval by the TSC Admin.",
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
              name = "trueOrFalse",
              in = ParameterIn.PATH,
              description = "Boolean option defining if the seedlot approval.",
              required = true,
              example = "true",
              schema = @Schema(type = "boolean", example = "true"))
          @PathVariable
          Boolean trueOrFalse) {
    tscAdminService.approveOrDisapproveSeedlot(seedlotNumber, trueOrFalse);
    return ResponseEntity.noContent().build();
  }
}
