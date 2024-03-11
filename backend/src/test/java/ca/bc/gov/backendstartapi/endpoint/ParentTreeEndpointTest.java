package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.LatLongRequestDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeLocInfoDto;
import ca.bc.gov.backendstartapi.service.ParentTreeService;
import java.math.BigDecimal;
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
  @DisplayName("getLatLongElevationSuccessTest")
  @WithMockUser(roles = "user_read")
  void getLatLongElevationSuccessTest() throws Exception {
    List<LatLongRequestDto> ptIds = new ArrayList<>();
    ptIds.add(new LatLongRequestDto(4032, new BigDecimal("0.162")));

    ParentTreeLocInfoDto responseDto = new ParentTreeLocInfoDto();
    responseDto.setParentTreeId(4032);
    responseDto.setLatitudeDegrees(49);
    responseDto.setLatitudeMinutes(2);
    responseDto.setLatitudeSeconds(0);
    responseDto.setLatitudeDegreesFmt(new BigDecimal("49.0333333333"));
    responseDto.setLongitudeDegrees(-124);
    responseDto.setLongitudeMinutes(3);
    responseDto.setLongitudeSeconds(0);
    responseDto.setLongitudeDegreeFmt(new BigDecimal("-123.95"));
    responseDto.setElevation(579);
    responseDto.setWeightedLatitude(new BigDecimal("1629.326810274"));
    responseDto.setWeightedLongitude(new BigDecimal("-4118.729941539"));
    responseDto.setWeightedElevation(new BigDecimal("320.659491213"));

    when(parentTreeService.getLatLongElevation(ptIds)).thenReturn(List.of(responseDto));

    StringBuilder postBody = new StringBuilder();
    postBody.append("[{\"parentTreeId\":4032,\"proportion\":0.162}]");

    mockMvc
        .perform(
            post("/api/parent-trees/location-info")
                .with(csrf().asHeader())
                .content(postBody.toString())
                .contentType(MediaType.APPLICATION_JSON)
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].parentTreeId").value("4032"))
        .andExpect(jsonPath("$[0].latitudeDegrees").value("49"))
        .andExpect(jsonPath("$[0].latitudeMinutes").value("2"))
        .andExpect(jsonPath("$[0].latitudeSeconds").value("0"))
        .andExpect(jsonPath("$[0].latitudeDegreesFmt").value("49.0333333333"))
        .andExpect(jsonPath("$[0].longitudeDegrees").value("-124"))
        .andExpect(jsonPath("$[0].longitudeMinutes").value("3"))
        .andExpect(jsonPath("$[0].longitudeSeconds").value("0"))
        .andExpect(jsonPath("$[0].longitudeDegreeFmt").value("-123.95"))
        .andExpect(jsonPath("$[0].elevation").value("579"))
        .andExpect(jsonPath("$[0].weightedLatitude").value("1629.326810274"))
        .andExpect(jsonPath("$[0].weightedLongitude").value("-4118.729941539"))
        .andExpect(jsonPath("$[0].weightedElevation").value("320.659491213"))
        .andReturn();
  }

  @Test
  @DisplayName("getLatLongElevationEmptyTest")
  @WithMockUser(roles = "user_read")
  void getLatLongElevationEmptyTest() throws Exception {
    List<LatLongRequestDto> ptIds = new ArrayList<>();
    ptIds.add(new LatLongRequestDto(4032, new BigDecimal("0.162")));

    when(parentTreeService.getLatLongElevation(ptIds)).thenReturn(List.of());

    StringBuilder postBody = new StringBuilder();
    postBody.append("[{\"parentTreeId\":4032,\"proportion\":0.162}]");

    mockMvc
        .perform(
            post("/api/parent-trees/location-info")
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
