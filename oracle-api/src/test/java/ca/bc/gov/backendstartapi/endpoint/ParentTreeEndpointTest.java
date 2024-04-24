package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.service.ParentTreeService;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ParentTreeEndpoint.class)
class ParentTreeEndpointTest {

  @Autowired MockMvc mockMvc;

  @MockBean ParentTreeService parentTreeService;

  @Test
  @DisplayName("getPtGeoSpatialDataTest")
  @WithMockUser(roles = "user_read")
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
  @WithMockUser(roles = "user_read")
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
}
