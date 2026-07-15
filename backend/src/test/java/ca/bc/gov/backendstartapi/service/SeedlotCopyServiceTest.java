package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SaveSeedlotProgressEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.exception.SeedlotFormValidationException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.repository.SaveSeedlotProgressRepository;
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
import java.time.LocalDate;
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
  @Mock private SaveSeedlotProgressRepository saveProgressRepository;
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
  private static final String SOURCE_B_NUM = "53001";
  private static final String USER_ID = "testUser";
  private static final EffectiveDateRange DATE_RANGE =
      new EffectiveDateRange(LocalDate.of(1900, 1, 1), LocalDate.of(9999, 12, 31));

  private Seedlot buildSourceSeedlot() {
    return buildSourceSeedlot(SOURCE_NUM, "A");
  }

  private Seedlot buildSourceSeedlot(String number, String geneticClassCode) {
    Seedlot s = new Seedlot(number);
    SeedlotStatusEntity status = new SeedlotStatusEntity();
    status.setSeedlotStatusCode("SUB");
    s.setSeedlotStatus(status);
    s.setGeneticClass(
        new GeneticClassEntity(
            geneticClassCode,
            geneticClassCode + " class seedlot",
            DATE_RANGE));
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
  @DisplayName("Draft: SaveSeedlotProgressEntity is saved with allStepData = empty map")
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

    ArgumentCaptor<SaveSeedlotProgressEntity> captor =
        ArgumentCaptor.forClass(SaveSeedlotProgressEntity.class);
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

  // ── Comment edge cases ───────────────────────────────────────────────────────

  @Test
  @DisplayName("Field resets: null source comment produces prefix-only comment")
  void fieldResets_nullComment_prefixOnly() {
    Seedlot source = buildSourceSeedlot();
    source.setComment(null);

    when(seedlotRepository.findById(SOURCE_NUM)).thenReturn(Optional.of(source));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_COPY_MIN, Constants.CLASS_A_COPY_MAX))
        .thenReturn(null);
    when(seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS))
        .thenReturn(Optional.of(pndStatus()));

    Seedlot[] captured = new Seedlot[1];
    when(seedlotRepository.save(any()))
        .thenAnswer(i -> {
          captured[0] = i.getArgument(0);
          return captured[0];
        });
    stubChildRepos();

    service.copySeedlot(SOURCE_NUM, USER_ID);

    assertEquals("COPIED FROM LOT " + SOURCE_NUM + ".  ", captured[0].getComment());
  }

  @Test
  @DisplayName("Field resets: source comment longer than 1950 chars is truncated to 1950")
  void fieldResets_longComment_isTruncated() {
    Seedlot source = buildSourceSeedlot();
    source.setComment("A".repeat(2000));

    when(seedlotRepository.findById(SOURCE_NUM)).thenReturn(Optional.of(source));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_COPY_MIN, Constants.CLASS_A_COPY_MAX))
        .thenReturn(null);
    when(seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS))
        .thenReturn(Optional.of(pndStatus()));

    Seedlot[] captured = new Seedlot[1];
    when(seedlotRepository.save(any()))
        .thenAnswer(i -> {
          captured[0] = i.getArgument(0);
          return captured[0];
        });
    stubChildRepos();

    service.copySeedlot(SOURCE_NUM, USER_ID);

    String expected = "COPIED FROM LOT " + SOURCE_NUM + ".  " + "A".repeat(1950);
    assertEquals(expected, captured[0].getComment());
  }

  // ── Child entity copying ─────────────────────────────────────────────────────

  /**
   * Stubs every child repository with one mock entity and returns a shared common setup
   * for full-copy tests.
   */
  private void stubCommonForFullCopy() {
    when(seedlotRepository.findById(SOURCE_NUM)).thenReturn(Optional.of(buildSourceSeedlot()));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_COPY_MIN, Constants.CLASS_A_COPY_MAX))
        .thenReturn(null);
    when(seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS))
        .thenReturn(Optional.of(pndStatus()));
    when(seedlotRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    when(saveProgressRepository.save(any())).thenAnswer(i -> i.getArgument(0));
  }

  @Test
  @DisplayName("copyGeneticWorth: one source row causes one save with transferred values")
  void copyGeneticWorth_withData_savesEachItem() {
    SeedlotGeneticWorth gwSrc = mock(SeedlotGeneticWorth.class);
    GeneticWorthEntity gwEntity = mock(GeneticWorthEntity.class);
    when(gwSrc.getGeneticWorth()).thenReturn(gwEntity);
    when(gwSrc.getGeneticQualityValue()).thenReturn(new BigDecimal("2.5"));
    when(gwSrc.getTestedParentTreeContributionPercentage()).thenReturn(new BigDecimal("75.00"));

    stubCommonForFullCopy();
    when(geneticWorthRepository.findAllBySeedlot_id(SOURCE_NUM)).thenReturn(List.of(gwSrc));
    when(geneticWorthRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    // remaining child repos return empty
    when(seedPlanZoneRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(orchardRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(collectionMethodRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeGeneticQualityRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeSmpMixRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(smpMixRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(smpMixGeneticQualityRepository
        .findAllBySmpMix_Seedlot_id(anyString())).thenReturn(List.of());

    service.copySeedlot(SOURCE_NUM, USER_ID);

    ArgumentCaptor<SeedlotGeneticWorth> cap = ArgumentCaptor.forClass(SeedlotGeneticWorth.class);
    verify(geneticWorthRepository).save(cap.capture());
    assertEquals(new BigDecimal("2.5"), cap.getValue().getGeneticQualityValue());
    assertEquals(
        new BigDecimal("75.00"),
        cap.getValue().getTestedParentTreeContributionPercentage());
  }

  @Test
  @DisplayName("copySeedPlanZones: one source row causes one save")
  void copySeedPlanZones_withData_savesEachItem() {
    SeedlotSeedPlanZoneEntity spzSrc = mock(SeedlotSeedPlanZoneEntity.class);
    GeneticClassEntity gcEntity = mock(GeneticClassEntity.class);
    when(spzSrc.getSpzCode()).thenReturn("M");
    when(spzSrc.getGeneticClass()).thenReturn(gcEntity);
    when(spzSrc.getIsPrimary()).thenReturn(true);
    when(spzSrc.getSpzDescription()).thenReturn("Main Zone");
    when(spzSrc.getSeedPlanZoneId()).thenReturn(7);

    stubCommonForFullCopy();
    when(geneticWorthRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(seedPlanZoneRepository.findAllBySeedlot_id(SOURCE_NUM)).thenReturn(List.of(spzSrc));
    when(seedPlanZoneRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    when(orchardRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(collectionMethodRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeGeneticQualityRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeSmpMixRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(smpMixRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(smpMixGeneticQualityRepository
        .findAllBySmpMix_Seedlot_id(anyString())).thenReturn(List.of());

    service.copySeedlot(SOURCE_NUM, USER_ID);

    ArgumentCaptor<SeedlotSeedPlanZoneEntity> cap =
        ArgumentCaptor.forClass(SeedlotSeedPlanZoneEntity.class);
    verify(seedPlanZoneRepository).save(cap.capture());
    assertEquals("M", cap.getValue().getSpzCode());
    assertEquals(7, cap.getValue().getSeedPlanZoneId());
  }

  @Test
  @DisplayName("copyOrchards: one source row causes one save with isPrimary and orchardId")
  void copyOrchards_withData_savesEachItem() {
    SeedlotOrchard orchardSrc = mock(SeedlotOrchard.class);
    when(orchardSrc.getIsPrimary()).thenReturn(true);
    when(orchardSrc.getOrchardId()).thenReturn("405");

    stubCommonForFullCopy();
    when(geneticWorthRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(seedPlanZoneRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(orchardRepository.findAllBySeedlot_id(SOURCE_NUM)).thenReturn(List.of(orchardSrc));
    when(orchardRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    when(collectionMethodRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeGeneticQualityRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeSmpMixRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(smpMixRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(smpMixGeneticQualityRepository
        .findAllBySmpMix_Seedlot_id(anyString())).thenReturn(List.of());

    service.copySeedlot(SOURCE_NUM, USER_ID);

    ArgumentCaptor<SeedlotOrchard> cap = ArgumentCaptor.forClass(SeedlotOrchard.class);
    verify(orchardRepository).save(cap.capture());
    assertTrue(cap.getValue().getIsPrimary());
    assertEquals("405", cap.getValue().getOrchardId());
  }

  @Test
  @DisplayName("copyCollectionMethods: one source row causes one save")
  void copyCollectionMethods_withData_savesEachItem() {
    SeedlotCollectionMethod cmSrc = mock(SeedlotCollectionMethod.class);
    when(cmSrc.getConeCollectionMethod()).thenReturn(mock(
        ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity.class));
    when(cmSrc.getConeCollectionMethodOtherDescription()).thenReturn("other desc");

    stubCommonForFullCopy();
    when(geneticWorthRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(seedPlanZoneRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(orchardRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(collectionMethodRepository.findAllBySeedlot_id(SOURCE_NUM))
        .thenReturn(List.of(cmSrc));
    when(collectionMethodRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    when(parentTreeRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeGeneticQualityRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeSmpMixRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(smpMixRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(smpMixGeneticQualityRepository
        .findAllBySmpMix_Seedlot_id(anyString())).thenReturn(List.of());

    service.copySeedlot(SOURCE_NUM, USER_ID);

    ArgumentCaptor<SeedlotCollectionMethod> cap =
        ArgumentCaptor.forClass(SeedlotCollectionMethod.class);
    verify(collectionMethodRepository).save(cap.capture());
    assertEquals("other desc", cap.getValue().getConeCollectionMethodOtherDescription());
  }

  @Test
  @DisplayName("copyParentTrees + child quality/smpMix: matching PT ID routes correctly")
  void copyParentTreesAndChildren_withData_savesAll() {
    // Source parent tree with ID 100
    SeedlotParentTree ptSrc = mock(SeedlotParentTree.class);
    when(ptSrc.getParentTreeId()).thenReturn(100);
    when(ptSrc.getParentTreeNumber()).thenReturn("100");
    when(ptSrc.getConeCount()).thenReturn(new BigDecimal("10.0"));
    when(ptSrc.getPollenCount()).thenReturn(new BigDecimal("5.0"));
    when(ptSrc.getSmpSuccessPercentage()).thenReturn(80);
    when(ptSrc.getNonOrchardPollenContaminationCount()).thenReturn(5);

    // save returns a mock with same PT ID so the ptMap lookup works downstream
    SeedlotParentTree ptSaved = mock(SeedlotParentTree.class);
    when(ptSaved.getParentTreeId()).thenReturn(100);

    // PT genetic quality pointing to PT 100
    SeedlotParentTreeGeneticQuality ptgqSrc = mock(SeedlotParentTreeGeneticQuality.class);
    when(ptgqSrc.getSeedlotParentTree()).thenReturn(ptSrc);
    when(ptgqSrc.getGeneticTypeCode()).thenReturn("BV");
    when(ptgqSrc.getGeneticWorth()).thenReturn(mock(GeneticWorthEntity.class));
    when(ptgqSrc.getGeneticQualityValue()).thenReturn(new BigDecimal("1.5"));

    // PT smp mix pointing to PT 100
    SeedlotParentTreeSmpMix ptSmpSrc = mock(SeedlotParentTreeSmpMix.class);
    when(ptSmpSrc.getSeedlotParentTree()).thenReturn(ptSrc);
    when(ptSmpSrc.getGeneticTypeCode()).thenReturn("BV");
    when(ptSmpSrc.getGeneticWorth()).thenReturn(mock(GeneticWorthEntity.class));
    when(ptSmpSrc.getGeneticQualityValue()).thenReturn(new BigDecimal("1.0"));

    // SmpMix with ID 200
    SmpMix smpSrc = mock(SmpMix.class);
    when(smpSrc.getParentTreeId()).thenReturn(200);
    when(smpSrc.getParentTreeNumber()).thenReturn("200");
    when(smpSrc.getAmountOfMaterial()).thenReturn(10);
    when(smpSrc.getProportion()).thenReturn(new BigDecimal("0.5"));

    SmpMix smpSaved = mock(SmpMix.class);
    when(smpSaved.getParentTreeId()).thenReturn(200);

    // SmpMix genetic quality pointing to SmpMix 200
    SmpMixGeneticQuality smqSrc = mock(SmpMixGeneticQuality.class);
    when(smqSrc.getSmpMix()).thenReturn(smpSrc);
    when(smqSrc.getGeneticTypeCode()).thenReturn("BV");
    when(smqSrc.getGeneticWorth()).thenReturn(mock(GeneticWorthEntity.class));
    when(smqSrc.getGeneticQualityValue()).thenReturn(new BigDecimal("2.0"));

    stubCommonForFullCopy();
    when(geneticWorthRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(seedPlanZoneRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(orchardRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(collectionMethodRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeRepository.findAllBySeedlot_id(SOURCE_NUM)).thenReturn(List.of(ptSrc));
    when(parentTreeRepository.save(any())).thenReturn(ptSaved);
    when(parentTreeGeneticQualityRepository
        .findAllBySeedlotParentTree_Seedlot_id(SOURCE_NUM)).thenReturn(List.of(ptgqSrc));
    when(parentTreeGeneticQualityRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    when(parentTreeSmpMixRepository
        .findAllBySeedlotParentTree_Seedlot_id(SOURCE_NUM)).thenReturn(List.of(ptSmpSrc));
    when(parentTreeSmpMixRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    when(smpMixRepository.findAllBySeedlot_id(SOURCE_NUM)).thenReturn(List.of(smpSrc));
    when(smpMixRepository.save(any())).thenReturn(smpSaved);
    when(smpMixGeneticQualityRepository
        .findAllBySmpMix_Seedlot_id(SOURCE_NUM)).thenReturn(List.of(smqSrc));
    when(smpMixGeneticQualityRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    service.copySeedlot(SOURCE_NUM, USER_ID);

    verify(parentTreeRepository).save(any());
    verify(parentTreeGeneticQualityRepository).save(any());
    verify(parentTreeSmpMixRepository).save(any());
    verify(smpMixRepository).save(any());
    verify(smpMixGeneticQualityRepository).save(any());
  }

  // ── Orphaned-ID guard branches ───────────────────────────────────────────────

  @Test
  @DisplayName("copyParentTreeGeneticQuality: row with unknown PT ID is skipped (no save)")
  void copyParentTreeGeneticQuality_orphanedPtId_skipsRow() {
    // ptMap will be empty (no parent trees), so any PT GQ with ptId=42 is orphaned
    SeedlotParentTree orphanPt = mock(SeedlotParentTree.class);
    when(orphanPt.getParentTreeId()).thenReturn(42);

    SeedlotParentTreeGeneticQuality ptgqSrc = mock(SeedlotParentTreeGeneticQuality.class);
    when(ptgqSrc.getSeedlotParentTree()).thenReturn(orphanPt);

    stubCommonForFullCopy();
    when(geneticWorthRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(seedPlanZoneRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(orchardRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(collectionMethodRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeGeneticQualityRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of(ptgqSrc));
    when(parentTreeSmpMixRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(smpMixRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(smpMixGeneticQualityRepository
        .findAllBySmpMix_Seedlot_id(anyString())).thenReturn(List.of());

    service.copySeedlot(SOURCE_NUM, USER_ID);

    verify(parentTreeGeneticQualityRepository, never()).save(any());
  }

  @Test
  @DisplayName("copyParentTreeSmpMix: row with unknown PT ID is skipped (no save)")
  void copyParentTreeSmpMix_orphanedPtId_skipsRow() {
    SeedlotParentTree orphanPt = mock(SeedlotParentTree.class);
    when(orphanPt.getParentTreeId()).thenReturn(99);

    SeedlotParentTreeSmpMix ptSmpSrc = mock(SeedlotParentTreeSmpMix.class);
    when(ptSmpSrc.getSeedlotParentTree()).thenReturn(orphanPt);

    stubCommonForFullCopy();
    when(geneticWorthRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(seedPlanZoneRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(orchardRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(collectionMethodRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeGeneticQualityRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeSmpMixRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of(ptSmpSrc));
    when(smpMixRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(smpMixGeneticQualityRepository
        .findAllBySmpMix_Seedlot_id(anyString())).thenReturn(List.of());

    service.copySeedlot(SOURCE_NUM, USER_ID);

    verify(parentTreeSmpMixRepository, never()).save(any());
  }

  @Test
  @DisplayName("copySmpMixGeneticQuality: row with unknown SmpMix ID is skipped (no save)")
  void copySmpMixGeneticQuality_orphanedSmpId_skipsRow() {
    SmpMix orphanSmp = mock(SmpMix.class);
    when(orphanSmp.getParentTreeId()).thenReturn(77);

    SmpMixGeneticQuality smqSrc = mock(SmpMixGeneticQuality.class);
    when(smqSrc.getSmpMix()).thenReturn(orphanSmp);

    stubCommonForFullCopy();
    when(geneticWorthRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(seedPlanZoneRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(orchardRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(collectionMethodRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeGeneticQualityRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(parentTreeSmpMixRepository
        .findAllBySeedlotParentTree_Seedlot_id(anyString())).thenReturn(List.of());
    when(smpMixRepository.findAllBySeedlot_id(anyString())).thenReturn(List.of());
    when(smpMixGeneticQualityRepository
        .findAllBySmpMix_Seedlot_id(anyString())).thenReturn(List.of(smqSrc));

    service.copySeedlot(SOURCE_NUM, USER_ID);

    verify(smpMixGeneticQualityRepository, never()).save(any());
  }

  // ── Class B copy ─────────────────────────────────────────────────────────────

  private void stubCommonForBclassCopy() {
    when(seedlotRepository.findById(SOURCE_B_NUM))
        .thenReturn(Optional.of(buildSourceSeedlot(SOURCE_B_NUM, "B")));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_B_COPY_MIN, Constants.CLASS_B_COPY_MAX))
        .thenReturn(null);
    when(seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS))
        .thenReturn(Optional.of(pndStatus()));
    when(seedlotRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    stubChildRepos();
  }

  @Test
  @DisplayName("Auto-assign B: empty copy band starts at 52000")
  void autoAssign_emptyBclassBand_assignsMin() {
    stubCommonForBclassCopy();

    SeedlotStatusResponseDto result = service.copySeedlot(SOURCE_B_NUM, USER_ID);

    assertEquals("52000", result.seedlotNumber());
    assertEquals(Constants.PENDING_SEEDLOT_STATUS, result.seedlotStatusCode());
  }

  @Test
  @DisplayName("Auto-assign B: next slot after existing max")
  void autoAssign_partialBclassBand_assignsNextAfterMax() {
    when(seedlotRepository.findById(SOURCE_B_NUM))
        .thenReturn(Optional.of(buildSourceSeedlot(SOURCE_B_NUM, "B")));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_B_COPY_MIN, Constants.CLASS_B_COPY_MAX))
        .thenReturn(52005);
    when(seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS))
        .thenReturn(Optional.of(pndStatus()));
    when(seedlotRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    stubChildRepos();

    SeedlotStatusResponseDto result = service.copySeedlot(SOURCE_B_NUM, USER_ID);

    assertEquals("52006", result.seedlotNumber());
  }

  @Test
  @DisplayName("Auto-assign B: band exhausted when next >= CLASS_B_COPY_MAX throws 400")
  void autoAssign_bBandExhausted_throws400() {
    when(seedlotRepository.findById(SOURCE_B_NUM))
        .thenReturn(Optional.of(buildSourceSeedlot(SOURCE_B_NUM, "B")));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_B_COPY_MIN, Constants.CLASS_B_COPY_MAX))
        .thenReturn(Constants.CLASS_B_COPY_MAX - 1);

    assertThrows(
        SeedlotFormValidationException.class, () -> service.copySeedlot(SOURCE_B_NUM, USER_ID));
  }

  @Test
  @DisplayName("B copy: skips A-only child entities (orchards / parent trees / SMP)")
  void copyBclass_skipsAclassOnlyChildren() {
    stubCommonForBclassCopy();

    service.copySeedlot(SOURCE_B_NUM, USER_ID);

    verify(orchardRepository, never()).findAllBySeedlot_id(anyString());
    verify(parentTreeRepository, never()).findAllBySeedlot_id(anyString());
    verify(smpMixRepository, never()).findAllBySeedlot_id(anyString());
  }

  @Test
  @DisplayName("B copy: shares genetic worth / plan zones / collection methods with A path")
  void copyB_copiesSharedChildren() {
    SeedlotGeneticWorth gwSrc = mock(SeedlotGeneticWorth.class);
    when(gwSrc.getGeneticWorth()).thenReturn(mock(GeneticWorthEntity.class));
    when(gwSrc.getGeneticQualityValue()).thenReturn(new BigDecimal("1.2"));
    when(gwSrc.getTestedParentTreeContributionPercentage()).thenReturn(new BigDecimal("10.00"));

    SeedlotCollectionMethod cmSrc = mock(SeedlotCollectionMethod.class);
    when(cmSrc.getConeCollectionMethod()).thenReturn(mock(
        ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity.class));
    when(cmSrc.getConeCollectionMethodOtherDescription()).thenReturn("other");

    stubCommonForBclassCopy();
    when(geneticWorthRepository.findAllBySeedlot_id(SOURCE_B_NUM)).thenReturn(List.of(gwSrc));
    when(geneticWorthRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    when(collectionMethodRepository.findAllBySeedlot_id(SOURCE_B_NUM)).thenReturn(List.of(cmSrc));
    when(collectionMethodRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    service.copySeedlot(SOURCE_B_NUM, USER_ID);

    verify(geneticWorthRepository).save(any());
    verify(collectionMethodRepository).save(any());
  }

  @Test
  @DisplayName("B copy: draft progress keys are B wizard steps only")
  void copyBclass_draftHasBclassProgressKeys() {
    stubCommonForBclassCopy();

    service.copySeedlot(SOURCE_B_NUM, USER_ID);

    ArgumentCaptor<SaveSeedlotProgressEntity> captor =
        ArgumentCaptor.forClass(SaveSeedlotProgressEntity.class);
    verify(saveProgressRepository).save(captor.capture());
    assertTrue(captor.getValue().getAllStepData().isEmpty());
    assertTrue(captor.getValue().getProgressStatus().containsKey("collection"));
    assertTrue(captor.getValue().getProgressStatus().containsKey("ownership"));
    assertTrue(captor.getValue().getProgressStatus().containsKey("interim"));
    assertTrue(captor.getValue().getProgressStatus().containsKey("extraction"));
    assertFalse(captor.getValue().getProgressStatus().containsKey("orchard"));
    assertFalse(captor.getValue().getProgressStatus().containsKey("parent"));
  }

  @Test
  @DisplayName("B copy: genetic class B is preserved on target")
  void copyB_preservesGeneticClass() {
    Seedlot[] captured = new Seedlot[1];
    when(seedlotRepository.findById(SOURCE_B_NUM))
        .thenReturn(Optional.of(buildSourceSeedlot(SOURCE_B_NUM, "B")));
    when(seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_B_COPY_MIN, Constants.CLASS_B_COPY_MAX))
        .thenReturn(null);
    when(seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS))
        .thenReturn(Optional.of(pndStatus()));
    when(seedlotRepository.save(any()))
        .thenAnswer(
            i -> {
              captured[0] = i.getArgument(0);
              return captured[0];
            });
    stubChildRepos();

    service.copySeedlot(SOURCE_B_NUM, USER_ID);

    assertEquals("B", captured[0].getGeneticClass().getGeneticClassCode());
  }

  @Test
  @DisplayName("Source with missing genetic class throws 400")
  void sourceMissingGeneticClass_throws400() {
    Seedlot source = buildSourceSeedlot();
    source.setGeneticClass(null);
    when(seedlotRepository.findById(SOURCE_NUM)).thenReturn(Optional.of(source));

    assertThrows(
        SeedlotFormValidationException.class, () -> service.copySeedlot(SOURCE_NUM, USER_ID));
  }
}
