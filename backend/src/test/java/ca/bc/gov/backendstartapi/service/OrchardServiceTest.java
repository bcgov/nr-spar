package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSeedPlanningUnit;
import ca.bc.gov.backendstartapi.provider.OracleApiProvider;
import ca.bc.gov.backendstartapi.repository.ActiveOrchardSeedPlanningUnitRepository;
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
  @DisplayName("findSpuIdByOrchardActiveTest")
  void findSpuIdByOrchardActiveTest() {
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
  @DisplayName("findSpuIdByOrchardInactiveTest")
  void findSpuIdByOrchardInactiveTest() {
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
  @DisplayName("findParentTreeGeneticQualityDataSuccessTest")
  void findParentTreeGeneticQualityDataSuccessTest() {
    String orchardId = "405";

    ActiveOrchardSeedPlanningUnit activeOrchardSpu = createOrchardSpu(orchardId, true);

    when(activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive(orchardId, true))
        .thenReturn(List.of(activeOrchardSpu));

    OrchardParentTreeDto parentTreeDto =
        new OrchardParentTreeDto(orchardId, "FDC", 1L, new ArrayList<>());

    int spuId = 1;

    when(oracleApiProvider.findOrchardParentTreeGeneticQualityData(orchardId, spuId))
        .thenReturn(Optional.of(parentTreeDto));

    Optional<OrchardParentTreeDto> orchardDto =
        orchardService.findParentTreeGeneticQualityData(orchardId);

    Assertions.assertTrue(orchardDto.isPresent());
    Assertions.assertEquals("405", orchardDto.get().orchardId());
    Assertions.assertEquals("FDC", orchardDto.get().vegetationCode());
    Assertions.assertEquals(1L, orchardDto.get().seedPlanningUnitId());
  }

  @Test
  @DisplayName("findParentTreeGeneticQualityDataEmptyTest")
  void findParentTreeGeneticQualityDataEmptyTest() {
    String orchardId = "405";

    when(activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive(orchardId, true))
        .thenReturn(List.of());

    Optional<OrchardParentTreeDto> orchardDto =
        orchardService.findParentTreeGeneticQualityData(orchardId);

    Assertions.assertFalse(orchardDto.isPresent());
  }
}
