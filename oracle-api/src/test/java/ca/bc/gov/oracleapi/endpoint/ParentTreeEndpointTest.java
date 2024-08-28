package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.GeospatialRequestDto;
import ca.bc.gov.oracleapi.dto.GeospatialRespondDto;
import ca.bc.gov.oracleapi.dto.ParentTreeByVegCodeDto;
import ca.bc.gov.oracleapi.service.ParentTreeService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ParentTreeEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class ParentTreeEndpointTest {

  @Autowired MockMvc mockMvc;

  @MockBean ParentTreeService parentTreeService;

  @Test
  @DisplayName("getPtGeoSpatialDataTest")
  void getPtGeoSpatialDataTest() throws Exception {
    List<GeospatialRequestDto> ptIds = new ArrayList<>();
    ptIds.add(new GeospatialRequestDto(4110L));

    GeospatialRespondDto dto =
        new GeospatialRespondDto(Long.valueOf(4110), 49, 52, 0, 124, 19, 0, 451);

    when(parentTreeService.getPtGeoSpatialData(ptIds)).thenReturn(List.of(dto));

    String postBody = "[{\"parentTreeId\":4110}]";

    mockMvc
        .perform(
            post("/api/parent-trees/geospatial-data")
                .with(csrf().asHeader())
                .content(postBody.toString())
                .contentType(MediaType.APPLICATION_JSON)
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].parentTreeId").value(dto.parentTreeId()))
        .andExpect(jsonPath("$[0].latitudeDegree").value(dto.latitudeDegree()))
        .andExpect(jsonPath("$[0].latitudeMinute").value(dto.latitudeMinute()))
        .andExpect(jsonPath("$[0].latitudeSecond").value(dto.latitudeSecond()))
        .andExpect(jsonPath("$[0].longitudeDegree").value(dto.longitudeDegree()))
        .andExpect(jsonPath("$[0].longitudeMinute").value(dto.longitudeMinute()))
        .andExpect(jsonPath("$[0].longitudeSecond").value(dto.longitudeSecond()))
        .andExpect(jsonPath("$[0].elevation").value(dto.elevation()))
        .andReturn();
  }

  @Test
  @DisplayName("getPtGeoSpatialDataEmptyTest")
  void getPtGeoSpatialDataEmptyTest() throws Exception {
    List<GeospatialRequestDto> ptIds = new ArrayList<>();
    ptIds.add(new GeospatialRequestDto(4110L));

    when(parentTreeService.getPtGeoSpatialData(ptIds)).thenReturn(List.of());

    String postBody = "[{\"parentTreeId\":4110}]";

    mockMvc
        .perform(
            post("/api/parent-trees/geospatial-data")
                .with(csrf().asHeader())
                .content(postBody.toString())
                .contentType(MediaType.APPLICATION_JSON)
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().string("[]"))
        .andReturn();
  }

  @Test
  @DisplayName("GET /vegetation-codes/{vegCode} - valid vegCode")
  void getParentTreeByVegCode_validVegCode_shouldReturnData() throws Exception {
    ParentTreeByVegCodeDto dto = new ParentTreeByVegCodeDto();
    dto.setParentTreeId(1L);
    dto.setTestedInd(true);
    dto.setOrchardIds(List.of("211"));
    dto.setGeneticQualitiesBySpu(Map.of(68L, List.of()));

    when(parentTreeService.findParentTreesWithVegCode("BV")).thenReturn(Map.of("29", dto));

    mockMvc
        .perform(
            get("/api/parent-trees/vegetation-codes/BV").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.29.parentTreeId").value(1L))
        .andExpect(jsonPath("$.29.orchardIds[0]").value("211"))
        .andExpect(jsonPath("$.29.testedInd").value(true));
  }

  @Test
  @DisplayName("GET /vegetation-codes/{vegCode} - invalid vegCode")
  void getParentTreeByVegCode_invalidVegCode_shouldReturnEmpty() throws Exception {
    when(parentTreeService.findParentTreesWithVegCode("INVALID")).thenReturn(Map.of());

    mockMvc
        .perform(
            get("/api/parent-trees/vegetation-codes/INVALID")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isEmpty());
  }

  @Test
  @DisplayName("GET /vegetation-codes/{vegCode} - empty vegCode")
  void getParentTreeByVegCode_emptyVegCode_shouldReturnError() throws Exception {
    mockMvc
        .perform(get("/api/parent-trees/vegetation-codes/").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }
}
