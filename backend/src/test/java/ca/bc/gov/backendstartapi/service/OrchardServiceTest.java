package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticInfoDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity;
import ca.bc.gov.backendstartapi.exception.NoSpuForOrchardException;
import ca.bc.gov.backendstartapi.provider.OracleApiProvider;
import ca.bc.gov.backendstartapi.repository.ActiveOrchardSeedPlanningUnitRepository;
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
class OrchardServiceTest {

  @Mock ActiveOrchardSeedPlanningUnitRepository activeOrchardSeedPlanningUnitRepository;

  @Mock OracleApiProvider oracleApiProvider;

  private OrchardService orchardService;

  @BeforeEach
  void setup() {
    orchardService = new OrchardService(activeOrchardSeedPlanningUnitRepository, oracleApiProvider);
  }

  private ActiveOrchardSpuEntity createOrchardSpu(String orchardId, boolean active) {
    return new ActiveOrchardSpuEntity(orchardId, 1, active, false, false);
  }

  @Test
  @DisplayName("findSpuIdByOrchardActiveServiceTest")
  void findSpuIdByOrchardActiveServiceTest() {
    String orchardId = "127";

    ActiveOrchardSpuEntity activeOrchardSpu = createOrchardSpu(orchardId, true);

    when(activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive(orchardId, true))
        .thenReturn(List.of(activeOrchardSpu));

    Optional<ActiveOrchardSpuEntity> list = orchardService.findSpuIdByOrchard(orchardId);

    Assertions.assertFalse(list.isEmpty());

    ActiveOrchardSpuEntity orchardSpu = list.get();
    Assertions.assertEquals(orchardId, orchardSpu.getOrchardId());
    Assertions.assertTrue(orchardSpu.isActive());
  }

  @Test
  @DisplayName("findSpuIdByOrchardInactiveServiceTest")
  void findSpuIdByOrchardInactiveServiceTest() {
    String orchardId = "129";

    ActiveOrchardSpuEntity activeOrchardSpu = createOrchardSpu(orchardId, false);

    when(activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive(orchardId, true))
        .thenReturn(List.of(activeOrchardSpu));

    Optional<ActiveOrchardSpuEntity> list = orchardService.findSpuIdByOrchard(orchardId);

    Assertions.assertFalse(list.isEmpty());

    ActiveOrchardSpuEntity orchardSpu = list.get();
    Assertions.assertEquals(orchardId, orchardSpu.getOrchardId());
    Assertions.assertFalse(orchardSpu.isActive());
  }

  @Test
  @DisplayName("findParentTreeGeneticQualityDataSuccessServiceTest")
  void findParentTreeGeneticQualityDataSuccessServiceTest() {
    String orchardId = "405";

    ActiveOrchardSpuEntity activeOrchardSpu = createOrchardSpu(orchardId, true);

    when(activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive(orchardId, true))
        .thenReturn(List.of(activeOrchardSpu));

    ParentTreeGeneticQualityDto geneticQualityDto =
        new ParentTreeGeneticQualityDto("BV", "GVO", new BigDecimal("18.0"), null, null);

    ParentTreeGeneticInfoDto parentDto =
        new ParentTreeGeneticInfoDto(
            123L, "37", "App", "123456", true, true, false, null, null, List.of(geneticQualityDto));

    OrchardSpuDto parentTreeDto = new OrchardSpuDto(orchardId, "FDC", 1L, List.of(parentDto));

    int spuId = 1;

    when(oracleApiProvider.findOrchardParentTreeGeneticQualityData(orchardId, spuId))
        .thenReturn(Optional.of(parentTreeDto));

    OrchardSpuDto orchardSpuDto = orchardService.findParentTreeGeneticQualityData(orchardId);

    Assertions.assertNotNull(orchardSpuDto);
    Assertions.assertEquals("405", orchardSpuDto.orchardId());
    Assertions.assertEquals("FDC", orchardSpuDto.vegetationCode());
    Assertions.assertEquals(1L, orchardSpuDto.seedPlanningUnitId());

    List<ParentTreeGeneticInfoDto> parentTreeDtos = orchardSpuDto.parentTrees();

    Assertions.assertFalse(parentTreeDtos.isEmpty());
    Assertions.assertEquals(123L, parentTreeDtos.get(0).parentTreeId());
    Assertions.assertEquals("37", parentTreeDtos.get(0).parentTreeNumber());
    Assertions.assertEquals("App", parentTreeDtos.get(0).parentTreeRegStatusCode());
    Assertions.assertEquals("123456", parentTreeDtos.get(0).localNumber());
    Assertions.assertTrue(parentTreeDtos.get(0).active());
    Assertions.assertTrue(parentTreeDtos.get(0).tested());
    Assertions.assertFalse(parentTreeDtos.get(0).breedingProgram());
    Assertions.assertNull(parentTreeDtos.get(0).femaleParentTreeId());
    Assertions.assertNull(parentTreeDtos.get(0).maleParentTreeId());

    List<ParentTreeGeneticQualityDto> parentDtos =
        parentTreeDtos.get(0).parentTreeGeneticQualities();

    Assertions.assertFalse(parentDtos.isEmpty());
    Assertions.assertEquals("BV", parentDtos.get(0).geneticTypeCode());
    Assertions.assertEquals("GVO", parentDtos.get(0).geneticWorthCode());
    Assertions.assertEquals(new BigDecimal("18.0"), parentDtos.get(0).geneticQualityValue());
  }

  @Test
  @DisplayName("findParentTreeGeneticQualityDataEmptyServiceTest")
  void findParentTreeGeneticQualityDataEmptyServiceTest() {
    String orchardId = "405";

    when(activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive(orchardId, true))
        .thenReturn(List.of());

    Exception exc =
        Assertions.assertThrows(
            NoSpuForOrchardException.class,
            () -> {
              orchardService.findParentTreeGeneticQualityData(orchardId);
            });

    Assertions.assertEquals(
        "404 NOT_FOUND \"No active SPU for the given Orchard ID!\"", exc.getMessage());
  }

  // TODO
  // @Test
  // @DisplayName("findParentTreesByVegCodeTest")
  // void findParentTreesByVegCodeTest() {
  //   String vegCode = "FDI";

  //   SameSpeciesTreeDto firstDto =
  //       new SameSpeciesTreeDto(Long.valueOf(123), "1000", "1", Long.valueOf(7), List.of());
  //   SameSpeciesTreeDto secondDto =
  //       new SameSpeciesTreeDto(Long.valueOf(456), "2000", "1", Long.valueOf(7), List.of());

  //   List<SameSpeciesTreeDto> testList = List.of(firstDto, secondDto);

  //   Map<String, String> testMap = new HashMap<>();
  //   testMap.put("1", "1");
  //   when(oracleApiProvider.findParentTreesByVegCode(vegCode, testMap)).thenReturn(testList);

  //   ActiveOrchardSpuEntity activeOrchardSpu = createOrchardSpu("1", true);
  //   when(orchardService.findAllSpu(true)).thenReturn(List.of(activeOrchardSpu));

  //   List<SameSpeciesTreeDto> responseFromService =
  // orchardService.findParentTreesByVegCode(vegCode);

  //   Assertions.assertNotNull(responseFromService);
  //   Assertions.assertEquals(testList.size(), responseFromService.size());
  //   Assertions.assertEquals(testList, responseFromService);
  // }

  @Test
  @DisplayName("Find all spu happy path should succeed")
  void findAllSpu_happyPath_shouldSucceed() {
    ActiveOrchardSpuEntity activeOrchardSpuEntity = mock(ActiveOrchardSpuEntity.class);

    when(activeOrchardSeedPlanningUnitRepository.findAllByActive(true))
        .thenReturn(List.of(activeOrchardSpuEntity));

    List<ActiveOrchardSpuEntity> list = orchardService.findAllSpu(true);

    Assertions.assertNotNull(list);
    Assertions.assertFalse(list.isEmpty());
    Assertions.assertEquals(1, list.size());
  }
}
