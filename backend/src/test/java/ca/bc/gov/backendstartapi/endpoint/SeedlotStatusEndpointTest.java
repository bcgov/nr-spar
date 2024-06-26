package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.service.SeedlotStatusService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SeedlotStatusEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class SeedlotStatusEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private SeedlotStatusService seedlotStatusService;

  private static final String API_PATH = "/api/seedlot-statuses";

  private static final String CONTENT_HEADER = "Content-Type";

  private static final String JSON = "application/json";

  @Test
  @DisplayName("getAllSeedlotStatus")
  void getAllSeedlotStatus() throws Exception {

    CodeDescriptionDto firstMethod = new CodeDescriptionDto("APP", "Approved");
    CodeDescriptionDto secondMethod = new CodeDescriptionDto("CAN", "Cancelled");
    CodeDescriptionDto thirdMethod = new CodeDescriptionDto("COM", "Complete");

    when(seedlotStatusService.getAllValidSeedlotStatusDto())
        .thenReturn(List.of(firstMethod, secondMethod, thirdMethod));

    mockMvc
        .perform(
            get(API_PATH)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(jsonPath("$[0].code").value(firstMethod.getCode()))
        .andExpect(jsonPath("$[0].description").value(firstMethod.getDescription()))
        .andExpect(jsonPath("$[1].code").value(secondMethod.getCode()))
        .andExpect(jsonPath("$[1].description").value(secondMethod.getDescription()))
        .andExpect(jsonPath("$[2].code").value(thirdMethod.getCode()))
        .andExpect(jsonPath("$[2].description").value(thirdMethod.getDescription()))
        .andReturn();
  }
}
