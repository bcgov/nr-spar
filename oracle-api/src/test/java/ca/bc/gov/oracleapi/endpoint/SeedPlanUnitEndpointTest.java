package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.SpuDto;
import ca.bc.gov.oracleapi.exception.SpuNotFoundException;
import ca.bc.gov.oracleapi.service.SeedPlanUnitService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SeedPlanUnitEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class SeedPlanUnitEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private SeedPlanUnitService seedPlanUnitService;

  @Test
  @DisplayName("Get a SPU dto should succeed")
  void getSpuDto_shouldSucceed() throws Exception {
    SpuDto spuDto = new SpuDto();

    Integer spuId = 5000;
    Integer spzId = 7000;
    String spzCode = "M";

    spuDto.setSeedPlanUnitId(spuId);
    spuDto.setSeedPlanZoneId(spzId);
    spuDto.setSeedPlanZoneCode(spzCode);

    when(seedPlanUnitService.getSpuById(spuId.toString())).thenReturn(spuDto);

    mockMvc
        .perform(
            get("/api/seed-plan-unit/{spuId}", spuId.toString())
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.seedPlanUnitId").value(spuId))
        .andExpect(jsonPath("$.seedPlanZoneId").value(spzId))
        .andExpect(jsonPath("$.seedPlanZoneCode").value(spzCode))
        .andReturn();
  }

  @Test
  @DisplayName("Get SPU by ID endpoint should be able to handle erros.")
  void getSpuById__shouldHandleError() throws Exception {
    when(seedPlanUnitService.getSpuById(any())).thenThrow(new SpuNotFoundException());

    mockMvc
        .perform(
            get("/api/seed-plan-unit/{spuId}", "999")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }
}
