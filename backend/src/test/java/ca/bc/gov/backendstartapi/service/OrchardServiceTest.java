package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSeedPlanningUnit;
import ca.bc.gov.backendstartapi.exception.NoOrchardException;
import ca.bc.gov.backendstartapi.exception.NoSpuForOrchardException;
import ca.bc.gov.backendstartapi.provider.OracleApiProvider;
import ca.bc.gov.backendstartapi.repository.ActiveOrchardSeedPlanningUnitRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
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

  private ActiveOrchardSeedPlanningUnit createOrchardSpu(String orchardId, boolean active) {
    return new ActiveOrchardSeedPlanningUnit(orchardId, 1, active, false, false);
  }

  @Test
  @DisplayName("findSpuIdByOrchardActiveServiceTest")
  void findSpuIdByOrchardActiveServiceTest() {
    String orchardId = "127";

    ActiveOrchardSeedPlanningUnit activeOrchardSpu = createOrchardSpu(orchardId, true);

    when(activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive(orchardId, true))
        .thenReturn(List.of(activeOrchardSpu));

    List<ActiveOrchardSeedPlanningUnit> list = orchardService.findSpuIdByOrchard(orchardId);

    Assertions.assertFalse(list.isEmpty());

    ActiveOrchardSeedPlanningUnit orchardSpu = list.get(0);
    Assertions.assertEquals(orchardId, orchardSpu.getOrchardId());
    Assertions.assertTrue(orchardSpu.isActive());
  }

  @Test
  @DisplayName("findSpuIdByOrchardInactiveServiceTest")
  void findSpuIdByOrchardInactiveServiceTest() {
    String orchardId = "129";

    ActiveOrchardSeedPlanningUnit activeOrchardSpu = createOrchardSpu(orchardId, false);

    when(activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive(orchardId, true))
        .thenReturn(List.of(activeOrchardSpu));

    List<ActiveOrchardSeedPlanningUnit> list = orchardService.findSpuIdByOrchard(orchardId);

    Assertions.assertFalse(list.isEmpty());

    ActiveOrchardSeedPlanningUnit orchardSpu = list.get(0);
    Assertions.assertEquals(orchardId, orchardSpu.getOrchardId());
    Assertions.assertFalse(orchardSpu.isActive());
  }

  @Test
  @DisplayName("findParentTreeGeneticQualityDataSuccessServiceTest")
  void findParentTreeGeneticQualityDataSuccessServiceTest() {
    String orchardId = "405";

    ActiveOrchardSeedPlanningUnit activeOrchardSpu = createOrchardSpu(orchardId, true);

    when(activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive(orchardId, true))
        .thenReturn(List.of(activeOrchardSpu));

    ParentTreeGeneticQualityDto geneticQualityDto =
        new ParentTreeGeneticQualityDto("BV", "GVO", new BigDecimal("18.0"));

    ParentTreeDto parentDto =
        new ParentTreeDto(
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

    List<ParentTreeDto> parentTreeDtos = orchardSpuDto.parentTrees();

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

  @Test
  @DisplayName("findOrchardByVegCodeSuccessServiceTest")
  void findOrchardByVegCodeSuccessServiceTest() {
    String vegCode = "FDI";

    OrchardDto firstOrchard = new OrchardDto("123", "smOrchard", vegCode, 'S', "Seed lot", "PRD");
    OrchardDto secondOrchard = new OrchardDto("456", "xlOrchard", vegCode, 'S', "Seed lot", "TEST");

    List<OrchardDto> testList =
        new ArrayList<>() {
          {
            add(firstOrchard);
            add(secondOrchard);
          }
        };

    when(oracleApiProvider.findOrchardsByVegCode(vegCode)).thenReturn(testList);

    List<OrchardDto> responseFromService = orchardService.findOrchardsByVegCode(vegCode);

    Assertions.assertNotNull(responseFromService);
    Assertions.assertEquals(responseFromService.size(), testList.size());
    Assertions.assertEquals(testList, responseFromService);
  }

  @Test
  @DisplayName("findOrchardByVegCodeEmptyServiceTest")
  void findOrchardByVegCodeEmptyServiceTest() {
    String vegCode = "FDI";

    when(oracleApiProvider.findOrchardsByVegCode(vegCode)).thenReturn(List.of());

    Exception exc =
        Assertions.assertThrows(
            NoOrchardException.class,
            () -> {
              orchardService.findOrchardsByVegCode(vegCode);
            });

    Assertions.assertEquals(
        "404 NOT_FOUND \"No orchard was found with the given VegCode!\"", exc.getMessage());
  }
}
