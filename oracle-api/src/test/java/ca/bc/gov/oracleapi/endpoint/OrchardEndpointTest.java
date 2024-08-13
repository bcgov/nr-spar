package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.OrchardDto;
import ca.bc.gov.oracleapi.dto.OrchardParentTreeDto;
import ca.bc.gov.oracleapi.dto.ParentTreeGeneticInfoDto;
import ca.bc.gov.oracleapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.oracleapi.service.OrchardService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(OrchardEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class OrchardEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private OrchardService orchardService;

  @Test
  @DisplayName("findByIdPrdSuccessTest")
  void findByIdPrdSuccessTest() throws Exception {
    OrchardDto descriptionDto =
        new OrchardDto(
            "337",
            "GRANDVIEW",
            "PLI",
            'S',
            "Seed Lot",
            "PRD",
            "ICH",
            "Interior Cedar -- Hemlock",
            "dw",
            '4',
            5);

    when(orchardService.findNotRetiredOrchardValidLotType(any()))
        .thenReturn(Optional.of(descriptionDto));

    mockMvc
        .perform(
            get("/api/orchards/{id}", "337")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value("337"))
        .andExpect(jsonPath("$.name").value("GRANDVIEW"))
        .andExpect(jsonPath("$.vegetationCode").value("PLI"))
        .andExpect(jsonPath("$.lotTypeCode").value("S"))
        .andExpect(jsonPath("$.lotTypeDescription").value("Seed Lot"))
        .andExpect(jsonPath("$.stageCode").value("PRD"))
        .andExpect(jsonPath("$.becZoneCode").value("ICH"))
        .andExpect(jsonPath("$.becZoneDescription").value("Interior Cedar -- Hemlock"))
        .andExpect(jsonPath("$.becSubzoneCode").value("dw"))
        .andExpect(jsonPath("$.variant").value("4"))
        .andExpect(jsonPath("$.becVersionId").value(5))
        .andReturn();
  }

  @Test
  @DisplayName("findByIdNotFoundTest")
  void findByIdNotFoundTest() throws Exception {
    when(orchardService.findNotRetiredOrchardValidLotType(any())).thenReturn(Optional.empty());

    mockMvc
        .perform(
            get("/api/orchards/{id}", "612")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("findParentTreeGeneticQualitySuccessTest")
  void findParentTreeGeneticQualitySuccessTest() throws Exception {
    OrchardParentTreeDto orchardParentTreeDto = new OrchardParentTreeDto();
    orchardParentTreeDto.setOrchardId("405");
    orchardParentTreeDto.setVegetationCode("FDC");
    orchardParentTreeDto.setSeedPlanningUnitId(7L);

    ParentTreeGeneticInfoDto parentTreeDto1 = new ParentTreeGeneticInfoDto();
    parentTreeDto1.setParentTreeId(4001L);
    parentTreeDto1.setParentTreeNumber("37");
    parentTreeDto1.setParentTreeRegStatusCode("APP");
    parentTreeDto1.setLocalNumber("123");
    parentTreeDto1.setActive(true);
    parentTreeDto1.setTested(true);
    parentTreeDto1.setBreedingProgram(true);

    ParentTreeGeneticQualityDto geneticQualityDto1 = new ParentTreeGeneticQualityDto();
    geneticQualityDto1.setParentTreeId(parentTreeDto1.getParentTreeId());
    geneticQualityDto1.setGeneticTypeCode("BV");
    geneticQualityDto1.setGeneticWorthCode("GVO");
    geneticQualityDto1.setGeneticQualityValue(new BigDecimal("18"));

    List<ParentTreeGeneticQualityDto> parentTreeDto1GenQual =
        new ArrayList<>(parentTreeDto1.getParentTreeGeneticQualities());
    parentTreeDto1GenQual.add(geneticQualityDto1);
    parentTreeDto1.setParentTreeGeneticQualities(parentTreeDto1GenQual);

    orchardParentTreeDto.getParentTrees().add(parentTreeDto1);

    when(orchardService.findParentTreeGeneticQualityData(any(), any()))
        .thenReturn(Optional.of(orchardParentTreeDto));

    String path = "/api/orchards/parent-tree-genetic-quality/{orchardId}/{spuId}";

    mockMvc
        .perform(
            get(
                    path,
                    orchardParentTreeDto.getOrchardId(),
                    orchardParentTreeDto.getSeedPlanningUnitId())
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.orchardId").value("405"))
        .andExpect(jsonPath("$.vegetationCode").value("FDC"))
        .andExpect(jsonPath("$.seedPlanningUnitId").value("7"))
        .andExpect(jsonPath("$.parentTrees[0].parentTreeId").value("4001"))
        .andExpect(jsonPath("$.parentTrees[0].parentTreeNumber").value("37"))
        .andExpect(jsonPath("$.parentTrees[0].parentTreeRegStatusCode").value("APP"))
        .andExpect(jsonPath("$.parentTrees[0].localNumber").value("123"))
        .andExpect(jsonPath("$.parentTrees[0].active").value("true"))
        .andExpect(jsonPath("$.parentTrees[0].tested").value("true"))
        .andExpect(jsonPath("$.parentTrees[0].breedingProgram").value("true"))
        .andExpect(
            jsonPath("$.parentTrees[0].parentTreeGeneticQualities[0].geneticTypeCode").value("BV"))
        .andExpect(
            jsonPath("$.parentTrees[0].parentTreeGeneticQualities[0].geneticWorthCode")
                .value("GVO"))
        .andExpect(
            jsonPath("$.parentTrees[0].parentTreeGeneticQualities[0].geneticQualityValue")
                .value("18"))
        .andReturn();
  }

  @Test
  @DisplayName("findParentTreeGeneticQualityNotFoundTest")
  void findParentTreeGeneticQualityNotFoundTest() throws Exception {
    when(orchardService.findParentTreeGeneticQualityData(any(), any()))
        .thenReturn(Optional.empty());

    String path = "/api/orchards/parent-tree-genetic-quality/{orchardId}/{spuId}";

    mockMvc
        .perform(
            get(path, "123", "8")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("findOrchardsWithVegCodeSuccessEndpointTest")
  void findOrchardsWithVegCodeSuccessEndpointTest() throws Exception {
    String vegCode = "PLI";

    OrchardDto firstOrchard =
        new OrchardDto(
            "123",
            "smOrchard",
            vegCode,
            'S',
            "Seed lot",
            "PRD",
            "ICH",
            "Interior Cedar -- Hemlock",
            "dw",
            '4',
            5);
    OrchardDto secondOrchard =
        new OrchardDto(
            "456",
            "xlOrchard",
            vegCode,
            'S',
            "Seed lot",
            "TEST",
            "IDF",
            "Interior Douglas-fir",
            "mk",
            '1',
            5);

    List<OrchardDto> testList =
        new ArrayList<>() {
          {
            add(firstOrchard);
            add(secondOrchard);
          }
        };

    when(orchardService.findNotRetOrchardsByVegCode(vegCode)).thenReturn(Optional.of(testList));

    mockMvc
        .perform(
            get("/api/orchards/vegetation-codes/{vegCode}", vegCode)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value("123"))
        .andExpect(jsonPath("$[0].vegetationCode").value(vegCode))
        .andExpect(jsonPath("$[0].name").value("smOrchard"))
        .andExpect(jsonPath("$[0].becZoneCode").value("ICH"))
        .andExpect(jsonPath("$[0].becZoneDescription").value("Interior Cedar -- Hemlock"))
        .andExpect(jsonPath("$[0].becSubzoneCode").value("dw"))
        .andExpect(jsonPath("$[0].variant").value("4"))
        .andExpect(jsonPath("$[0].becVersionId").value(5))
        .andExpect(jsonPath("$[1].id").value("456"))
        .andExpect(jsonPath("$[1].vegetationCode").value(vegCode))
        .andExpect(jsonPath("$[1].name").value("xlOrchard"))
        .andExpect(jsonPath("$[1].becZoneCode").value("IDF"))
        .andExpect(jsonPath("$[1].becZoneDescription").value("Interior Douglas-fir"))
        .andExpect(jsonPath("$[1].becSubzoneCode").value("mk"))
        .andExpect(jsonPath("$[1].variant").value("1"))
        .andExpect(jsonPath("$[1].becVersionId").value(5))
        .andReturn();
  }

  @Test
  @DisplayName("findOrchardsWithVegCodeNotFoundEndpointTest")
  void findOrchardsWithVegCodeNotFoundEndpointTest() throws Exception {
    String vegCode = "BEEF";

    when(orchardService.findNotRetOrchardsByVegCode(vegCode)).thenReturn(Optional.empty());

    mockMvc
        .perform(
            get("/api/orchards/vegetation-code/{vegCode}", vegCode)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  // TODO
  //   @Test
  //   @DisplayName("getAllParentTreeByVegCodeTest")
  //   void getAllParentTreeByVegCodeTest() throws Exception {

  //     SameSpeciesTreeDto firstDto =
  //         new SameSpeciesTreeDto(Long.valueOf(123), "1000", "1", Long.valueOf(7), List.of());
  //     SameSpeciesTreeDto secondDto =
  //         new SameSpeciesTreeDto(Long.valueOf(456), "2000", "1", Long.valueOf(7), List.of());

  //     List<SameSpeciesTreeDto> testList = List.of(firstDto, secondDto);

  //     String vegCode = "PLI";
  //     Map<String, String> testMap = new HashMap<>();

  //     when(orchardService.findParentTreesWithVegCode(vegCode, testMap)).thenReturn(testList);

  //     mockMvc
  //         .perform(
  //             post("/api/orchards/parent-trees/vegetation-codes/{vegCode}", vegCode)
  //                 .with(csrf().asHeader())
  //                 .content(testMap.toString())
  //                 .contentType(MediaType.APPLICATION_JSON)
  //                 .header("Content-Type", "application/json")
  //                 .accept(MediaType.APPLICATION_JSON))
  //         .andExpect(status().isOk())
  //         .andExpect(jsonPath("$[0].parentTreeId").value(firstDto.getParentTreeId()))
  //         .andExpect(jsonPath("$[0].parentTreeNumber").value(firstDto.getParentTreeNumber()))
  //         .andExpect(jsonPath("$[1].parentTreeId").value(secondDto.getParentTreeId()))
  //         .andExpect(jsonPath("$[1].parentTreeNumber").value(secondDto.getParentTreeNumber()))
  //         .andReturn();
  //   }

  // TODO
  //   @Test
  //   @DisplayName("getAllParentTreeByVegCodeErrorTest")
  //   void getAllParentTreeByVegCodeErrorTest() throws Exception {
  //     String vegCode = "FDI";

  //     Map<String, String> testMap = new HashMap<>();
  //     when(orchardService.findParentTreesWithVegCode(vegCode, testMap))
  //         .thenThrow(new DataRetrievalFailureException(""));

  //     mockMvc
  //         .perform(
  //             post("/api/orchards/parent-trees/vegetation-codes/{vegCode}", vegCode)
  //                 .with(csrf().asHeader())
  //                 .content(testMap.toString())
  //                 .contentType(MediaType.APPLICATION_JSON)
  //                 .header("Content-Type", "application/json")
  //                 .accept(MediaType.APPLICATION_JSON))
  //         .andExpect(status().isInternalServerError())
  //         .andReturn();
  //   }
}
