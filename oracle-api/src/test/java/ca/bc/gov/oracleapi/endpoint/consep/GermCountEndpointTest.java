package ca.bc.gov.oracleapi.endpoint.consep;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.GermCountDto;
import ca.bc.gov.oracleapi.service.consep.GermCountService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(GermCountEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
class GermCountEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private GermCountService germCountService;

  private static final String BASE_URL = "/api/germ-counts";

  private GermCountDto buildDto(BigDecimal riaSkey) {
    return new GermCountDto(
        riaSkey,
        // slot 1
        new BigDecimal("1001"), LocalDate.of(2026, 4, 1), 1,
        10, 12, 11, 9, new BigDecimal("0.4200"),
        // slot 2
        new BigDecimal("1002"), LocalDate.of(2026, 4, 2), 2,
        14, 15, 13, 16, new BigDecimal("0.5800"),
        // slots 3–13 all null
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        // audit
        "USER1", LocalDateTime.of(2026, 1, 10, 9, 0),
        "USER2", LocalDateTime.of(2026, 4, 5, 14, 30)
    );
  }

  @Test
  void getGermCounts_returns200AndBody_whenFound() throws Exception {
    BigDecimal riaSkey = new BigDecimal("881191");
    GermCountDto dto = buildDto(riaSkey);

    when(germCountService.getGermCounts(riaSkey)).thenReturn(dto);

    mockMvc
        .perform(get(BASE_URL + "/" + riaSkey).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.riaSkey").value(881191))
        .andExpect(jsonPath("$.dailyGermSkey1").value(1001))
        .andExpect(jsonPath("$.countDt1").value("2026-04-01"))
        .andExpect(jsonPath("$.dayNoOfTest1").value(1))
        .andExpect(jsonPath("$.rep1NoSeedsGerm1").value(10))
        .andExpect(jsonPath("$.cumulativeGerm1").value(0.4200))
        .andExpect(jsonPath("$.dailyGermSkey2").value(1002))
        .andExpect(jsonPath("$.countDt2").value("2026-04-02"))
        .andExpect(jsonPath("$.dailyGermSkey3").value(nullValue()))
        .andExpect(jsonPath("$.entryUserid").value("USER1"))
        .andExpect(jsonPath("$.updateUserid").value("USER2"));

    verify(germCountService, times(1)).getGermCounts(riaSkey);
  }

  @Test
  void getGermCounts_returns200_whenAllOptionalSlotsAreNull() throws Exception {
    BigDecimal riaSkey = new BigDecimal("100001");
    GermCountDto dto = new GermCountDto(
        riaSkey,
        null, null, null, null, null, null, null, null,  // slot 1
        null, null, null, null, null, null, null, null,  // slot 2
        null, null, null, null, null, null, null, null,  // slot 3
        null, null, null, null, null, null, null, null,  // slot 4
        null, null, null, null, null, null, null, null,  // slot 5
        null, null, null, null, null, null, null, null,  // slot 6
        null, null, null, null, null, null, null, null,  // slot 7
        null, null, null, null, null, null, null, null,  // slot 8
        null, null, null, null, null, null, null, null,  // slot 9
        null, null, null, null, null, null, null, null,  // slot 10
        null, null, null, null, null, null, null, null,  // slot 11
        null, null, null, null, null, null, null, null,  // slot 12
        null, null, null, null, null, null, null, null,  // slot 13
        null, null, null, null                           // audit
    );

    when(germCountService.getGermCounts(riaSkey)).thenReturn(dto);

    mockMvc
        .perform(get(BASE_URL + "/" + riaSkey).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.riaSkey").value(100001))
        .andExpect(jsonPath("$.dailyGermSkey1").value(nullValue()))
        .andExpect(jsonPath("$.countDt1").value(nullValue()))
        .andExpect(jsonPath("$.entryUserid").value(nullValue()));

    verify(germCountService, times(1)).getGermCounts(riaSkey);
  }

  @Test
  void getGermCounts_returns404_whenNotFound() throws Exception {
    BigDecimal riaSkey = new BigDecimal("999999");

    when(germCountService.getGermCounts(riaSkey))
        .thenThrow(new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "No germ count data found for RIA_SKEY: " + riaSkey));

    mockMvc
        .perform(get(BASE_URL + "/" + riaSkey).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());

    verify(germCountService, times(1)).getGermCounts(riaSkey);
  }

  @Test
  @WithAnonymousUser
  void getGermCounts_returns401_whenUnauthorized() throws Exception {
    mockMvc
        .perform(get(BASE_URL + "/881191").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized());

    verify(germCountService, times(0)).getGermCounts(null);
  }

  @Test
  @WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
  void getGermCounts_returns403_whenUserDoesNotHaveRequiredRole() throws Exception {
    mockMvc
        .perform(get(BASE_URL + "/881191").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden());

    verify(germCountService, times(0)).getGermCounts(null);
  }
}
