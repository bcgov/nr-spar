package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.report.SeedlotRegistrationReportService;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * PDF report endpoints for seedlots. Uses embedded JasperReports with the legacy SPRR001 template.
 */
@RestController
@RequestMapping(path = "/api/seedlots")
@RequiredArgsConstructor
@Tag(name = "Seedlot Reports", description = "PDF reports for seedlot registration and detail.")
public class SeedlotReportEndpoint {

  private final SeedlotRegistrationReportService seedlotRegistrationReportService;
  private final LoggedUserService loggedUserService;

  /**
   * Download the Class B seedlot registration report (legacy SPRR001).
   *
   * @param seedlotNumber seedlot to print
   * @return PDF document
   */
  @GetMapping(
      path = "/{seedlotNumber}/reports/registration",
      produces = MediaType.APPLICATION_PDF_VALUE)
  @Operation(
      summary = "Download Class B seedlot registration report (SPRR001)",
      description =
          """
          Generates the legacy Jasper report SPRR001-SEEDLOT_REG_DTL as PDF.
          Matches the legacy application "Adobe PDF Version" output for Class B seedlots.
          """)
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "PDF report generated",
            content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE)),
        @ApiResponse(responseCode = "400", description = "Seedlot is Class A (use SPRR001A)"),
        @ApiResponse(responseCode = "401", description = "Access token is missing or invalid"),
        @ApiResponse(responseCode = "403", description = "User cannot access this seedlot"),
        @ApiResponse(responseCode = "404", description = "Seedlot not found")
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public ResponseEntity<byte[]> downloadBclassRegistrationReport(
      @Parameter(
              name = "seedlotNumber",
              in = ParameterIn.PATH,
              description = "Five-character seedlot number",
              required = true,
              schema = @Schema(type = "string"))
          @PathVariable
          String seedlotNumber) {

    String userId = loggedUserService.getLoggedUserIdirOrBceId();
    byte[] pdf =
        seedlotRegistrationReportService.generateBclassRegistrationReport(seedlotNumber, userId);

    String filename = "SPRR001-" + seedlotNumber + ".pdf";
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .cacheControl(CacheControl.noStore())
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdf);
  }
}
