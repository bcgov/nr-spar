package ca.bc.gov.backendstartapi.report;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.ClientIdForbiddenException;
import ca.bc.gov.backendstartapi.exception.ReportGenerationException;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(SpringExtension.class)
class SeedlotRegistrationReportServiceTest {

  @Mock private ReportResourceService reportResourceService;
  @Mock private SeedlotRepository seedlotRepository;
  @Mock private Sprr001ReportDataAssembler reportDataAssembler;
  @Mock private LoggedUserService loggedUserService;

  private SeedlotRegistrationReportService service;

  private static final EffectiveDateRange DATE_RANGE =
      new EffectiveDateRange(LocalDate.now().minusDays(1), LocalDate.now().plusYears(1));

  @BeforeEach
  void setup() {
    service =
        new SeedlotRegistrationReportService(
            reportResourceService, seedlotRepository, reportDataAssembler, loggedUserService);
  }

  @Test
  @DisplayName("generateBclassRegistrationReport missing seedlot returns 404")
  void generate_missingSeedlot_shouldFail() {
    when(seedlotRepository.findById("53099")).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> service.generateBclassRegistrationReport("53099", "user"));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    verifyNoInteractions(loggedUserService);
  }

  @Test
  @DisplayName("generateBclassRegistrationReport rejects Class A seedlots")
  void generate_classA_shouldFail() {
    Seedlot seedlot = new Seedlot("63001");
    seedlot.setApplicantClientNumber("00012797");
    seedlot.setGeneticClass(new GeneticClassEntity("A", "A class", DATE_RANGE));
    when(seedlotRepository.findById("63001")).thenReturn(Optional.of(seedlot));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> service.generateBclassRegistrationReport("63001", "user"));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    verify(loggedUserService).verifySeedlotAccessPrivilege("00012797");
  }

  @Test
  @DisplayName("generateBclassRegistrationReport denies users without client access")
  void generate_forbiddenClient_shouldFail() {
    Seedlot seedlot = new Seedlot("53001");
    seedlot.setApplicantClientNumber("00012797");
    seedlot.setGeneticClass(new GeneticClassEntity("B", "B class", DATE_RANGE));
    when(seedlotRepository.findById("53001")).thenReturn(Optional.of(seedlot));
    doThrow(new ClientIdForbiddenException())
        .when(loggedUserService)
        .verifySeedlotAccessPrivilege("00012797");

    assertThrows(
        ClientIdForbiddenException.class,
        () -> service.generateBclassRegistrationReport("53001", "user"));

    verifyNoInteractions(reportDataAssembler);
  }

  @Test
  @DisplayName("generateBclassRegistrationReport fills and exports a PDF for Class B")
  void generate_classB_shouldExportPdf() {
    Seedlot seedlot = bclassSeedlot("53001");
    when(seedlotRepository.findById("53001")).thenReturn(Optional.of(seedlot));
    when(reportDataAssembler.assemble(seedlot))
        .thenReturn(new Sprr001ReportData(new Sprr001MainRow(), List.of()));
    JasperReport jasperReport = mock(JasperReport.class);
    when(reportResourceService.getMainReport()).thenReturn(jasperReport);
    when(reportResourceService.sprr001TemplateParameters()).thenReturn(new HashMap<>());

    byte[] pdf = {0x25, 0x50, 0x44, 0x46};
    JasperPrint jasperPrint = mock(JasperPrint.class);

    try (MockedStatic<JasperFillManager> fill = mockStatic(JasperFillManager.class);
        MockedStatic<JasperExportManager> export = mockStatic(JasperExportManager.class)) {
      fill.when(
              () ->
                  JasperFillManager.fillReport(
                      any(JasperReport.class), anyMap(), any(JRDataSource.class)))
          .thenReturn(jasperPrint);
      export.when(() -> JasperExportManager.exportReportToPdf(jasperPrint)).thenReturn(pdf);

      assertArrayEquals(pdf, service.generateBclassRegistrationReport("53001", "user"));
    }
  }

  @Test
  @DisplayName("generateBclassRegistrationReport wraps Jasper failures")
  void generate_jasperFailure_shouldThrowReportGenerationException() {
    Seedlot seedlot = bclassSeedlot("53001");
    when(seedlotRepository.findById("53001")).thenReturn(Optional.of(seedlot));
    when(reportDataAssembler.assemble(seedlot))
        .thenReturn(new Sprr001ReportData(new Sprr001MainRow(), List.of()));
    JasperReport jasperReport = mock(JasperReport.class);
    when(reportResourceService.getMainReport()).thenReturn(jasperReport);
    when(reportResourceService.sprr001TemplateParameters()).thenReturn(new HashMap<>());

    try (MockedStatic<JasperFillManager> fill = mockStatic(JasperFillManager.class)) {
      fill.when(
              () ->
                  JasperFillManager.fillReport(
                      any(JasperReport.class), anyMap(), any(JRDataSource.class)))
          .thenThrow(new JRException("compile failed"));

      assertThrows(
          ReportGenerationException.class,
          () -> service.generateBclassRegistrationReport("53001", "user"));
    }
  }

  @Test
  @DisplayName("generateBclassRegistrationReport wraps assemble transport failures")
  void generate_assembleFailure_shouldThrowReportGenerationException() {
    Seedlot seedlot = bclassSeedlot("53001");
    when(seedlotRepository.findById("53001")).thenReturn(Optional.of(seedlot));
    when(reportDataAssembler.assemble(seedlot))
        .thenThrow(new RuntimeException("oracle-api timeout"));

    assertThrows(
        ReportGenerationException.class,
        () -> service.generateBclassRegistrationReport("53001", "user"));
  }

  @Test
  @DisplayName("generateBclassRegistrationReport rethrows ResponseStatusException from assemble")
  void generate_assembleResponseStatus_shouldRethrow() {
    Seedlot seedlot = bclassSeedlot("53001");
    when(seedlotRepository.findById("53001")).thenReturn(Optional.of(seedlot));
    when(reportDataAssembler.assemble(seedlot))
        .thenThrow(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "upstream"));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> service.generateBclassRegistrationReport("53001", "user"));

    assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
  }

  @Test
  @DisplayName("generateBclassRegistrationReport rejects seedlots without Class B")
  void generate_missingGeneticClass_shouldFail() {
    Seedlot seedlot = new Seedlot("53001");
    seedlot.setApplicantClientNumber("00012797");
    when(seedlotRepository.findById("53001")).thenReturn(Optional.of(seedlot));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> service.generateBclassRegistrationReport("53001", "user"));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

  private Seedlot bclassSeedlot(String seedlotNumber) {
    Seedlot seedlot = new Seedlot(seedlotNumber);
    seedlot.setApplicantClientNumber("00012797");
    seedlot.setGeneticClass(new GeneticClassEntity("B", "B class", DATE_RANGE));
    return seedlot;
  }
}
