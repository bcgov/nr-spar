package ca.bc.gov.backendstartapi.report.html;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.ReportGenerationException;
import ca.bc.gov.backendstartapi.report.Sprr001ReportDataAssembler;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class Sprr001HtmlReportServiceTest {

  private static final String SEEDLOT_NUMBER = "63001";
  private static final String CLIENT_NUMBER = "00012797";

  @Mock private SeedlotRepository seedlotRepository;
  @Mock private LoggedUserService loggedUserService;
  @Mock private Sprr001ReportDataAssembler reportDataAssembler;
  @Mock private HtmlPdfRenderer renderer;

  private Sprr001HtmlReportService service;

  @BeforeEach
  void setUp() {
    Clock clock = Clock.fixed(Instant.parse("2026-11-25T18:30:00Z"), ZoneOffset.UTC);
    service =
        new Sprr001HtmlReportService(
            seedlotRepository, loggedUserService, reportDataAssembler, renderer, clock);
  }

  private static Seedlot seedlot(String geneticClassCode) {
    Seedlot seedlot = new Seedlot(SEEDLOT_NUMBER);
    seedlot.setApplicantClientNumber(CLIENT_NUMBER);
    if (geneticClassCode != null) {
      seedlot.setGeneticClass(new GeneticClassEntity(geneticClassCode, "Class", null));
    }
    return seedlot;
  }

  @Test
  void classB_rendersTemplateWithModel() {
    Seedlot seedlot = seedlot("B");
    when(seedlotRepository.findById(SEEDLOT_NUMBER)).thenReturn(Optional.of(seedlot));
    when(reportDataAssembler.assemble(seedlot)).thenReturn(Sprr001HtmlSamples.classB());
    byte[] pdf = {1, 2, 3};
    when(renderer.render(eq(Sprr001HtmlReportService.TEMPLATE), anyMap())).thenReturn(pdf);

    byte[] result = service.generateBclassRegistrationReport(SEEDLOT_NUMBER, "IDIR\\TESTER");

    assertArrayEquals(pdf, result);
    verify(loggedUserService).verifySeedlotAccessPrivilege(CLIENT_NUMBER);
    @SuppressWarnings("unchecked")
    ArgumentCaptor<Map<String, Object>> variables = ArgumentCaptor.forClass(Map.class);
    verify(renderer).render(eq(Sprr001HtmlReportService.TEMPLATE), variables.capture());
    assertInstanceOf(Sprr001HtmlModel.class, variables.getValue().get("m"));
  }

  @Test
  void unknownSeedlot_isNotFound() {
    when(seedlotRepository.findById(SEEDLOT_NUMBER)).thenReturn(Optional.empty());

    ResponseStatusException e =
        assertThrows(
            ResponseStatusException.class,
            () -> service.generateBclassRegistrationReport(SEEDLOT_NUMBER, "IDIR\\TESTER"));

    assertEquals(HttpStatus.NOT_FOUND, e.getStatusCode());
    verify(loggedUserService, never()).verifySeedlotAccessPrivilege(any());
  }

  @Test
  void noAccess_stopsBeforeAssembling() {
    when(seedlotRepository.findById(SEEDLOT_NUMBER)).thenReturn(Optional.of(seedlot("B")));
    ResponseStatusException denied = new ResponseStatusException(HttpStatus.FORBIDDEN);
    doThrow(denied).when(loggedUserService).verifySeedlotAccessPrivilege(CLIENT_NUMBER);

    ResponseStatusException e =
        assertThrows(
            ResponseStatusException.class,
            () -> service.generateBclassRegistrationReport(SEEDLOT_NUMBER, "IDIR\\TESTER"));

    assertSame(denied, e);
    verify(reportDataAssembler, never()).assemble(any());
  }

  @Test
  void classA_isBadRequest() {
    when(seedlotRepository.findById(SEEDLOT_NUMBER)).thenReturn(Optional.of(seedlot("A")));

    ResponseStatusException e =
        assertThrows(
            ResponseStatusException.class,
            () -> service.generateBclassRegistrationReport(SEEDLOT_NUMBER, "IDIR\\TESTER"));

    assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode());
    verify(reportDataAssembler, never()).assemble(any());
  }

  @Test
  void missingGeneticClass_isBadRequest() {
    when(seedlotRepository.findById(SEEDLOT_NUMBER)).thenReturn(Optional.of(seedlot(null)));

    ResponseStatusException e =
        assertThrows(
            ResponseStatusException.class,
            () -> service.generateBclassRegistrationReport(SEEDLOT_NUMBER, "IDIR\\TESTER"));

    assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode());
  }

  @Test
  void renderingFailure_isWrapped() {
    Seedlot seedlot = seedlot("B");
    when(seedlotRepository.findById(SEEDLOT_NUMBER)).thenReturn(Optional.of(seedlot));
    when(reportDataAssembler.assemble(seedlot)).thenReturn(Sprr001HtmlSamples.classB());
    IllegalStateException cause = new IllegalStateException("template broke");
    when(renderer.render(eq(Sprr001HtmlReportService.TEMPLATE), anyMap())).thenThrow(cause);

    ReportGenerationException e =
        assertThrows(
            ReportGenerationException.class,
            () -> service.generateBclassRegistrationReport(SEEDLOT_NUMBER, "IDIR\\TESTER"));

    assertSame(cause, e.getCause());
  }

  @Test
  void responseStatusFromAssembler_isRethrownUnwrapped() {
    Seedlot seedlot = seedlot("B");
    when(seedlotRepository.findById(SEEDLOT_NUMBER)).thenReturn(Optional.of(seedlot));
    ResponseStatusException notFound =
        new ResponseStatusException(HttpStatus.NOT_FOUND, "No report data");
    when(reportDataAssembler.assemble(seedlot)).thenThrow(notFound);

    ResponseStatusException e =
        assertThrows(
            ResponseStatusException.class,
            () -> service.generateBclassRegistrationReport(SEEDLOT_NUMBER, "IDIR\\TESTER"));

    assertSame(notFound, e);
  }
}
