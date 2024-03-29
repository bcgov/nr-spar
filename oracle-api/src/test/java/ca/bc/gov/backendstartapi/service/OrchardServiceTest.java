package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.OrchardLotTypeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticInfoDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.dto.SeedPlanZoneDto;
import ca.bc.gov.backendstartapi.entity.Orchard;
import ca.bc.gov.backendstartapi.entity.OrchardLotTypeCode;
import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
import ca.bc.gov.backendstartapi.entity.ParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.ParentTreeOrchard;
import ca.bc.gov.backendstartapi.entity.SeedPlanUnit;
import ca.bc.gov.backendstartapi.entity.SeedPlanZone;
import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUse;
import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUseSpu;
import ca.bc.gov.backendstartapi.entity.idclass.ParentTreeOrchardId;
import ca.bc.gov.backendstartapi.entity.projection.ParentTreeProj;
import ca.bc.gov.backendstartapi.exception.TestedPtAreaOfUseException;
import ca.bc.gov.backendstartapi.repository.OrchardRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeOrchardRepository;
import ca.bc.gov.backendstartapi.repository.ParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedPlanUnitRepository;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaOfUseSpuRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaofUseRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.projection.SpelAwareProxyProjectionFactory;

@ExtendWith(MockitoExtension.class)
class OrchardServiceTest {

  @Mock private OrchardRepository orchardRepository;

  @Mock private ParentTreeOrchardRepository parentTreeOrchardRepository;

  @Mock private ParentTreeRepository parentTreeRepository;

  @Mock private ParentTreeGeneticQualityRepository parentTreeGeneticQualityRepository;

  @Mock private TestedPtAreaofUseRepository testedPtAreaofUseRepository;

  @Mock private SeedPlanUnitRepository seedPlanUnitRepository;

  @Mock private SeedPlanZoneRepository seedPlanZoneRepository;

  @Mock private TestedPtAreaOfUseSpuRepository testedPtAreaOfUseSpuRepository;

  @Autowired @InjectMocks private OrchardService orchardService;

  @Test
  @DisplayName("findNotRetiredOrchardValidLotTypeTest_Prd")
  void findNotRetiredOrchardValidLotTypeTest_Prd() {
    Orchard orchard = new Orchard();
    orchard.setId("337");
    orchard.setName("GRANDVIEW");
    orchard.setVegetationCode("PLI");
    orchard.setStageCode("PRD");

    LocalDate now = LocalDate.now();

    OrchardLotTypeCode lotTypeCode = new OrchardLotTypeCode();
    lotTypeCode.setCode('S');
    lotTypeCode.setDescription("Seed Lot");
    lotTypeCode.setEffectiveDate(now.minusDays(1L));
    lotTypeCode.setExpiryDate(now.plusDays(30L));
    lotTypeCode.setUpdateTimestamp(now);
    orchard.setOrchardLotTypeCode(lotTypeCode);

    when(orchardRepository.findNotRetiredById(any())).thenReturn(Optional.of(orchard));

    Optional<OrchardLotTypeDescriptionDto> descriptionDto =
        orchardService.findNotRetiredOrchardValidLotType("337");

    Assertions.assertTrue(descriptionDto.isPresent());
    Assertions.assertEquals("337", descriptionDto.get().id());
    Assertions.assertEquals("GRANDVIEW", descriptionDto.get().name());
    Assertions.assertEquals("PLI", descriptionDto.get().vegetationCode());
    Assertions.assertEquals("PRD", descriptionDto.get().stageCode());
    Assertions.assertEquals('S', descriptionDto.get().lotTypeCode());
    Assertions.assertEquals("Seed Lot", descriptionDto.get().lotTypeDescription());
  }

  @Test
  @DisplayName("findNotRetiredOrchardValidLotTypeTest_Esb")
  void findNotRetiredOrchardValidLotTypeTest_Esb() {
    Orchard orchard = new Orchard();
    orchard.setId("820");
    orchard.setName("FERNDALE INSTITUTE");
    orchard.setVegetationCode("AX");
    orchard.setStageCode("ESB");

    LocalDate now = LocalDate.now();

    OrchardLotTypeCode lotTypeCode = new OrchardLotTypeCode();
    lotTypeCode.setCode('C');
    lotTypeCode.setDescription("Cutting Lot");
    lotTypeCode.setEffectiveDate(now.minusDays(1L));
    lotTypeCode.setExpiryDate(now.plusDays(30L));
    lotTypeCode.setUpdateTimestamp(now);
    orchard.setOrchardLotTypeCode(lotTypeCode);

    when(orchardRepository.findNotRetiredById(any())).thenReturn(Optional.of(orchard));

    Optional<OrchardLotTypeDescriptionDto> descriptionDto =
        orchardService.findNotRetiredOrchardValidLotType("820");

    Assertions.assertTrue(descriptionDto.isPresent());
    Assertions.assertEquals("820", descriptionDto.get().id());
    Assertions.assertEquals("FERNDALE INSTITUTE", descriptionDto.get().name());
    Assertions.assertEquals("AX", descriptionDto.get().vegetationCode());
    Assertions.assertEquals("ESB", descriptionDto.get().stageCode());
    Assertions.assertEquals('C', descriptionDto.get().lotTypeCode());
    Assertions.assertEquals("Cutting Lot", descriptionDto.get().lotTypeDescription());
  }

  @Test
  @DisplayName("findNotRetiredOrchardValidLotTypeTest_Ret")
  void findNotRetiredOrchardValidLotTypeTest_Ret() {
    Orchard orchard = new Orchard();
    orchard.setId("612");
    orchard.setName("E.KOOTENAY BREED A");
    orchard.setVegetationCode("SX");
    orchard.setStageCode("RET");

    LocalDate now = LocalDate.now();

    OrchardLotTypeCode lotTypeCode = new OrchardLotTypeCode();
    lotTypeCode.setCode('S');
    lotTypeCode.setDescription("Seed Lot");
    lotTypeCode.setEffectiveDate(now.minusDays(3L));
    lotTypeCode.setExpiryDate(now.minusDays(1L)); // expired
    lotTypeCode.setUpdateTimestamp(now);
    orchard.setOrchardLotTypeCode(lotTypeCode);

    when(orchardRepository.findNotRetiredById(any())).thenReturn(Optional.of(orchard));

    Optional<OrchardLotTypeDescriptionDto> descriptionDto =
        orchardService.findNotRetiredOrchardValidLotType("612");

    Assertions.assertTrue(descriptionDto.isEmpty());
  }

  @Test
  @DisplayName("findParentTreeGeneticQualityDataTest_Empty")
  void findParentTreeGeneticQualityDataTest_Empty() {
    String orchardId = "999";
    when(orchardRepository.findById(orchardId)).thenReturn(Optional.empty());

    Optional<OrchardParentTreeDto> dto =
        orchardService.findParentTreeGeneticQualityData(orchardId, 2L);

    Assertions.assertTrue(dto.isEmpty());
  }

  @Test
  @DisplayName("findParentTreeGeneticQualityDataTest_Success")
  void findParentTreeGeneticQualityDataTest_Success() {
    String orchardId = "407";

    // Orchard
    Orchard orchard = new Orchard();
    orchard.setId(orchardId);
    orchard.setName("Test");
    orchard.setVegetationCode("FDC");
    orchard.setStageCode("ABC");

    when(orchardRepository.findById(orchardId)).thenReturn(Optional.of(orchard));

    // Parent Tree Orchard
    ParentTreeOrchard parentTreeOrchard1 = new ParentTreeOrchard();
    ParentTreeOrchardId parentTreeOrchardId1 = new ParentTreeOrchardId();
    parentTreeOrchardId1.setParentTreeId(4032L);
    parentTreeOrchardId1.setOrchardId(orchardId);
    parentTreeOrchard1.setId(parentTreeOrchardId1);

    when(parentTreeOrchardRepository.findByIdOrchardId(orchardId))
        .thenReturn(List.of(parentTreeOrchard1));

    // Parent Tree
    ParentTreeEntity parentTree = new ParentTreeEntity();
    parentTree.setId(4032L);
    parentTree.setParentTreeNumber("37");
    parentTree.setVegetationCode("FDC");
    parentTree.setParentTreeRegStatusCode("APP");
    parentTree.setLocalNumber("123");
    parentTree.setActive(true);
    parentTree.setTested(true);
    parentTree.setBreedingProgram(true);

    when(parentTreeRepository.findAllIn(any())).thenReturn(List.of(parentTree));

    Long spuId = 7L;

    // Parent Tree Genetic Quality
    ParentTreeGeneticQuality geneticQuality = new ParentTreeGeneticQuality();
    geneticQuality.setId(555L);
    geneticQuality.setParentTreeId(parentTreeOrchard1.getId().getParentTreeId());
    geneticQuality.setSeedPlanningUnitId(spuId);
    geneticQuality.setGeneticTypeCode("BV");
    geneticQuality.setGeneticWorthCode("GVO");
    geneticQuality.setGeneticQualityValue(new BigDecimal("18.0"));
    geneticQuality.setToBeUsedInCalculations(true);

    when(parentTreeGeneticQualityRepository.findAllBySpuGeneticWorthTypeParentTreeId(
            spuId, true, "BV", List.of(4032L)))
        .thenReturn(List.of(geneticQuality));

    Optional<OrchardParentTreeDto> dto =
        orchardService.findParentTreeGeneticQualityData(orchardId, spuId);

    Assertions.assertFalse(dto.isEmpty());

    OrchardParentTreeDto orchardParentTreeDto = dto.get();

    // Orchard Parent Tree
    Assertions.assertEquals(orchardId, orchardParentTreeDto.getOrchardId());
    Assertions.assertEquals("FDC", orchardParentTreeDto.getVegetationCode());
    Assertions.assertEquals(7L, orchardParentTreeDto.getSeedPlanningUnitId());
    Assertions.assertEquals(1, orchardParentTreeDto.getParentTrees().size());

    // Parent Trees
    ParentTreeGeneticInfoDto parentTreeDto = orchardParentTreeDto.getParentTrees().get(0);
    Assertions.assertEquals(4032L, parentTreeDto.getParentTreeId());
    Assertions.assertEquals("37", parentTreeDto.getParentTreeNumber());
    Assertions.assertEquals("APP", parentTreeDto.getParentTreeRegStatusCode());
    Assertions.assertEquals("123", parentTreeDto.getLocalNumber());
    Assertions.assertTrue(parentTreeDto.getActive());
    Assertions.assertTrue(parentTreeDto.getTested());
    Assertions.assertTrue(parentTreeDto.getBreedingProgram());
    Assertions.assertNull(parentTreeDto.getFemaleParentTreeId());
    Assertions.assertNull(parentTreeDto.getMaleParentTreeId());
    Assertions.assertEquals(1, parentTreeDto.getParentTreeGeneticQualities().size());

    // Parent Tree Genetic Quality
    ParentTreeGeneticQualityDto geneticDto = parentTreeDto.getParentTreeGeneticQualities().get(0);
    Assertions.assertEquals(4032L, geneticDto.getParentTreeId());
    Assertions.assertEquals("BV", geneticDto.getGeneticTypeCode());
    Assertions.assertEquals("GVO", geneticDto.getGeneticWorthCode());
    Assertions.assertEquals(new BigDecimal("18.0"), geneticDto.getGeneticQualityValue());
  }

  @Test
  @DisplayName("findNotRetOrchardsByVegCodeSuccessServiceTest")
  void findNotRetOrchardsByVegCodeSuccessServiceTest() {
    LocalDate now = LocalDate.now();
    // Add two active orchard
    OrchardLotTypeCode firstLotTypeCode = new OrchardLotTypeCode();
    firstLotTypeCode.setCode('S');
    firstLotTypeCode.setDescription("Seed Lot");
    firstLotTypeCode.setEffectiveDate(now.minusDays(3L));
    firstLotTypeCode.setExpiryDate(now.plusDays(3L));
    firstLotTypeCode.setUpdateTimestamp(now);
    String vegCode = "SX";
    Orchard firstOrchard = new Orchard();
    firstOrchard.setId("612");
    firstOrchard.setName("E.KOOTENAY BREED A");
    firstOrchard.setVegetationCode(vegCode);
    firstOrchard.setStageCode("PRD");
    firstOrchard.setOrchardLotTypeCode(firstLotTypeCode);

    // Add second active Orchard
    OrchardLotTypeCode secondLotTypeCode = new OrchardLotTypeCode();
    secondLotTypeCode.setCode('S');
    secondLotTypeCode.setDescription("Seed Lot");
    secondLotTypeCode.setEffectiveDate(now.minusDays(1L));
    secondLotTypeCode.setExpiryDate(now.plusDays(1L));
    secondLotTypeCode.setUpdateTimestamp(now);
    Orchard secondOrchard = new Orchard();
    secondOrchard.setId("613");
    secondOrchard.setName("BURNABY TOWERS");
    secondOrchard.setVegetationCode(vegCode);
    secondOrchard.setStageCode("ESB");
    secondOrchard.setOrchardLotTypeCode(secondLotTypeCode);

    // Add Expired Orchard
    OrchardLotTypeCode expiredlotTypeCode = new OrchardLotTypeCode();
    expiredlotTypeCode.setCode('S');
    expiredlotTypeCode.setDescription("Seed Lot");
    expiredlotTypeCode.setEffectiveDate(now.minusDays(3L));
    expiredlotTypeCode.setExpiryDate(now.minusDays(1L));
    expiredlotTypeCode.setUpdateTimestamp(now);
    Orchard expiredOrchard = new Orchard();
    expiredOrchard.setId("666");
    expiredOrchard.setName("EXPIRED AND STINKS");
    expiredOrchard.setVegetationCode(vegCode);
    expiredOrchard.setStageCode("ESB");
    expiredOrchard.setOrchardLotTypeCode(expiredlotTypeCode);

    List<Orchard> repoResult = List.of(firstOrchard, secondOrchard, expiredOrchard);

    when(orchardRepository.findAllByVegetationCodeAndStageCodeNot(vegCode, "RET"))
        .thenReturn(repoResult);

    List<OrchardLotTypeDescriptionDto> listToTest =
        orchardService.findNotRetOrchardsByVegCode(vegCode).get();

    Assertions.assertEquals(2, listToTest.size());
    listToTest.forEach(
        testObj -> {
          Assertions.assertNotEquals("RET", testObj.stageCode());
          Assertions.assertEquals(vegCode, testObj.vegetationCode());
          Assertions.assertEquals("Seed Lot", testObj.lotTypeDescription());
          Assertions.assertFalse(testObj.id().isEmpty());
        });
  }

  @Test
  @DisplayName("findParentTreesWithVegCodeServiceTest")
  void findParentTreesWithVegCodeServiceTest() {

    ProjectionFactory factory = new SpelAwareProxyProjectionFactory();
    ParentTreeProj firstProj = factory.createProjection(ParentTreeProj.class);

    firstProj.setParentTreeId(Long.valueOf(12345));
    firstProj.setParentTreeNumber("456");
    firstProj.setOrchardId("1");
    firstProj.setSpu(Long.valueOf(7));

    ParentTreeProj secondProj = factory.createProjection(ParentTreeProj.class);
    secondProj.setParentTreeId(Long.valueOf(45678));
    secondProj.setParentTreeNumber("678");
    secondProj.setOrchardId("1");
    secondProj.setSpu(Long.valueOf(7));

    List<ParentTreeProj> repoResult = List.of(firstProj, secondProj);

    String vegCode = "PLI";

    when(parentTreeRepository.findAllParentTreeWithVegCode(vegCode)).thenReturn(repoResult);

    Map<String, String> testMap = new HashMap<>();

    testMap.put("1", "7");

    List<SameSpeciesTreeDto> listToTest =
        orchardService.findParentTreesWithVegCode(vegCode, testMap);

    Assertions.assertEquals(repoResult.size(), listToTest.size());

    Assertions.assertEquals(
        repoResult.get(0).getParentTreeId(), listToTest.get(0).getParentTreeId());
    Assertions.assertEquals(
        repoResult.get(0).getParentTreeNumber(), listToTest.get(0).getParentTreeNumber());

    Assertions.assertEquals(
        repoResult.get(1).getParentTreeId(), listToTest.get(1).getParentTreeId());
    Assertions.assertEquals(
        repoResult.get(1).getParentTreeNumber(), listToTest.get(1).getParentTreeNumber());
  }

  @Test
  @DisplayName("getOrchardSpuSpzInformation_successTest")
  void getOrchardSpuSpzInformation_successTest() {
    Integer spuId = 7;
    List<Integer> spuIdList = List.of(spuId);
    TestedPtAreaOfUse testedPt = new TestedPtAreaOfUse();
    testedPt.setSeedPlanUnitId(7);
    testedPt.setTestedPtAreaOfUseId(40);
    when(testedPtAreaofUseRepository.findAllBySeedPlanUnitIdIn(spuIdList))
        .thenReturn(List.of(testedPt));

    TestedPtAreaOfUseSpu tested = new TestedPtAreaOfUseSpu();
    tested.setSeedPlanUnitId(spuId);
    tested.setTestedPtAreaOfUseId(40);
    when(testedPtAreaOfUseSpuRepository.findByTestedPtAreaOfUseIdAndSeedPlanUnitId(40, 7))
        .thenReturn(Optional.of(tested));

    Integer spzId = 40;
    SeedPlanUnit seedPlanUnit = new SeedPlanUnit();
    seedPlanUnit.setSeedPlanUnitId(spuId);
    seedPlanUnit.setSeedPlanZoneId(spzId);
    seedPlanUnit.setElevationMax(701);
    seedPlanUnit.setElevationMin(1);
    when(seedPlanUnitRepository.findById(spuId)).thenReturn(Optional.of(seedPlanUnit));

    SeedPlanZone seedPlanZone = new SeedPlanZone();
    seedPlanZone.setSeedPlanZoneId(1284);
    seedPlanZone.setGeneticClassCode('A');
    seedPlanZone.setSeedPlanZoneCode("M");
    seedPlanZone.setVegetationCode("FDC");
    when(seedPlanZoneRepository.findById(spzId)).thenReturn(Optional.of(seedPlanZone));

    List<SeedPlanZoneDto> dto = orchardService.getSpzInformationBySpu(List.of(7));

    Assertions.assertFalse(dto.isEmpty());
    Assertions.assertEquals(1, dto.size());
    Assertions.assertEquals(spuId, dto.get(0).getSeedPlanUnitId());
    Assertions.assertEquals(spzId, dto.get(0).getSeedPlanZoneId());
    Assertions.assertEquals('A', dto.get(0).getGeneticClassCode());
    Assertions.assertEquals("M", dto.get(0).getSeedPlanZoneCode());
    Assertions.assertEquals("FDC", dto.get(0).getVegetationCode());
    Assertions.assertEquals(1, dto.get(0).getElevationMin());
    Assertions.assertEquals(701, dto.get(0).getElevationMax());
  }

  @Test
  @DisplayName("getOrchardSpuSpzInformation_emptyTest")
  void getOrchardSpuSpzInformation_emptyTest() {

    List<Integer> spuIdList = List.of(7);
    TestedPtAreaOfUse testedPt = new TestedPtAreaOfUse();
    testedPt.setSeedPlanUnitId(7);
    testedPt.setTestedPtAreaOfUseId(40);
    when(testedPtAreaofUseRepository.findAllBySeedPlanUnitIdIn(spuIdList)).thenReturn(List.of());

    List<SeedPlanZoneDto> dto = orchardService.getSpzInformationBySpu(List.of(7));

    Assertions.assertTrue(dto.isEmpty());
  }

  @Test
  @DisplayName("getOrchardSpuSpzInformation_badRelationshipTest")
  void getOrchardSpuSpzInformation_badRelationshipTest() {
    Integer spuId = 7;
    List<Integer> spuIdList = List.of(spuId);
    TestedPtAreaOfUse testedPt = new TestedPtAreaOfUse();
    testedPt.setSeedPlanUnitId(7);
    testedPt.setTestedPtAreaOfUseId(40);
    when(testedPtAreaofUseRepository.findAllBySeedPlanUnitIdIn(spuIdList))
        .thenReturn(List.of(testedPt));

    when(testedPtAreaOfUseSpuRepository.findByTestedPtAreaOfUseIdAndSeedPlanUnitId(40, 7))
        .thenReturn(Optional.empty());

    Assertions.assertThrows(
        TestedPtAreaOfUseException.class,
        () -> {
          orchardService.getSpzInformationBySpu(List.of(7));
        });
  }
}
