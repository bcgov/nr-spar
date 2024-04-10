package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

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

    GeospatialRespondDto dto = new GeospatialRespondDto();
    dto.setParentTreeId(4110L);
    dto.setLatitudeDegrees(49);
    dto.setLatitudeMinutes(52);
    dto.setLatitudeSeconds(0);
    dto.setLongitudeDegrees(124);
    dto.setLongitudeMinutes(19);
    dto.setLongitudeSeconds(0);
    dto.setElevation(451);

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
        .andExpect(jsonPath("$[0].parentTreeId").value(dto.getParentTreeId()))
        .andExpect(jsonPath("$[0].latitudeDegrees").value(dto.getLatitudeDegrees()))
        .andExpect(jsonPath("$[0].latitudeMinutes").value(dto.getLatitudeMinutes()))
        .andExpect(jsonPath("$[0].latitudeSeconds").value(dto.getLatitudeSeconds()))
        .andExpect(jsonPath("$[0].longitudeDegrees").value(dto.getLongitudeDegrees()))
        .andExpect(jsonPath("$[0].longitudeMinutes").value(dto.getLongitudeMinutes()))
        .andExpect(jsonPath("$[0].longitudeSeconds").value(dto.getLongitudeSeconds()))
        .andExpect(jsonPath("$[0].elevation").value(dto.getElevation()))
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
        .andExpect(content().string("[]") )
        .andReturn();
  }
}
