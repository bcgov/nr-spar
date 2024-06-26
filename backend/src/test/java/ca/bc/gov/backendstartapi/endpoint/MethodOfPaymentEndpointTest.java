package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.MethodOfPaymentDto;
import ca.bc.gov.backendstartapi.service.MethodOfPaymentService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(MethodOfPaymentEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class MethodOfPaymentEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private MethodOfPaymentService methodOfPaymentService;

  private static final String API_PATH = "/api/methods-of-payment";

  private static final String CONTENT_HEADER = "Content-Type";

  private static final String JSON = "application/json";

  @Test
  @DisplayName("getAllMethodOfPaymentTest")
  void getAllMethodOfPaymentTest() throws Exception {

    MethodOfPaymentDto firstMethod =
        new MethodOfPaymentDto("CLA", "Invoice to MOF Client Account", null);
    MethodOfPaymentDto secondMethod = new MethodOfPaymentDto("CSH", "Cash Sale", null);
    MethodOfPaymentDto thirdMethod =
        new MethodOfPaymentDto("ITC", "Invoice to Client Address", true);

    when(methodOfPaymentService.getAllMethodOfPayment())
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
