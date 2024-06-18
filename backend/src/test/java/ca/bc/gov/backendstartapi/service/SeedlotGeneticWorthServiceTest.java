package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotGeneticWorthRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SeedlotGeneticWorthServiceTest {

  @Mock SeedlotGeneticWorthRepository seedlotGeneticWorthRepository;

  @Mock LoggedUserService loggedUserService;

  @Mock GeneticWorthEntityDao geneticWorthEntityDao;

  private SeedlotGeneticWorthService seedlotGeneticWorthService;

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
    seedlotGeneticWorthService =
        new SeedlotGeneticWorthService(
            seedlotGeneticWorthRepository, loggedUserService, geneticWorthEntityDao);
  }

  @Test
  @DisplayName("Save Seedlot Genetic Worth first submmit")
  void saveSeedlotFormStep5_firstSubmit_shouldSucceed() {
    when(seedlotGeneticWorthRepository.findAllBySeedlot_id("54321")).thenReturn(List.of());

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    Seedlot seedlot = new Seedlot("54321");
    GeneticWorthEntity gw = new GeneticWorthEntity();
    gw.setGeneticWorthCode("GVO");

    when(geneticWorthEntityDao.getGeneticWorthEntity("GVO")).thenReturn(Optional.of(gw));

    SeedlotGeneticWorth sgw = new SeedlotGeneticWorth(seedlot, gw, audit);
    when(seedlotGeneticWorthRepository.saveAll(any())).thenReturn(List.of(sgw));

    SeedlotFormParentTreeSmpDto formStep5 = createFormDto(4023);

    List<SeedlotGeneticWorth> list =
        seedlotGeneticWorthService.saveSeedlotFormStep5(seedlot, List.of(formStep5), false);

    Assertions.assertFalse(list.isEmpty());
    Assertions.assertEquals(1, list.size());
  }

  @Test
  @DisplayName("Save Seedlot Genetic Worth with one new method")
  void saveSeedlotFormStep5_updateSeedlotAdd_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");
    AuditInformation audit = new AuditInformation("userId");
    GeneticWorthEntity gw = new GeneticWorthEntity();
    gw.setGeneticWorthCode("GVO");

    when(geneticWorthEntityDao.getGeneticWorthEntity("GVO")).thenReturn(Optional.of(gw));
    SeedlotGeneticWorth sgw = new SeedlotGeneticWorth(seedlot, gw, audit);

    when(seedlotGeneticWorthRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(sgw));
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);
    when(seedlotGeneticWorthRepository.saveAllAndFlush(any())).thenReturn(List.of(sgw));

    List<SeedlotGeneticWorth> list =
        seedlotGeneticWorthService.saveSeedlotFormStep5(
            seedlot, List.of(createFormDto(4025)), false);

    Assertions.assertTrue(list.isEmpty());
  }

  @Test
  @DisplayName("Delete all Seedlot Genetic Worth to a Seedlot happy path should succeed")
  void deleteAllForSeedlot_happyPath_shouldSucceed() {
    String seedlotNumber = "63111";
    Seedlot seedlot = new Seedlot(seedlotNumber);
    GeneticWorthEntity gw = new GeneticWorthEntity();
    gw.setGeneticWorthCode("GVO");
    AuditInformation audit = new AuditInformation("userId");

    SeedlotGeneticWorth seedGenWorth = new SeedlotGeneticWorth(seedlot, gw, audit);
    when(seedlotGeneticWorthRepository.findAllBySeedlot_id(seedlotNumber))
        .thenReturn(List.of(seedGenWorth));

    doNothing().when(seedlotGeneticWorthRepository).deleteAll(any());
    doNothing().when(seedlotGeneticWorthRepository).flush();

    seedlotGeneticWorthService.deleteAllForSeedlot(seedlotNumber);

    verify(seedlotGeneticWorthRepository, times(1)).deleteAll(any());
    verify(seedlotGeneticWorthRepository, times(1)).flush();
  }

  @Test
  @DisplayName("Delete all Seedlot Genetic Worth to a Seedlot empty list should succeed")
  void deleteAllForSeedlot_emptyList_shouldSucceed() {
    String seedlotNumber = "63111";
    when(seedlotGeneticWorthRepository.findAllBySeedlot_id(seedlotNumber)).thenReturn(List.of());

    seedlotGeneticWorthService.deleteAllForSeedlot(seedlotNumber);

    verify(seedlotGeneticWorthRepository, times(0)).deleteAll(any());
    verify(seedlotGeneticWorthRepository, times(0)).flush();
  }
}
