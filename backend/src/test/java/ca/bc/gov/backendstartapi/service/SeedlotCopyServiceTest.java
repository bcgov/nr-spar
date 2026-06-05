package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.entity.SaveSeedlotProgressEntityClassA;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotFormValidationException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.repository.SaveSeedlotProgressRepositoryClassA;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotGeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotOrchardRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeSmpMixRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SeedlotCopyServiceTest {

  @Mock private SeedlotRepository seedlotRepository;
  @Mock private SeedlotStatusService seedlotStatusService;
  @Mock private SaveSeedlotProgressRepositoryClassA saveProgressRepository;
  @Mock private SeedlotGeneticWorthRepository geneticWorthRepository;
  @Mock private SeedlotSeedPlanZoneRepository seedPlanZoneRepository;
  @Mock private SeedlotParentTreeRepository parentTreeRepository;
  @Mock private SeedlotParentTreeGeneticQualityRepository parentTreeGeneticQualityRepository;
  @Mock private SeedlotParentTreeSmpMixRepository parentTreeSmpMixRepository;
  @Mock private SmpMixRepository smpMixRepository;
  @Mock private SmpMixGeneticQualityRepository smpMixGeneticQualityRepository;
  @Mock private SeedlotOrchardRepository orchardRepository;
  @Mock private SeedlotCollectionMethodRepository collectionMethodRepository;

  private SeedlotCopyService service;

  private static final String SOURCE_NUM = "63001";
  private static final String USER_ID = "testUser";

  private Seedlot buildSourceSeedlot() {
    Seedlot s = new Seedlot(SOURCE_NUM);
    SeedlotStatusEntity status = new SeedlotStatusEntity();
    status.setSeedlotStatusCode("SUB");
    s.setSeedlotStatus(status);
    s.setComment("original comment");
    s.setNumberOfContainers(BigDecimal.TEN);
    s.setContainerVolume(new BigDecimal("5.00"));
    s.setTotalConeVolume(new BigDecimal("50.00"));
    s.setAuditInformation(new AuditInformation("originalUser"));
    return s;
  }

  private SeedlotStatusEntity pndStatus() {
    SeedlotStatusEntity e = new SeedlotStatusEntity();
    e.setSeedlotStatusCode(Constants.PENDING_SEEDLOT_STATUS);
    return e;
  }

  /**
   * Stubs all child-entity repositories to return empty lists (no-op copy) and stubs the draft
   * save to return its argument.
   */
  private void stubChildRepos() {
    when(geneticWorthRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(seedPlanZoneRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeGeneticQualityRepository.findAllBySeedlotParentTree_Seedlot_id(anyString()))
        .thenReturn(List.of());
    when(parentTreeSmpMixRepository.findAllBySeedlotParentTree_Seedlot_id(anyString()))
        .thenReturn(List.of());
    when(smpMixRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(smpMixGeneticQualityRepository.findAllBySmpMix_Seedlot_id(anyString()))
        .thenReturn(List.of());
    when(orchardRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(collectionMethodRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(saveProgressRepository.save(any())).thenAnswer(i -> i.getArgument(0));
  }

  @BeforeEach
  void setup() {
    service =
        new SeedlotCopyService(
            seedlotRepository,
            seedlotStatusService,
            saveProgressRepository,
            geneticWorthRepository,
            seedPlanZoneRepository,
            parentTreeRepository,
            parentTreeGeneticQualityRepository,
            parentTreeSmpMixRepository,
            smpMixRepository,
            smpMixGeneticQualityRepository,
            orchardRepository,
            collectionMethodRepository);
  }

  // ── Auto-numbering ──────────────────────────────────────────────────────────

  @Test
  @DisplayName("Auto-assign: empty copy band starts at 62000")
  void autoAssign_emptyBand_assignsMin() {
    when(seedlotRepository.findById(SOURCE_NUM)).thenReturn(Optional.of(buildSourceSeedlot()));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_COPY_MIN, Constants.CLASS_A_COPY_MAX))
        .thenReturn(null);
    when(seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS))
        .thenReturn(Optional.of(pndStatus()));
    when(seedlotRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    stubChildRepos();

    SeedlotStatusResponseDto result = service.copySeedlot(SOURCE_NUM, USER_ID);

    assertEquals("62000", result.seedlotNumber());
    assertEquals(Constants.PENDING_SEEDLOT_STATUS, result.seedlotStatusCode());
  }

  @Test
  @DisplayName("Auto-assign: next slot after existing max")
  void autoAssign_partialBand_assignsNextAfterMax() {
    when(seedlotRepository.findById(SOURCE_NUM)).thenReturn(Optional.of(buildSourceSeedlot()));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_COPY_MIN, Constants.CLASS_A_COPY_MAX))
        .thenReturn(62005);
    when(seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS))
        .thenReturn(Optional.of(pndStatus()));
    when(seedlotRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    stubChildRepos();

    SeedlotStatusResponseDto result = service.copySeedlot(SOURCE_NUM, USER_ID);

    assertEquals("62006", result.seedlotNumber());
  }

  @Test
  @DisplayName("Auto-assign: band exhausted when next >= CLASS_A_COPY_MAX throws 400")
  void autoAssign_bandExhausted_throws400() {
    when(seedlotRepository.findById(SOURCE_NUM)).thenReturn(Optional.of(buildSourceSeedlot()));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_COPY_MIN, Constants.CLASS_A_COPY_MAX))
        .thenReturn(Constants.CLASS_A_COPY_MAX - 1);

    assertThrows(
        SeedlotFormValidationException.class, () -> service.copySeedlot(SOURCE_NUM, USER_ID));
  }

  // ── Source not found ─────────────────────────────────────────────────────────

  @Test
  @DisplayName("Source seedlot not found throws 404")
  void sourceSeedlot_notFound_throws404() {
    when(seedlotRepository.findById(SOURCE_NUM)).thenReturn(Optional.empty());

    assertThrows(SeedlotNotFoundException.class, () -> service.copySeedlot(SOURCE_NUM, USER_ID));
  }

  // ── Field resets ─────────────────────────────────────────────────────────────

  @Test
  @DisplayName("Field resets: containers=1, volumes=0.01, comment prefixed, declaration cleared")
  void fieldResets_appliedCorrectly() {
    Seedlot source = buildSourceSeedlot();
    source.setComment("my original comment");

    when(seedlotRepository.findById(SOURCE_NUM)).thenReturn(Optional.of(source));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_COPY_MIN, Constants.CLASS_A_COPY_MAX))
        .thenReturn(null);
    when(seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS))
        .thenReturn(Optional.of(pndStatus()));

    Seedlot[] captured = new Seedlot[1];
    when(seedlotRepository.save(any()))
        .thenAnswer(
            i -> {
              captured[0] = i.getArgument(0);
              return captured[0];
            });
    stubChildRepos();

    service.copySeedlot(SOURCE_NUM, USER_ID);

    Seedlot saved = captured[0];
    assertEquals(BigDecimal.ONE, saved.getNumberOfContainers());
    assertEquals(new BigDecimal("0.01"), saved.getContainerVolume());
    assertEquals(new BigDecimal("0.01"), saved.getTotalConeVolume());
    assertEquals(
        "COPIED FROM LOT " + SOURCE_NUM + ".  my original comment", saved.getComment());
    assertEquals("COPIED_LOT", saved.getApprovedUserId());
    assertNull(saved.getDeclarationOfTrueInformationUserId());
    assertNull(saved.getDeclarationOfTrueInformationTimestamp());
    assertEquals(
        Constants.PENDING_SEEDLOT_STATUS, saved.getSeedlotStatus().getSeedlotStatusCode());
  }

  // ── Draft creation ───────────────────────────────────────────────────────────

  @Test
  @DisplayName("Draft: SaveSeedlotProgressEntityClassA is saved with allStepData = empty map")
  void draft_savedWithEmptyAllStepData() {
    when(seedlotRepository.findById(SOURCE_NUM)).thenReturn(Optional.of(buildSourceSeedlot()));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_COPY_MIN, Constants.CLASS_A_COPY_MAX))
        .thenReturn(null);
    when(seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS))
        .thenReturn(Optional.of(pndStatus()));
    when(seedlotRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    stubChildRepos();

    service.copySeedlot(SOURCE_NUM, USER_ID);

    ArgumentCaptor<SaveSeedlotProgressEntityClassA> captor =
        ArgumentCaptor.forClass(SaveSeedlotProgressEntityClassA.class);
    verify(saveProgressRepository).save(captor.capture());
    assertNotNull(captor.getValue().getAllStepData());
    assertTrue(captor.getValue().getAllStepData().isEmpty());
  }

  // ── TSC-Admin-only: verified at the endpoint layer ───────────────────────────

  @Test
  @DisplayName("PND status entity not found throws 500-level status error")
  void pndStatus_notFound_throwsStatusError() {
    when(seedlotRepository.findById(SOURCE_NUM)).thenReturn(Optional.of(buildSourceSeedlot()));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_COPY_MIN, Constants.CLASS_A_COPY_MAX))
        .thenReturn(null);
    when(seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS))
        .thenReturn(Optional.empty());

    assertThrows(
        SeedlotStatusNotFoundException.class, () -> service.copySeedlot(SOURCE_NUM, USER_ID));
  }
}
