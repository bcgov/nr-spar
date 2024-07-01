package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.AreaOfUseDto;
import ca.bc.gov.oracleapi.dto.AreaOfUseSpuGeoDto;
import ca.bc.gov.oracleapi.dto.SpzDto;
import ca.bc.gov.oracleapi.exception.SpuNotFoundException;
import ca.bc.gov.oracleapi.service.AreaOfUseService;
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

@WebMvcTest(AreaOfUseEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class AreaOfUseEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private AreaOfUseService areaOfUseService;

  @Test
  @DisplayName("Get a list of SPZ should succeed")
  void getListOfSpz_shouldSucceed() throws Exception {
    SpzDto spzBv = new SpzDto("BV", "Bulkley Valley", null);
    SpzDto spzCp = new SpzDto("CP", "Central Plateau", null);
    List<SpzDto> spzList = List.of(spzBv, spzCp);

    String vegCode = "FDC";
    when(areaOfUseService.getSpzByVegCode(vegCode)).thenReturn(spzList);

    mockMvc
        .perform(
            get("/api/area-of-use/spz-list/vegetation-code/{vegCode}", vegCode)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].code").value(spzList.get(0).getCode()))
        .andExpect(jsonPath("$[0].description").value(spzList.get(0).getDescription()))
        .andExpect(jsonPath("$[0].isPrimary").value(spzList.get(0).getIsPrimary()))
        .andExpect(jsonPath("$[1].code").value(spzList.get(1).getCode()))
        .andExpect(jsonPath("$[1].description").value(spzList.get(1).getDescription()))
        .andExpect(jsonPath("$[1].isPrimary").value(spzList.get(1).getIsPrimary()))
        .andReturn();
  }

  @Test
  @DisplayName("Get a list of SPZ endpoint should be able to handle erros.")
  void getSpzListShouldHandleError() throws Exception {
    String vegCode = "FDC";

    when(areaOfUseService.getSpzByVegCode(vegCode))
        .thenThrow(new ResponseStatusException(HttpStatus.I_AM_A_TEAPOT));

    mockMvc
        .perform(
            get("/api/area-of-use/spz-list/vegetation-code/{vegCode}", vegCode)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isIAmATeapot())
        .andReturn();
  }

  @Test
  @DisplayName("getAreaOfUseDataBySpu_sucessTest")
  void getAreaOfUseDataBySpu_sucessTest() throws Exception {
    AreaOfUseDto responseDto = new AreaOfUseDto();
    AreaOfUseSpuGeoDto aouSpuGeoDto = new AreaOfUseSpuGeoDto(11, 1200, 12, 130, 2, 45);
    responseDto.setAreaOfUseSpuGeoDto(aouSpuGeoDto);

    SpzDto spzDto1 = new SpzDto("GL", "Georgia Lowlands", false);
    SpzDto spzDto2 = new SpzDto("M", "Maritime", true);

    responseDto.setSpzList(List.of(spzDto1, spzDto2));

    Integer spu = 1;
    when(areaOfUseService.calcAreaOfUseData(spu)).thenReturn(responseDto);

    mockMvc
        .perform(
            get("/api/area-of-use/spu/{spuId}", spu)
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.areaOfUseSpuGeoDto.elevationMin")
                .value(responseDto.getAreaOfUseSpuGeoDto().getElevationMin()))
        .andExpect(
            jsonPath("$.areaOfUseSpuGeoDto.elevationMax")
                .value(responseDto.getAreaOfUseSpuGeoDto().getElevationMax()))
        .andExpect(
            jsonPath("$.areaOfUseSpuGeoDto.latitudeDegreesMin")
                .value(responseDto.getAreaOfUseSpuGeoDto().getLatitudeDegreesMin()))
        .andExpect(
            jsonPath("$.areaOfUseSpuGeoDto.latitudeDegreesMax")
                .value(responseDto.getAreaOfUseSpuGeoDto().getLatitudeDegreesMax()))
        .andExpect(
            jsonPath("$.areaOfUseSpuGeoDto.latitudeMinutesMin")
                .value(responseDto.getAreaOfUseSpuGeoDto().getLatitudeMinutesMin()))
        .andExpect(
            jsonPath("$.areaOfUseSpuGeoDto.latitudeMinutesMax")
                .value(responseDto.getAreaOfUseSpuGeoDto().getLatitudeMinutesMax()))
        // SPZ list test
        .andExpect(jsonPath("$.spzList[0].code").value(responseDto.getSpzList().get(0).getCode()))
        .andExpect(
            jsonPath("$.spzList[0].description")
                .value(responseDto.getSpzList().get(0).getDescription()))
        .andExpect(
            jsonPath("$.spzList[0].isPrimary")
                .value(responseDto.getSpzList().get(0).getIsPrimary()))
        .andExpect(jsonPath("$.spzList[1].code").value(responseDto.getSpzList().get(1).getCode()))
        .andExpect(
            jsonPath("$.spzList[1].description")
                .value(responseDto.getSpzList().get(1).getDescription()))
        .andExpect(
            jsonPath("$.spzList[1].isPrimary")
                .value(responseDto.getSpzList().get(1).getIsPrimary()))
        .andReturn();
  }

  @Test
  @DisplayName("getAreaOfUseDataBySpu_errorTest")
  void getAreaOfUseDataBySpu_errorTest() throws Exception {
    when(areaOfUseService.calcAreaOfUseData(any())).thenThrow(new SpuNotFoundException());

    mockMvc
        .perform(
            get("/api/area-of-use/spu/{spuId}", "420")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }
}
