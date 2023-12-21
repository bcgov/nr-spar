package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
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
        seedlotGeneticWorthService.saveSeedlotFormStep5(seedlot, List.of(formStep5));

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
        seedlotGeneticWorthService.saveSeedlotFormStep5(seedlot, List.of(createFormDto(4025)));

    Assertions.assertTrue(list.isEmpty());
  }
}
