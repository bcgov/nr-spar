package ca.bc.gov.backendstartapi.report;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.ClientIdForbiddenException;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
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
}
