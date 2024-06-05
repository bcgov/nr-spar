package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.exception.NoParentTreeDataException;
import ca.bc.gov.backendstartapi.exception.NoSpuForOrchardException;
import ca.bc.gov.backendstartapi.service.OrchardService;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(OrchardEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class OrchardEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private OrchardService orchardService;

  @Test
  @DisplayName("getParentTreeGeneticQualityDataSuccessTest")
  void getParentTreeGeneticQualityDataSuccessTest() throws Exception {
    String orchardId = "123";

    OrchardSpuDto parentTreeDto = new OrchardSpuDto(orchardId, "ACT", 1L, List.of());

    when(orchardService.findParentTreeGeneticQualityData(orchardId)).thenReturn(parentTreeDto);

    mockMvc
        .perform(
            get("/api/orchards/{orchardId}/parent-tree-genetic-quality", orchardId)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.orchardId").value(orchardId))
        .andExpect(jsonPath("$.vegetationCode").value("ACT"))
        .andExpect(jsonPath("$.seedPlanningUnitId").value("1"))
        .andReturn();
  }

  @Test
  @DisplayName("getParentTreeGeneticQualityDataNotFoundTest")
  void getParentTreeGeneticQualityDataNotFoundTest() throws Exception {
    String orchardId = "222";

    when(orchardService.findParentTreeGeneticQualityData(orchardId))
        .thenThrow(new NoParentTreeDataException());

    mockMvc
        .perform(
            get("/api/orchards/{orchardId}/parent-tree-genetic-quality", orchardId)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(status().reason("No Parent Tree data for the given Orchard!"))
        .andReturn();
  }

  @Test
  @DisplayName("getParentTreeGeneticQualityDataNoSpuTest")
  void getParentTreeGeneticQualityDataNoSpuTest() throws Exception {
    String orchardId = "222";

    when(orchardService.findParentTreeGeneticQualityData(orchardId))
        .thenThrow(new NoSpuForOrchardException());

    mockMvc
        .perform(
            get("/api/orchards/{orchardId}/parent-tree-genetic-quality", orchardId)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(status().reason("No active SPU for the given Orchard ID!"))
        .andReturn();
  }

  @Test
  @DisplayName("findOrchardsWithVegCodeSuccessTest")
  void findOrchardsWithVegCodeTest() throws Exception {
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

    when(orchardService.findOrchardsByVegCode(vegCode)).thenReturn(testList);

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
  @DisplayName("findOrchardsWithVegCodeNotFoundTest")
  void findOrchardsWithVegCodeNotFoundTest() throws Exception {
    String vegCode = "BEEF";

    when(orchardService.findOrchardsByVegCode(vegCode)).thenReturn(List.of());
    mockMvc
        .perform(
            get("/api/orchards/vegetation-code/{vegCode}", vegCode)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0))
        .andReturn();
  }

  @Test
  @DisplayName("getAllParentTreeByVegCodeTest")
  void getAllParentTreeByVegCodeTest() throws Exception {
    String vegCode = "PLI";

    SameSpeciesTreeDto firstDto =
        new SameSpeciesTreeDto(Long.valueOf(123), "1000", "1", Long.valueOf(7), List.of());
    SameSpeciesTreeDto secondDto =
        new SameSpeciesTreeDto(Long.valueOf(456), "2000", "1", Long.valueOf(7), List.of());

    List<SameSpeciesTreeDto> testList = List.of(firstDto, secondDto);

    when(orchardService.findParentTreesByVegCode(vegCode)).thenReturn(testList);

    mockMvc
        .perform(
            get("/api/orchards/parent-trees/vegetation-codes/{vegCode}", vegCode)
                .with(csrf().asHeader())
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
  void getAllParentTreeByVegCodeErrorTest() throws Exception {
    String vegCode = "LAMB";

    HttpStatus errCode = HttpStatus.BAD_REQUEST;
    String errMsg = "LAMB is not a veg code.";

    when(orchardService.findParentTreesByVegCode(vegCode))
        .thenThrow(new ResponseStatusException(errCode, errMsg));
    mockMvc
        .perform(
            get("/api/orchards/parent-trees/vegetation-codes/{vegCode}", vegCode)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest())
        .andExpect(status().reason(errMsg))
        .andReturn();
  }
}
