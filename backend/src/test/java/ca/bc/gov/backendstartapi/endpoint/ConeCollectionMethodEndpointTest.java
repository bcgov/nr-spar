package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.UniversalDataDto;
import ca.bc.gov.backendstartapi.service.ConeCollectionMethodService;
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

@WebMvcTest(ConeCollectionMethodEndpoint.class)
class ConeCollectionMethodEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private ConeCollectionMethodService coneCollectionMethodService;

  private static final String API_PATH = "/api/cone-collection-methods";

  private static final String CONTENT_HEADER = "Content-Type";

  private static final String JSON = "application/json";

  @Test
  @DisplayName("getAllConeCollectionMethodsTest")
  @WithMockUser(roles = "user_read")
  void getAllConeCollectionMethodsTest() throws Exception {

    UniversalDataDto firstMethod = new UniversalDataDto("1", "Aerial raking");
    UniversalDataDto secondMethod = new UniversalDataDto("2", "Aerial clipping/topping");
    UniversalDataDto thirdMethod = new UniversalDataDto("3", "Felled trees");

    List<UniversalDataDto> testList =
        new ArrayList<>() {
          {
            add(firstMethod);
            add(secondMethod);
            add(thirdMethod);
          }
        };

    when(coneCollectionMethodService.getAllConeCollectionMethods()).thenReturn(testList);

    mockMvc
        .perform(
            get(API_PATH)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(jsonPath("$[0].code").value("1"))
        .andExpect(jsonPath("$[0].description").value("Aerial raking"))
        .andExpect(jsonPath("$[1].code").value("2"))
        .andExpect(jsonPath("$[1].description").value("Aerial clipping/topping"))
        .andExpect(jsonPath("$[2].code").value("3"))
        .andExpect(jsonPath("$[2].description").value("Felled trees"))
        .andReturn();
  }
}
