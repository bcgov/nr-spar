package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SmpMixGeneticQualityRepository;
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
class SmpMixGeneticQualityServiceTest {

  @Mock SmpMixGeneticQualityRepository smpMixGeneticQualityRepository;

  @Mock SmpMixService smpMixService;

  @Mock GeneticWorthEntityDao geneticWorthEntityDao;

  @Mock LoggedUserService loggedUserService;

  private SmpMixGeneticQualityService smpMixGeneticQualityService;

  @BeforeEach
  void setup() {
    smpMixGeneticQualityService =
        new SmpMixGeneticQualityService(
            smpMixGeneticQualityRepository,
            smpMixService,
            geneticWorthEntityDao,
            loggedUserService);
  }

  @Test
  @DisplayName("saveSeedlotFormStep5Test")
  void saveSeedlotFormStep5Test() {
    String seedlotNumber = "63001";

    Seedlot seedlot = new Seedlot(seedlotNumber);

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    SmpMix smpMix = new SmpMix(seedlot, 4032, "37", 50, new BigDecimal("25"), audit, 0);

    when(smpMixService.getAllBySeedlotNumber(seedlotNumber)).thenReturn(List.of(smpMix));

    GeneticWorthEntity genEntity = new GeneticWorthEntity();
    genEntity.setGeneticWorthCode("GVO");
    when(geneticWorthEntityDao.getGeneticWorthEntity("GVO")).thenReturn(Optional.of(genEntity));

    ParentTreeGeneticQualityDto qualityDto =
        new ParentTreeGeneticQualityDto("BV", "GVO", new BigDecimal("18"), null, null);

    SeedlotFormParentTreeSmpDto seedlotFormParentTreeDto =
        new SeedlotFormParentTreeSmpDto(
            "63001",
            4032,
            "37",
            new BigDecimal("50"),
            new BigDecimal("25"),
            80,
            15,
            2500,
            new BigDecimal("0.7"),
            List.of(qualityDto));

    smpMixGeneticQualityService.saveSeedlotFormStep5(seedlot, List.of(seedlotFormParentTreeDto));

    verify(smpMixGeneticQualityRepository, times(1)).saveAll(any());
  }

  @Test
  @DisplayName("findAllBySmpMixTest")
  void findAllBySmpMixTest() {
    String seedlotNumber = "63001";
    AuditInformation audit = new AuditInformation("userId");
    Seedlot seedlot = new Seedlot(seedlotNumber);
    SmpMix smpMix = new SmpMix(seedlot, 4032, "37", 50, new BigDecimal("25"), audit, 0);
    GeneticWorthEntity genEntity = new GeneticWorthEntity();
    genEntity.setGeneticWorthCode("GVO");
    SmpMixGeneticQuality smixGenQlty =
        new SmpMixGeneticQuality(smpMix, "GVO", genEntity, new BigDecimal("18.1"), false, audit, 0);

    SmpMixId id = new SmpMixId("63001", 4032);
    when(smpMixGeneticQualityRepository.findAllBySmpMix(id)).thenReturn(List.of(smixGenQlty));

    List<SmpMixGeneticQuality> list =
        smpMixGeneticQualityService.findAllBySmpMix(new SmpMixId(seedlotNumber, 4032));

    Assertions.assertFalse(list.isEmpty());
  }
}
