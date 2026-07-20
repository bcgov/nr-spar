package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.OrgUnitDto;
import ca.bc.gov.oracleapi.repository.OrgUnitRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(OrgUnitEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class OrgUnitEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private OrgUnitRepository orgUnitRepository;

  @Test
  @DisplayName("findAllDistrictsSuccessTest")
  void findAllDistrictsSuccessTest() throws Exception {
    when(orgUnitRepository.findAllDistricts())
        .thenReturn(
            List.of(
                new OrgUnitDto(
                    45,
                    "DCC",
                    "Cariboo-Chilcotin Natural Resource District",
                    45,
                    LocalDate.parse("1905-01-01"),
                    LocalDate.parse("9999-12-31")),
                new OrgUnitDto(
                    46,
                    "DPG",
                    "Prince George Natural Resource District",
                    46,
                    LocalDate.parse("1905-01-01"),
                    LocalDate.parse("9999-12-31"))));

    mockMvc
        .perform(
            get("/api/org-unit-districts")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].orgUnitNo").value(45))
        .andExpect(jsonPath("$[0].orgUnitCode").value("DCC"))
        .andExpect(jsonPath("$[0].orgUnitName").value("Cariboo-Chilcotin Natural Resource District"))
        .andExpect(jsonPath("$[0].rollupDistNo").value(45))
        .andExpect(jsonPath("$[0].effectiveDate").value("1905-01-01"))
        .andExpect(jsonPath("$[0].expiryDate").value("9999-12-31"))
        .andExpect(jsonPath("$[1].orgUnitCode").value("DPG"))
        .andReturn();
  }

  @Test
  @DisplayName("findAllDistrictsUnauthorizedTest")
  @WithAnonymousUser
  void findAllDistrictsUnauthorizedTest() throws Exception {
    mockMvc
        .perform(
            get("/api/org-unit-districts")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }
}
