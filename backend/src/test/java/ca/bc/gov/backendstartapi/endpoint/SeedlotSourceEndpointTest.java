package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.service.SeedlotSourceService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SeedlotSourceEndpoint.class)
class SeedlotSourceEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private SeedlotSourceService seedlotSourceService;

  private static final String API_PATH = "/api/seedlot-sources";

  private static final String CONTENT_HEADER = "Content-Type";

  private static final String JSON = "application/json";

  @Test
  @DisplayName("getAllSeedlotSource")
  @WithMockUser(roles = "user_read")
  void getAllSeedlotSource() throws Exception {

    CodeDescriptionDto firstMethod = new CodeDescriptionDto("CUS", "Custom Lot");
    CodeDescriptionDto secondMethod = new CodeDescriptionDto("TPT", "Tested Parent Trees");
    CodeDescriptionDto thirdMethod = new CodeDescriptionDto("UPT", "Untested Parent Trees");

    when(seedlotSourceService.getAllSeedlotSource())
        .thenReturn(List.of(firstMethod, secondMethod, thirdMethod));

    mockMvc
        .perform(
            get(API_PATH)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(jsonPath("$[0].code").value(firstMethod.code()))
        .andExpect(jsonPath("$[0].description").value(firstMethod.description()))
        .andExpect(jsonPath("$[1].code").value(secondMethod.code()))
        .andExpect(jsonPath("$[1].description").value(secondMethod.description()))
        .andExpect(jsonPath("$[2].code").value(thirdMethod.code()))
        .andExpect(jsonPath("$[2].description").value(thirdMethod.description()))
        .andReturn();
  }
}
