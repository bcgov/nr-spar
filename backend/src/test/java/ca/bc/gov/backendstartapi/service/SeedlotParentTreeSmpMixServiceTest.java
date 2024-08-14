package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeSmpMixRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.math.BigDecimal;
import java.time.LocalDate;
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
class SeedlotParentTreeSmpMixServiceTest {

  @Mock SeedlotParentTreeSmpMixRepository seedlotParentTreeSmpMixRepository;

  @Mock SeedlotParentTreeService seedlotParentTreeService;

  @Mock GeneticWorthEntityDao geneticWorthEntityDao;

  @Mock LoggedUserService loggedUserService;

  private SeedlotParentTreeSmpMixService seedlotParentTreeSmpMixService;

  @BeforeEach
  void setup() {
    this.seedlotParentTreeSmpMixService =
        new SeedlotParentTreeSmpMixService(
            seedlotParentTreeSmpMixRepository,
            seedlotParentTreeService,
            geneticWorthEntityDao,
            loggedUserService);
  }

  @Test
  @DisplayName("Save seedlot form step 5 happy path should succeed")
  void saveSeedlotFormStep5_happyPath_shouldSucceed() {
    String seedlotNumber = "63111";
    Seedlot seedlot = new Seedlot(seedlotNumber);

    Integer parentTreeId = 20012;
    String parentTreeNumber = "29";
    BigDecimal coneCount = new BigDecimal("500");
    BigDecimal pollenCount = new BigDecimal("1500");
    Integer smpSuccessPct = 25;
    Integer nonOrchardPollenContamPct = 0;
    Integer amountOfMaterial = 4000;
    BigDecimal proportion = new BigDecimal("0.00125");

    ParentTreeGeneticQualityDto quality =
        new ParentTreeGeneticQualityDto("BV", "GVO", new BigDecimal("11"), true, true);

    SeedlotParentTree parentTree =
        new SeedlotParentTree(
            seedlot,
            parentTreeId,
            parentTreeNumber,
            coneCount,
            pollenCount,
            new AuditInformation("test"));
    when(seedlotParentTreeService.getAllSeedlotParentTree(seedlotNumber))
        .thenReturn(List.of(parentTree));

    EffectiveDateRange dateRange =
        new EffectiveDateRange(LocalDate.now(), LocalDate.now().plusYears(1L));
    GeneticWorthEntity genWorth = new GeneticWorthEntity("GVO", "GVO", dateRange, BigDecimal.ZERO);
    when(geneticWorthEntityDao.getGeneticWorthEntity("GVO")).thenReturn(Optional.of(genWorth));

    when(loggedUserService.createAuditCurrentUser()).thenReturn(new AuditInformation("test"));

    when(seedlotParentTreeSmpMixRepository.saveAll(any())).thenReturn(List.of());

    SeedlotFormParentTreeSmpDto formDto =
        new SeedlotFormParentTreeSmpDto(
            seedlotNumber,
            parentTreeId,
            parentTreeNumber,
            coneCount,
            pollenCount,
            smpSuccessPct,
            nonOrchardPollenContamPct,
            amountOfMaterial,
            proportion,
            List.of(quality));

    seedlotParentTreeSmpMixService.saveSeedlotFormStep5(seedlot, List.of(formDto), true);

    verify(seedlotParentTreeSmpMixRepository, times(1)).saveAll(any());
  }

  @Test
  @DisplayName("Get all by seedlot number happy path should succeed")
  void getAllBySeedlotNumber_happyPath_shouldSucceed() {
    String seedlotNumber = "123";

    SeedlotParentTree seedlotParentTree = mock(SeedlotParentTree.class);
    GeneticWorthEntity geneticWorthEntity = mock(GeneticWorthEntity.class);
    geneticWorthEntity.setGeneticWorthCode("GVO");
    SeedlotParentTreeSmpMix smpMix =
        new SeedlotParentTreeSmpMix(
            seedlotParentTree,
            "BV",
            geneticWorthEntity,
            new BigDecimal("15"),
            new AuditInformation("test"));
    when(seedlotParentTreeSmpMixRepository.findAllBySeedlotParentTree_Seedlot_id(seedlotNumber))
        .thenReturn(List.of(smpMix));

    List<SeedlotParentTreeSmpMix> list =
        seedlotParentTreeSmpMixService.getAllBySeedlotNumber(seedlotNumber);

    Assertions.assertNotNull(list);
    Assertions.assertFalse(list.isEmpty());
    Assertions.assertEquals(1, list.size());
  }
}
