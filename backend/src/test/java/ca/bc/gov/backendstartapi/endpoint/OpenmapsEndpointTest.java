package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.exception.OpenmapsProxyException;
import ca.bc.gov.backendstartapi.service.OpenmapsProxyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.MultiValueMap;

@WebMvcTest(OpenmapsEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class OpenmapsEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private OpenmapsProxyService openmapsProxyService;

  @Test
  @DisplayName("proxies a valid WFS query")
  void proxySuccess() throws Exception {
    when(openmapsProxyService.forward(any(MultiValueMap.class)))
        .thenReturn("{\"type\":\"FeatureCollection\",\"features\":[]}");

    mockMvc
        .perform(
            get("/api/openmaps")
                .param("service", "WFS")
                .param("version", "2.0.0")
                .param("request", "GetFeature")
                .param("typeNames", "WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW")
                .param("outputFormat", "application/json")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().json("{\"type\":\"FeatureCollection\",\"features\":[]}"));
  }

  @Test
  @DisplayName("returns 400 when the service rejects the query")
  void proxyBadRequest() throws Exception {
    when(openmapsProxyService.forward(any(MultiValueMap.class)))
        .thenThrow(new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Invalid layer name"));

    mockMvc
        .perform(
            get("/api/openmaps")
                .param("service", "WFS")
                .param("request", "GetFeature")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());
  }
}
