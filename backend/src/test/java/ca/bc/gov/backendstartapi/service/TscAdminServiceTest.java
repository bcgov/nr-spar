package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class TscAdminServiceTest {

  @Mock SeedlotRepository seedlotRepository;

  @Mock SeedlotStatusService seedlotStatusService;

  @Mock SeedlotSeedPlanZoneRepository seedlotSeedPlanZoneRepository;

  @Mock GeneticClassRepository geneticClassRepository;

  @Mock SeedlotGeneticWorthService seedlotGeneticWorthService;

  private TscAdminService tscAdminService;

  private SeedlotStatusEntity createValidStatus(String status) {
    SeedlotStatusEntity seedlotStatus = new SeedlotStatusEntity();
    seedlotStatus.setSeedlotStatusCode(status);

    LocalDate yesterday = LocalDate.now().minusDays(1L);
    LocalDate tomorrow = yesterday.plusWeeks(1L);
    seedlotStatus.setEffectiveDateRange(new EffectiveDateRange(yesterday, tomorrow));

    return seedlotStatus;
  }

  @BeforeEach
  void setup() {
    tscAdminService =
        new TscAdminService(
            seedlotRepository,
            seedlotStatusService,
            seedlotSeedPlanZoneRepository,
            geneticClassRepository,
            seedlotGeneticWorthService);
  }

  @Test
  @DisplayName("get Seedlots for the TSC_Admin role")
  void getTscAdminSeedlots_happyPath_shouldSuceed() {
    Integer page = 0;
    Integer size = 10;

    Pageable sortedPageable =
        PageRequest.of(page, size, Sort.by(Direction.DESC, "AuditInformation_UpdateTimestamp"));

    Seedlot seedlot = new Seedlot("63712");
    seedlot.setApplicantClientNumber("00012345");

    Page<Seedlot> seedlotPage = new PageImpl<>(List.of(seedlot));
    when(seedlotRepository.findAll(sortedPageable)).thenReturn(seedlotPage);

    Page<Seedlot> pageResult = tscAdminService.getTscAdminSeedlots(page, size);

    Assertions.assertNotNull(pageResult);
    Assertions.assertEquals("63712", pageResult.getContent().get(0).getId());
    Assertions.assertEquals("00012345", pageResult.getContent().get(0).getApplicantClientNumber());
  }

  @Test
  @DisplayName("Approves a seedlot number")
  void approveOrDisapproveSeedlot_approve_shouldSuceed() {
    SeedlotStatusEntity seedlotStatus = createValidStatus("APP");

    String seedlotNumber = "63123";
    Seedlot seedlot = new Seedlot(seedlotNumber);
    seedlot.setSeedlotStatus(seedlotStatus);

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.of(seedlot));
    when(seedlotStatusService.getValidSeedlotStatus("APP")).thenReturn(Optional.of(seedlotStatus));
    when(seedlotRepository.saveAndFlush(any())).thenReturn(seedlot);

    Seedlot seedlotSaved = tscAdminService.approveOrDisapproveSeedlot(seedlotNumber, Boolean.TRUE);

    Assertions.assertNotNull(seedlotSaved);
    Assertions.assertEquals(seedlotNumber, seedlotSaved.getId());
    Assertions.assertEquals("APP", seedlotSaved.getSeedlotStatus().getSeedlotStatusCode());
  }

  @Test
  @DisplayName("Disapproves a seedlot number")
  void approveOrDisapproveSeedlot_disapprove_shouldSucceed() {
    SeedlotStatusEntity seedlotStatus = createValidStatus("PND");

    String seedlotNumber = "63124";

    Seedlot seedlot = new Seedlot(seedlotNumber);
    seedlot.setSeedlotStatus(seedlotStatus);

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.of(seedlot));
    when(seedlotStatusService.getValidSeedlotStatus("PND")).thenReturn(Optional.of(seedlotStatus));
    when(seedlotRepository.saveAndFlush(any())).thenReturn(seedlot);

    Seedlot seedlotSaved = tscAdminService.approveOrDisapproveSeedlot(seedlotNumber, Boolean.FALSE);

    Assertions.assertNotNull(seedlotSaved);
    Assertions.assertEquals(seedlotNumber, seedlotSaved.getId());
    Assertions.assertEquals("PND", seedlotSaved.getSeedlotStatus().getSeedlotStatusCode());
  }

  @Test
  @DisplayName("Seedlot approval attempt seedlot not found should fail")
  void approveOrDisapproveSeedlot_seedlotNotFound_shouldFail() {
    String seedlotNumber = "63125";

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.empty());

    Assertions.assertThrows(
        SeedlotNotFoundException.class,
        () -> {
          tscAdminService.approveOrDisapproveSeedlot(seedlotNumber, Boolean.FALSE);
        });
  }

  @Test
  @DisplayName("Seedlot approval attempt seedlot status not found should fail")
  void approveOrDisapproveSeedlot_statusNotFound_shouldFail() {
    String seedlotNumber = "63126";
    SeedlotStatusEntity seedlotStatus = createValidStatus("PND");
    Seedlot seedlot = new Seedlot(seedlotNumber);
    seedlot.setSeedlotStatus(seedlotStatus);

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.of(seedlot));
    when(seedlotStatusService.getValidSeedlotStatus("APP")).thenReturn(Optional.empty());

    Assertions.assertThrows(
        SeedlotStatusNotFoundException.class,
        () -> {
          tscAdminService.approveOrDisapproveSeedlot(seedlotNumber, Boolean.FALSE);
        });
  }
}
