package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.security.UserAuthenticationHelper;
import ca.bc.gov.backendstartapi.service.TscAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/tsc-admin")
@RestController
@RequiredArgsConstructor
@Tag(
    name = "TSC Admin",
    description = "This resource contains resources for handling TSC Admin role requests.")
public class TscAdminEndpoint {

  private final TscAdminService tscAdminService;

  private final UserAuthenticationHelper userAuthenticationHelper;

  @GetMapping("/seedlots")
  @PreAuthorize("hasRole('SPAR_SPR_TREE_SEED_CENTRE_ADMIN')")
  @CrossOrigin(exposedHeaders = "X-TOTAL-COUNT")
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
  public ResponseEntity<Page<Seedlot>> getSeedlotsForReviewing(
      @RequestParam(value = "page", required = false, defaultValue = "0") int page,
      @RequestParam(value = "size", required = false, defaultValue = "10") int size) {
    Page<Seedlot> pageResult = tscAdminService.getTscAdminSeedlots(page, size);
    String totalCount = "0";

    SparLog.info("User roles: {}", userAuthenticationHelper.getUserInfo().get().roles());

    if (!Objects.isNull(pageResult) && pageResult.hasContent()) {
      totalCount = String.valueOf(pageResult.getTotalElements());
    }

    HttpHeaders responseHeaders = new HttpHeaders();
    responseHeaders.set("X-TOTAL-COUNT", totalCount);
    return ResponseEntity.ok().headers(responseHeaders).body(pageResult);
  }
}
