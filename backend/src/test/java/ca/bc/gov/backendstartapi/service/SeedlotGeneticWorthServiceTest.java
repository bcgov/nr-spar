package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
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

  @BeforeEach
  void setup() {
    seedlotGeneticWorthService =
        new SeedlotGeneticWorthService(
            seedlotGeneticWorthRepository, loggedUserService, geneticWorthEntityDao);
  }

  private AuditInformation mockAudit() {
    return new AuditInformation("userId");
  }

  private GeneticWorthEntity mockGeneticWorthEntity(String traitCode) {
    GeneticWorthEntity trait = new GeneticWorthEntity();
    trait.setGeneticWorthCode(traitCode);
    return trait;
  }

  private SeedlotGeneticWorth mockSeedlotGenWorth(Seedlot seedlot, String traitCode) {
    return new SeedlotGeneticWorth(seedlot, mockGeneticWorthEntity(traitCode), mockAudit());
  }

  @Test
  @DisplayName("Save seedlot genetic worth happy path should succeed")
  void saveSeedlotGenWorth_happyPath_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");

    SeedlotGeneticWorth gvoGenWorth = mockSeedlotGenWorth(seedlot, "GVO");
    gvoGenWorth.setGeneticQualityValue(new BigDecimal("19.1"));
    gvoGenWorth.setTestedParentTreeContributionPercentage(new BigDecimal("98"));
    SeedlotGeneticWorth wwdGenWorth = mockSeedlotGenWorth(seedlot, "WWD");
    wwdGenWorth.setGeneticQualityValue(new BigDecimal("12.1"));
    wwdGenWorth.setTestedParentTreeContributionPercentage(new BigDecimal("96"));

    when(seedlotGeneticWorthRepository.findAllBySeedlot_id(seedlot.getId()))
        .thenReturn(List.of(gvoGenWorth, wwdGenWorth));

    when(geneticWorthEntityDao.getGeneticWorthEntity("GVO"))
        .thenReturn(Optional.of(mockGeneticWorthEntity("GVO")));
    when(geneticWorthEntityDao.getGeneticWorthEntity("WWD"))
        .thenReturn(Optional.of(mockGeneticWorthEntity("WWD")));
    when(loggedUserService.createAuditCurrentUser()).thenReturn(mockAudit());

    when(seedlotGeneticWorthRepository.saveAll(any()))
        .thenReturn(List.of(gvoGenWorth, wwdGenWorth));

    GeneticWorthTraitsDto gvoDto =
        new GeneticWorthTraitsDto(
            "GVO",
            null,
            gvoGenWorth.getGeneticQualityValue(),
            gvoGenWorth.getTestedParentTreeContributionPercentage());
    GeneticWorthTraitsDto wwdDto =
        new GeneticWorthTraitsDto(
            "WWD",
            null,
            wwdGenWorth.getGeneticQualityValue(),
            wwdGenWorth.getTestedParentTreeContributionPercentage());

    List<SeedlotGeneticWorth> saved =
        seedlotGeneticWorthService.saveSeedlotGenWorth(seedlot, List.of(gvoDto, wwdDto));

    Assertions.assertNotNull(saved);
    Assertions.assertEquals(2, saved.size());
    Assertions.assertEquals("GVO", saved.get(0).getGeneticWorthCode());
    Assertions.assertEquals(new BigDecimal("19.1"), saved.get(0).getGeneticQualityValue());
    Assertions.assertEquals(
        new BigDecimal("98"), saved.get(0).getTestedParentTreeContributionPercentage());
    Assertions.assertEquals("WWD", saved.get(1).getGeneticWorthCode());
    Assertions.assertEquals(new BigDecimal("12.1"), saved.get(1).getGeneticQualityValue());
    Assertions.assertEquals(
        new BigDecimal("96"), saved.get(1).getTestedParentTreeContributionPercentage());

    verify(seedlotGeneticWorthRepository, times(1)).deleteAllById(any());
    verify(seedlotGeneticWorthRepository, times(1)).saveAll(any());
  }

  @Test
  @DisplayName("Save seedlot genetic worth empty existing should succeed")
  void saveSeedlotGenWorth_emptyExisting_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");

    SeedlotGeneticWorth gvoGenWorth = mockSeedlotGenWorth(seedlot, "GVO");
    gvoGenWorth.setGeneticQualityValue(new BigDecimal("19.1"));
    gvoGenWorth.setTestedParentTreeContributionPercentage(new BigDecimal("98"));
    SeedlotGeneticWorth wwdGenWorth = mockSeedlotGenWorth(seedlot, "WWD");
    wwdGenWorth.setGeneticQualityValue(new BigDecimal("12.1"));
    wwdGenWorth.setTestedParentTreeContributionPercentage(new BigDecimal("96"));

    when(seedlotGeneticWorthRepository.findAllBySeedlot_id(seedlot.getId())).thenReturn(List.of());

    when(geneticWorthEntityDao.getGeneticWorthEntity("GVO"))
        .thenReturn(Optional.of(mockGeneticWorthEntity("GVO")));
    when(geneticWorthEntityDao.getGeneticWorthEntity("WWD"))
        .thenReturn(Optional.of(mockGeneticWorthEntity("WWD")));
    when(loggedUserService.createAuditCurrentUser()).thenReturn(mockAudit());

    when(seedlotGeneticWorthRepository.saveAll(any()))
        .thenReturn(List.of(gvoGenWorth, wwdGenWorth));

    GeneticWorthTraitsDto gvoDto =
        new GeneticWorthTraitsDto(
            "GVO",
            null,
            gvoGenWorth.getGeneticQualityValue(),
            gvoGenWorth.getTestedParentTreeContributionPercentage());
    GeneticWorthTraitsDto wwdDto =
        new GeneticWorthTraitsDto(
            "WWD",
            null,
            wwdGenWorth.getGeneticQualityValue(),
            wwdGenWorth.getTestedParentTreeContributionPercentage());

    List<SeedlotGeneticWorth> saved =
        seedlotGeneticWorthService.saveSeedlotGenWorth(seedlot, List.of(gvoDto, wwdDto));

    Assertions.assertNotNull(saved);
    Assertions.assertEquals(2, saved.size());
    Assertions.assertEquals("GVO", saved.get(0).getGeneticWorthCode());
    Assertions.assertEquals(new BigDecimal("19.1"), saved.get(0).getGeneticQualityValue());
    Assertions.assertEquals(
        new BigDecimal("98"), saved.get(0).getTestedParentTreeContributionPercentage());
    Assertions.assertEquals("WWD", saved.get(1).getGeneticWorthCode());
    Assertions.assertEquals(new BigDecimal("12.1"), saved.get(1).getGeneticQualityValue());
    Assertions.assertEquals(
        new BigDecimal("96"), saved.get(1).getTestedParentTreeContributionPercentage());

    verify(seedlotGeneticWorthRepository, times(0)).deleteAllById(any());
    verify(seedlotGeneticWorthRepository, times(1)).saveAll(any());
  }

  void saveSeedlotGenWorth_nothingToSave_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");

    SeedlotGeneticWorth gvoGenWorth = mockSeedlotGenWorth(seedlot, "GVO");
    gvoGenWorth.setGeneticQualityValue(new BigDecimal("19.1"));
    gvoGenWorth.setTestedParentTreeContributionPercentage(new BigDecimal("98"));
    SeedlotGeneticWorth wwdGenWorth = mockSeedlotGenWorth(seedlot, "WWD");
    wwdGenWorth.setGeneticQualityValue(new BigDecimal("12.1"));
    wwdGenWorth.setTestedParentTreeContributionPercentage(new BigDecimal("96"));

    when(seedlotGeneticWorthRepository.findAllBySeedlot_id(seedlot.getId()))
        .thenReturn(List.of(gvoGenWorth, wwdGenWorth));

    when(geneticWorthEntityDao.getGeneticWorthEntity("GVO"))
        .thenReturn(Optional.of(mockGeneticWorthEntity("GVO")));
    when(geneticWorthEntityDao.getGeneticWorthEntity("WWD"))
        .thenReturn(Optional.of(mockGeneticWorthEntity("WWD")));
    when(loggedUserService.createAuditCurrentUser()).thenReturn(mockAudit());

    GeneticWorthTraitsDto gvoDto =
        new GeneticWorthTraitsDto(
            "GVO",
            null,
            gvoGenWorth.getGeneticQualityValue(),
            gvoGenWorth.getTestedParentTreeContributionPercentage());
    GeneticWorthTraitsDto wwdDto =
        new GeneticWorthTraitsDto(
            "WWD",
            null,
            wwdGenWorth.getGeneticQualityValue(),
            wwdGenWorth.getTestedParentTreeContributionPercentage());

    List<SeedlotGeneticWorth> saved =
        seedlotGeneticWorthService.saveSeedlotGenWorth(seedlot, List.of(gvoDto, wwdDto));

    Assertions.assertNotNull(saved);
    Assertions.assertEquals(2, saved.size());
    Assertions.assertEquals("GVO", saved.get(0).getGeneticWorthCode());
    Assertions.assertEquals(new BigDecimal("19.1"), saved.get(0).getGeneticQualityValue());
    Assertions.assertEquals(
        new BigDecimal("98"), saved.get(0).getTestedParentTreeContributionPercentage());
    Assertions.assertEquals("WWD", saved.get(1).getGeneticWorthCode());
    Assertions.assertEquals(new BigDecimal("12.1"), saved.get(1).getGeneticQualityValue());
    Assertions.assertEquals(
        new BigDecimal("96"), saved.get(1).getTestedParentTreeContributionPercentage());

    verify(seedlotGeneticWorthRepository, times(1)).deleteAllById(any());
    verify(seedlotGeneticWorthRepository, times(0)).saveAll(any());
  }
}
