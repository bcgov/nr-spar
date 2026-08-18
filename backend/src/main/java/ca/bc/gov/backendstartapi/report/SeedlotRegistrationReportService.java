package ca.bc.gov.backendstartapi.report;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.ReportGenerationException;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.JREmptyDataSource;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.data.JRMapCollectionDataSource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Generates the legacy SPRR001 PDF for Class B seedlot registration. */
@Service
@RequiredArgsConstructor
public class SeedlotRegistrationReportService {

  private final ReportResourceService reportResourceService;
  private final SeedlotRepository seedlotRepository;
  private final Sprr001ReportDataAssembler reportDataAssembler;
  private final LoggedUserService loggedUserService;

  /**
   * Build the SPRR001 registration PDF for a Class B (non-A) seedlot.
   *
   * @param seedlotNumber five-character seedlot number
   * @param userId legacy {@code P_USER_USERID} report parameter (IDIR or BCeID username)
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

    Sprr001ReportData reportData = reportDataAssembler.assemble(seedlot);

    Map<String, Object> parameters = reportResourceService.sprr001TemplateParameters();
    parameters.put("P_SEEDLOT_NUMBER", seedlotNumber);
    parameters.put("P_USER_USERID", userId);
    parameters.put("P_ERROR_MESSAGE", "");
    parameters.put(
        "SPAR_HEADER_DATASOURCE",
        new JRMapCollectionDataSource(List.of(Map.of("FLD", "1"))));
    parameters.put("COMMENTS_DATASOURCE", new JREmptyDataSource(1));
    parameters.put(
        "OWNERSHIP_SUBREPORT_DATASOURCE",
        new JRBeanCollectionDataSource(reportData.ownershipRows()));

    try {
      JasperPrint jasperPrint =
          JasperFillManager.fillReport(
              reportResourceService.getMainReport(),
              parameters,
              new JRBeanCollectionDataSource(List.of(reportData.mainRow())));
      return JasperExportManager.exportReportToPdf(jasperPrint);
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      SparLog.error("SPRR001 report generation failed for seedlot " + seedlotNumber, e);
      throw new ReportGenerationException(
          "Failed to generate SPRR001 report for seedlot " + seedlotNumber, e);
    }
  }
}
