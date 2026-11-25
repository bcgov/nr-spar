package ca.bc.gov.backendstartapi.report.html;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.ReportGenerationException;
import ca.bc.gov.backendstartapi.report.SparReportConstants;
import ca.bc.gov.backendstartapi.report.Sprr001ReportData;
import ca.bc.gov.backendstartapi.report.Sprr001ReportDataAssembler;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.time.Clock;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * SPRR001 (Class B seedlot registration detail) rendered with Thymeleaf + OpenHTMLtoPDF.
 *
 * <p>Looks up the seedlot, checks the user's access, assembles the data with {@link
 * Sprr001ReportDataAssembler} and renders the {@code sprr001} template.
 */
@Service
public class Sprr001HtmlReportService {

  static final String TEMPLATE = "sprr001";
  static final ZoneId REPORT_ZONE = ZoneId.of("America/Vancouver");

  private final SeedlotRepository seedlotRepository;
  private final LoggedUserService loggedUserService;
  private final Sprr001ReportDataAssembler reportDataAssembler;
  private final HtmlPdfRenderer renderer;
  private final Clock clock;
  private final String logoDataUri;

  /** Production constructor. */
  @Autowired
  public Sprr001HtmlReportService(
      SeedlotRepository seedlotRepository,
      LoggedUserService loggedUserService,
      Sprr001ReportDataAssembler reportDataAssembler,
      HtmlPdfRenderer renderer) {
    this(seedlotRepository, loggedUserService, reportDataAssembler, renderer, Clock.systemUTC());
  }

  Sprr001HtmlReportService(
      SeedlotRepository seedlotRepository,
      LoggedUserService loggedUserService,
      Sprr001ReportDataAssembler reportDataAssembler,
      HtmlPdfRenderer renderer,
      Clock clock) {
    this.seedlotRepository = seedlotRepository;
    this.loggedUserService = loggedUserService;
    this.reportDataAssembler = reportDataAssembler;
    this.renderer = renderer;
    this.clock = clock;
    this.logoDataUri =
        HtmlPdfRenderer.dataUri(
            SparReportConstants.REPORT_CLASSPATH_DIR + SparReportConstants.SPRR001_LOGO_IMAGE,
            "image/jpeg");
  }

  /**
   * Build the SPRR001 registration PDF for a Class B seedlot using the HTML template.
   *
   * @param seedlotNumber five-character seedlot number
   * @param userId IDIR or BCeID username printed in the header
   * @return PDF bytes
   */
  public byte[] generateBclassRegistrationReport(String seedlotNumber, String userId) {
    Seedlot seedlot =
        seedlotRepository
            .findById(seedlotNumber)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Seedlot not found: " + seedlotNumber));

    loggedUserService.verifySeedlotAccessPrivilege(seedlot.getApplicantClientNumber());

    String geneticClass =
        Optional.ofNullable(seedlot.getGeneticClass())
            .map(GeneticClassEntity::getGeneticClassCode)
            .orElse("");
    if (!"B".equalsIgnoreCase(geneticClass)) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "SPRR001 is for Class B seedlots. Class A seedlots use SPRR001A.");
    }

    try {
      Sprr001ReportData data = reportDataAssembler.assemble(seedlot);
      ZonedDateTime printedAt = ZonedDateTime.now(clock.withZone(REPORT_ZONE));
      Sprr001HtmlModel model =
          Sprr001HtmlModel.from(data, seedlotNumber, userId, printedAt, logoDataUri);
      return renderer.render(TEMPLATE, Map.of("m", model));
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      SparLog.error("SPRR001 HTML report generation failed for seedlot " + seedlotNumber, e);
      throw new ReportGenerationException(
          "Failed to generate SPRR001 HTML report for seedlot " + seedlotNumber, e);
    }
  }
}
