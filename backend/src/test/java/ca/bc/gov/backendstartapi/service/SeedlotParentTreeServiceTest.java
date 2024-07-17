package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
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
        new ParentTreeGeneticQualityDto("BV", "GVO", new BigDecimal("18"));
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

    AuditInformation audit = new AuditInformation();
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
    AuditInformation audit = new AuditInformation();
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
        seedlotParentTreeService.saveSeedlotFormStep5(
            seedlot, List.of(formStep5, formStep5Two), false);

    Assertions.assertFalse(list.isEmpty());
    Assertions.assertEquals(1, list.size());
  }

  @Test
  @DisplayName("Save Seedlot Parent Tree with one method removed")
  void saveSeedlotFormStep4_updateSeedlotRemove_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");
    SeedlotFormParentTreeSmpDto formStep5 = createFormDto(4023);
    AuditInformation audit = new AuditInformation();
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
        seedlotParentTreeService.saveSeedlotFormStep5(seedlot, List.of(formStep5Two), false);

    Assertions.assertFalse(list.isEmpty());
    Assertions.assertEquals(1, list.size());
  }
}
