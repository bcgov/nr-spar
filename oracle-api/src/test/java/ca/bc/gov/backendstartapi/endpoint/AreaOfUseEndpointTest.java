package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.SpzDto;
import ca.bc.gov.backendstartapi.service.AreaOfUseService;
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

    when(areaOfUseService.getAllSpz()).thenReturn(spzList);

    mockMvc
        .perform(
            get("/api/area-of-use/tested-parent-trees/spz-list")
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
    when(areaOfUseService.getAllSpz())
        .thenThrow(new ResponseStatusException(HttpStatus.I_AM_A_TEAPOT));

    mockMvc
        .perform(
            get("/api/area-of-use/tested-parent-trees/spz-list")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isIAmATeapot())
        .andReturn();
  }
}
