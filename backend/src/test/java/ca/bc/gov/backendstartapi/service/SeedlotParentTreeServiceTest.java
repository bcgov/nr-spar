package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotConflictDataException;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeSmpMixRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SeedlotParentTreeServiceTest {

  @Mock SeedlotParentTreeRepository seedlotParentTreeRepository;

  @Mock LoggedUserService loggedUserService;

  @Mock SeedlotParentTreeGeneticQualityRepository seedlotParentTreeGeneticQualityRepository;

  @Mock SeedlotParentTreeSmpMixRepository seedlotParentTreeSmpMixRepository;

  @Mock SmpMixGeneticQualityRepository smpMixGeneticQualityRepository;

  @Mock SmpMixRepository smpMixRepository;

  private SeedlotParentTreeService seedlotParentTreeService;

  private SeedlotFormParentTreeSmpDto createFormDto(Integer parentTreeId) {
    ParentTreeGeneticQualityDto ptgqDto =
        new ParentTreeGeneticQualityDto("BV", "GVO", new BigDecimal("18"), null, null);
    return new SeedlotFormParentTreeSmpDto(
        "85",
        parentTreeId,
        "87",
        new BigDecimal("1"),
        new BigDecimal("5"),
        6,
        2,
        50,
        new BigDecimal("100"),
        List.of(ptgqDto));
  }

  @BeforeEach
  void setup() {
    seedlotParentTreeService =
        new SeedlotParentTreeService(
            seedlotParentTreeRepository,
            seedlotParentTreeGeneticQualityRepository,
            seedlotParentTreeSmpMixRepository,
            smpMixGeneticQualityRepository,
            smpMixRepository,
            loggedUserService);
  }

  @Test
  @DisplayName("Save Seedlot Parent Tree first submit")
  void saveSeedlotFormStep5_firstSubmit_shouldSucceed() {
    when(seedlotParentTreeRepository.findAllBySeedlot_id("54321")).thenReturn(List.of());

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    SeedlotFormParentTreeSmpDto formStep5 = createFormDto(4023);

    Seedlot seedlot = new Seedlot("54321");
    SeedlotParentTree spt =
        new SeedlotParentTree(
            seedlot,
            formStep5.parentTreeId(),
            formStep5.parentTreeNumber(),
            formStep5.coneCount(),
            formStep5.pollenCount(),
            audit);
    when(seedlotParentTreeRepository.saveAll(any())).thenReturn(List.of(spt));

    List<SeedlotParentTree> list =
        seedlotParentTreeService.saveSeedlotFormStep5(seedlot, List.of(formStep5), false);

    Assertions.assertFalse(list.isEmpty());
    Assertions.assertEquals(1, list.size());
  }

  @Test
  @DisplayName("Save Seedlot Parent Tree with one new method")
  void saveSeedlotFormStep5_updateSeedlotAdd_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");
    SeedlotFormParentTreeSmpDto formStep5 = createFormDto(4023);
    AuditInformation audit = new AuditInformation("userId");
    SeedlotParentTree spt =
        new SeedlotParentTree(
            seedlot,
            formStep5.parentTreeId(),
            formStep5.parentTreeNumber(),
            formStep5.coneCount(),
            formStep5.pollenCount(),
            audit);

    when(seedlotParentTreeRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(spt));

    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    SeedlotFormParentTreeSmpDto formStep5Two = createFormDto(4024);
    SeedlotParentTree spt2 =
        new SeedlotParentTree(
            seedlot,
            formStep5Two.parentTreeId(),
            formStep5Two.parentTreeNumber(),
            formStep5Two.coneCount(),
            formStep5Two.pollenCount(),
            audit);

    when(seedlotParentTreeRepository.saveAll(any())).thenReturn(List.of(spt, spt2));

    List<SeedlotParentTree> list =
        seedlotParentTreeService.saveSeedlotFormStep5(
            seedlot, List.of(formStep5, formStep5Two), true);

    Assertions.assertEquals(2, list.size());
    Assertions.assertEquals(4023, list.get(0).getParentTreeId());
    Assertions.assertEquals(4024, list.get(1).getParentTreeId());
  }

  @Test
  @DisplayName("Save Seedlot Parent Tree with one method removed")
  void saveSeedlotFormStep4_updateSeedlotRemove_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");
    SeedlotFormParentTreeSmpDto formStep5 = createFormDto(4023);
    AuditInformation audit = new AuditInformation("userId");
    SeedlotParentTree spt =
        new SeedlotParentTree(
            seedlot,
            formStep5.parentTreeId(),
            formStep5.parentTreeNumber(),
            formStep5.coneCount(),
            formStep5.pollenCount(),
            audit);

    when(seedlotParentTreeRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(spt));

    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotParentTreeRepository.saveAll(any())).thenReturn(List.of(spt));

    SeedlotFormParentTreeSmpDto formStep5Two = createFormDto(4024);

    List<SeedlotParentTree> list =
        seedlotParentTreeService.saveSeedlotFormStep5(seedlot, List.of(formStep5Two), true);

    Assertions.assertFalse(list.isEmpty());
    Assertions.assertEquals(1, list.size());
  }

  @Test
  @DisplayName("getAllSeedlotParentTree should return list from repository")
  void getAllSeedlotParentTree_shouldSucceed() {
    when(seedlotParentTreeRepository.findAllBySeedlot_id("12345")).thenReturn(List.of());

    List<SeedlotParentTree> result = seedlotParentTreeService.getAllSeedlotParentTree("12345");

    Assertions.assertTrue(result.isEmpty());
  }

  @Test
  @DisplayName(
      "saveSeedlotFormStep5 with all existing data and canDelete should delete and re-insert")
  void saveSeedlotFormStep5_withExistingDataAndCanDelete_shouldSucceed() {
    Seedlot seedlot = new Seedlot("99999");
    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotParentTreeGeneticQualityRepository.findAllBySeedlotParentTree_Seedlot_id("99999"))
        .thenReturn(List.of(mock(SeedlotParentTreeGeneticQuality.class)));

    when(smpMixGeneticQualityRepository.findAllBySmpMix_Seedlot_id("99999"))
        .thenReturn(List.of(mock(SmpMixGeneticQuality.class)));

    SmpMix mockSmpMix = mock(SmpMix.class);
    when(mockSmpMix.getParentTreeId()).thenReturn(4023);
    when(smpMixRepository.findAllBySeedlot_id("99999")).thenReturn(List.of(mockSmpMix));

    when(seedlotParentTreeSmpMixRepository.findAllBySeedlotParentTree_Seedlot_id("99999"))
        .thenReturn(List.of(mock(SeedlotParentTreeSmpMix.class)));

    SeedlotFormParentTreeSmpDto formDto = createFormDto(4023);
    SeedlotParentTree existingSpt =
        new SeedlotParentTree(
            seedlot,
            formDto.parentTreeId(),
            formDto.parentTreeNumber(),
            formDto.coneCount(),
            formDto.pollenCount(),
            audit);
    when(seedlotParentTreeRepository.findAllBySeedlot_id("99999"))
        .thenReturn(List.of(existingSpt));

    when(seedlotParentTreeRepository.saveAll(any())).thenReturn(List.of(existingSpt));

    List<SeedlotParentTree> result =
        seedlotParentTreeService.saveSeedlotFormStep5(seedlot, List.of(formDto), true);

    Assertions.assertFalse(result.isEmpty());
    Assertions.assertEquals(1, result.size());
  }

  @Test
  @DisplayName(
      "saveSeedlotFormStep5 with existing genetic quality"
          + " and canDelete=false should throw conflict")
  void saveSeedlotFormStep5_conflictOnGeneticQuality_shouldThrow() {
    Seedlot seedlot = new Seedlot("88888");

    when(seedlotParentTreeGeneticQualityRepository.findAllBySeedlotParentTree_Seedlot_id("88888"))
        .thenReturn(List.of(mock(SeedlotParentTreeGeneticQuality.class)));

    Assertions.assertThrows(
        SeedlotConflictDataException.class,
        () -> seedlotParentTreeService.saveSeedlotFormStep5(seedlot, List.of(), false));
  }

  @Test
  @DisplayName("saveSeedlotFormStep5 with empty DTO list should return empty list")
  void saveSeedlotFormStep5_emptyDtoList_shouldReturnEmpty() {
    Seedlot seedlot = new Seedlot("77777");

    List<SeedlotParentTree> result =
        seedlotParentTreeService.saveSeedlotFormStep5(seedlot, List.of(), true);

    Assertions.assertTrue(result.isEmpty());
  }

  @Test
  @DisplayName("saveSeedlotFormStep5 conflict on SmpMixGeneticQuality when canDelete=false")
  void saveSeedlotFormStep5_conflictOnSmpMixGenQlty_shouldThrow() {
    Seedlot seedlot = new Seedlot("70001");

    when(smpMixGeneticQualityRepository.findAllBySmpMix_Seedlot_id("70001"))
        .thenReturn(List.of(mock(SmpMixGeneticQuality.class)));

    Assertions.assertThrows(
        SeedlotConflictDataException.class,
        () -> seedlotParentTreeService.saveSeedlotFormStep5(seedlot, List.of(), false));
  }

  @Test
  @DisplayName("saveSeedlotFormStep5 conflict on SmpMix when canDelete=false")
  void saveSeedlotFormStep5_conflictOnSmpMix_shouldThrow() {
    Seedlot seedlot = new Seedlot("70002");

    SmpMix mockSmpMix = mock(SmpMix.class);
    when(mockSmpMix.getParentTreeId()).thenReturn(100);
    when(smpMixRepository.findAllBySeedlot_id("70002")).thenReturn(List.of(mockSmpMix));

    Assertions.assertThrows(
        SeedlotConflictDataException.class,
        () -> seedlotParentTreeService.saveSeedlotFormStep5(seedlot, List.of(), false));
  }

  @Test
  @DisplayName("saveSeedlotFormStep5 conflict on SeedlotParentTreeSmpMix when canDelete=false")
  void saveSeedlotFormStep5_conflictOnSptSmpMix_shouldThrow() {
    Seedlot seedlot = new Seedlot("70003");

    when(seedlotParentTreeSmpMixRepository.findAllBySeedlotParentTree_Seedlot_id("70003"))
        .thenReturn(List.of(mock(SeedlotParentTreeSmpMix.class)));

    Assertions.assertThrows(
        SeedlotConflictDataException.class,
        () -> seedlotParentTreeService.saveSeedlotFormStep5(seedlot, List.of(), false));
  }

  @Test
  @DisplayName("saveSeedlotFormStep5 conflict on SeedlotParentTree when canDelete=false")
  void saveSeedlotFormStep5_conflictOnSeedlotParentTree_shouldThrow() {
    Seedlot seedlot = new Seedlot("70004");
    AuditInformation audit = new AuditInformation("userId");

    SeedlotParentTree existingSpt =
        new SeedlotParentTree(seedlot, 4023, "87", new BigDecimal("1"), new BigDecimal("5"), audit);
    when(seedlotParentTreeRepository.findAllBySeedlot_id("70004"))
        .thenReturn(List.of(existingSpt));

    Assertions.assertThrows(
        SeedlotConflictDataException.class,
        () -> seedlotParentTreeService.saveSeedlotFormStep5(seedlot, List.of(), false));
  }
}
