package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.entity.NumberTreesCollectedCodeEntity;
import ca.bc.gov.oracleapi.repository.NumberTreesCollectedCodeRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(NumberTreesCollectedEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class NumberTreesCollectedCodeEntityEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private NumberTreesCollectedCodeRepository numberTreesCollectedCodeRepository;

  @Test
  @DisplayName("findAllSuccessTest")
  void findAllSuccessTest() throws Exception {
    NumberTreesCollectedCodeEntity code1 = new NumberTreesCollectedCodeEntity();
    code1.setCode("1");
    code1.setDescription("1 to 10 trees");
    code1.setEffectiveDate(LocalDate.parse("1905-01-01"));
    code1.setExpiryDate(LocalDate.parse("9999-12-31"));

    NumberTreesCollectedCodeEntity code2 = new NumberTreesCollectedCodeEntity();
    code2.setCode("2");
    code2.setDescription("11 to 50 trees");
    code2.setEffectiveDate(LocalDate.parse("1905-01-01"));
    code2.setExpiryDate(LocalDate.parse("9999-12-31"));

    List<NumberTreesCollectedCodeEntity> codes = new ArrayList<>();
    codes.add(code1);
    codes.add(code2);

    when(numberTreesCollectedCodeRepository.findAllValid()).thenReturn(codes);

    mockMvc
        .perform(
            get("/api/number-trees-collected")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].code").value("1"))
        .andExpect(jsonPath("$[0].description").value("1 to 10 trees"))
        .andExpect(jsonPath("$[0].effectiveDate").value("1905-01-01"))
        .andExpect(jsonPath("$[0].expiryDate").value("9999-12-31"))
        .andExpect(jsonPath("$[1].code").value("2"))
        .andExpect(jsonPath("$[1].description").value("11 to 50 trees"))
        .andReturn();
  }

  @Test
  @DisplayName("findAllNoAuthorizedTest")
  @WithAnonymousUser
  void findAllNoAuthorizedTest() throws Exception {
    mockMvc
        .perform(
            get("/api/number-trees-collected")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }
}
