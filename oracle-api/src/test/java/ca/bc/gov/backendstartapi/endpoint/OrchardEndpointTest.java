package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.OrchardLotTypeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticInfoDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.service.OrchardService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(OrchardEndpoint.class)
class OrchardEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private OrchardService orchardService;

  @Test
  @DisplayName("findByIdPrdSuccessTest")
  @WithMockUser(roles = "user_read")
  void findByIdPrdSuccessTest() throws Exception {
    OrchardLotTypeDescriptionDto descriptionDto =
        new OrchardLotTypeDescriptionDto("337", "GRANDVIEW", "PLI", 'S', "Seed Lot", "PRD");

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
        .andReturn();
  }

  @Test
  @DisplayName("findByIdNotFoundTest")
  @WithMockUser(roles = "user_read")
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
  @WithMockUser(roles = "user_read")
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
  @WithMockUser(roles = "user_read")
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
  @WithMockUser(roles = "user_read")
  void findOrchardsWithVegCodeSuccessEndpointTest() throws Exception {
    String vegCode = "PLI";

    OrchardLotTypeDescriptionDto firstOrchard =
        new OrchardLotTypeDescriptionDto("123", "smOrchard", vegCode, 'S', "Seed lot", "PRD");
    OrchardLotTypeDescriptionDto secondOrchard =
        new OrchardLotTypeDescriptionDto("456", "xlOrchard", vegCode, 'S', "Seed lot", "TEST");

    List<OrchardLotTypeDescriptionDto> testList =
        new ArrayList<>() {
          {
            add(firstOrchard);
            add(secondOrchard);
          }
        };

    when(orchardService.findNotRetOrchardsByVegCode(vegCode)).thenReturn(Optional.of(testList));

    mockMvc
        .perform(
            get("/api/orchards/vegetation-code/{vegCode}", vegCode)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value("123"))
        .andExpect(jsonPath("$[0].vegetationCode").value(vegCode))
        .andExpect(jsonPath("$[0].name").value("smOrchard"))
        .andExpect(jsonPath("$[1].id").value("456"))
        .andExpect(jsonPath("$[1].vegetationCode").value(vegCode))
        .andExpect(jsonPath("$[1].name").value("xlOrchard"))
        .andReturn();
  }

  @Test
  @DisplayName("findOrchardsWithVegCodeNotFoundEndpointTest")
  @WithMockUser(roles = "user_read")
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

  @Test
  @DisplayName("getAllParentTreeByVegCodeTest")
  @WithMockUser(roles = "user_read")
  void getAllParentTreeByVegCodeTest() throws Exception {

    SameSpeciesTreeDto firstDto =
        new SameSpeciesTreeDto(Long.valueOf(123), "1000", "1", Long.valueOf(7), List.of());
    SameSpeciesTreeDto secondDto =
        new SameSpeciesTreeDto(Long.valueOf(456), "2000", "1", Long.valueOf(7), List.of());

    List<SameSpeciesTreeDto> testList = List.of(firstDto, secondDto);

    String vegCode = "PLI";
    Map<String, String> testMap = new HashMap<>();

    when(orchardService.findParentTreesWithVegCode(vegCode, testMap)).thenReturn(testList);

    mockMvc
        .perform(
            post("/api/orchards/parent-trees/vegetation-codes/{vegCode}", vegCode)
                .with(csrf().asHeader())
                .content(testMap.toString())
                .contentType(MediaType.APPLICATION_JSON)
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].parentTreeId").value(firstDto.getParentTreeId()))
        .andExpect(jsonPath("$[0].parentTreeNumber").value(firstDto.getParentTreeNumber()))
        .andExpect(jsonPath("$[1].parentTreeId").value(secondDto.getParentTreeId()))
        .andExpect(jsonPath("$[1].parentTreeNumber").value(secondDto.getParentTreeNumber()))
        .andReturn();
  }

  @Test
  @DisplayName("getAllParentTreeByVegCodeErrorTest")
  @WithMockUser(roles = "user_read")
  void getAllParentTreeByVegCodeErrorTest() throws Exception {
    String vegCode = "FDI";

    Map<String, String> testMap = new HashMap<>();
    when(orchardService.findParentTreesWithVegCode(vegCode, testMap))
        .thenThrow(new DataRetrievalFailureException(""));

    mockMvc
        .perform(
            post("/api/orchards/parent-trees/vegetation-codes/{vegCode}", vegCode)
                .with(csrf().asHeader())
                .content(testMap.toString())
                .contentType(MediaType.APPLICATION_JSON)
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andReturn();
  }
}
