package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.GermCountDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountSlotDto;
import ca.bc.gov.oracleapi.service.consep.GermCountService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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

  private static final String VALID_BODY = """
      {
        "days": [
          {"slotIndex":1,"countDt":"2026-04-01","dayNoOfTest":1,
           "rep1NoSeedsGerm":10,"rep2NoSeedsGerm":12,"rep3NoSeedsGerm":11,"rep4NoSeedsGerm":9}
        ],
        "replicates": [
          {"replicateNumber":1,"totalNoSeeds":100},
          {"replicateNumber":2,"totalNoSeeds":100},
          {"replicateNumber":3,"totalNoSeeds":100},
          {"replicateNumber":4,"totalNoSeeds":100}
        ]
      }
      """;

  private GermCountDto buildDto(BigDecimal riaSkey) {
    return new GermCountDto(
        riaSkey,
        List.of(
            new GermCountSlotDto(1, new BigDecimal("1001"), LocalDate.of(2026, 4, 1), 1, 10, 12, 11, 9,  new BigDecimal("0.4200")),
            new GermCountSlotDto(2, new BigDecimal("1002"), LocalDate.of(2026, 4, 2), 2, 14, 15, 13, 16, new BigDecimal("0.5800"))
        ),
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
        .andExpect(jsonPath("$.slots.length()").value(2))
        .andExpect(jsonPath("$.slots[0].slotIndex").value(1))
        .andExpect(jsonPath("$.slots[0].dailyGermSkey").value(1001))
        .andExpect(jsonPath("$.slots[0].countDt").value("2026-04-01"))
        .andExpect(jsonPath("$.slots[0].dayNoOfTest").value(1))
        .andExpect(jsonPath("$.slots[0].rep1NoSeedsGerm").value(10))
        .andExpect(jsonPath("$.slots[0].cumulativeGerm").value(0.4200))
        .andExpect(jsonPath("$.slots[1].slotIndex").value(2))
        .andExpect(jsonPath("$.slots[1].dailyGermSkey").value(1002))
        .andExpect(jsonPath("$.slots[1].countDt").value("2026-04-02"))
        .andExpect(jsonPath("$.entryUserid").value("USER1"))
        .andExpect(jsonPath("$.updateUserid").value("USER2"));

    verify(germCountService, times(1)).getGermCounts(riaSkey);
  }

  @Test
  void getGermCounts_returns200_whenAllOptionalSlotsAreNull() throws Exception {
    BigDecimal riaSkey = new BigDecimal("100001");
    GermCountDto dto = new GermCountDto(riaSkey, List.of(), null, null, null, null);

    when(germCountService.getGermCounts(riaSkey)).thenReturn(dto);

    mockMvc
        .perform(get(BASE_URL + "/" + riaSkey).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.riaSkey").value(100001))
        .andExpect(jsonPath("$.slots.length()").value(0))
        .andExpect(jsonPath("$.entryUserid").doesNotExist());

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

  @Test
  void upsert_returns200_whenServiceSucceeds() throws Exception {
    BigDecimal riaSkey = new BigDecimal("881191");
    when(germCountService.upsertGermCounts(eq(riaSkey), any(), any()))
        .thenReturn(buildDto(riaSkey));

    mockMvc
        .perform(put(BASE_URL + "/" + riaSkey)
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(VALID_BODY))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.riaSkey").value(881191));

    verify(germCountService, times(1)).upsertGermCounts(eq(riaSkey), any(), any());
  }

  @Test
  void upsert_returns409_whenServiceThrowsConflict() throws Exception {
    BigDecimal riaSkey = new BigDecimal("881191");
    when(germCountService.upsertGermCounts(eq(riaSkey), any(), any()))
        .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "conflict"));

    mockMvc
        .perform(put(BASE_URL + "/" + riaSkey)
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(VALID_BODY))
        .andExpect(status().isConflict());
  }

  @Test
  void upsert_returns400_whenBodyInvalid() throws Exception {
    // days[0] missing required slotIndex -> bean validation 400
    String badBody = """
        {"days":[{"countDt":"2026-04-01","dayNoOfTest":1}],
         "replicates":[{"replicateNumber":1,"totalNoSeeds":100}]}
        """;
    mockMvc
        .perform(put(BASE_URL + "/881191")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(badBody))
        .andExpect(status().isBadRequest());
  }

  @Test
  void upsert_returns400_whenDaysEmpty() throws Exception {
    String badBody = """
        {"days":[],
         "replicates":[{"replicateNumber":1,"totalNoSeeds":100}]}
        """;
    mockMvc
        .perform(put(BASE_URL + "/881191")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(badBody))
        .andExpect(status().isBadRequest());

    verify(germCountService, times(0)).upsertGermCounts(any(), any(), any());
  }

  @Test
  void upsert_returns400_whenReplicatesEmpty() throws Exception {
    String badBody = """
        {"days":[{"slotIndex":1,"countDt":"2026-04-01","dayNoOfTest":1}],
         "replicates":[]}
        """;
    mockMvc
        .perform(put(BASE_URL + "/881191")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(badBody))
        .andExpect(status().isBadRequest());

    verify(germCountService, times(0)).upsertGermCounts(any(), any(), any());
  }

  @Test
  void upsert_returns400_whenSlotIndexOutOfRange() throws Exception {
    String badBody = """
        {"days":[{"slotIndex":14,"countDt":"2026-04-01","dayNoOfTest":1}],
         "replicates":[{"replicateNumber":1,"totalNoSeeds":100}]}
        """;
    mockMvc
        .perform(put(BASE_URL + "/881191")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(badBody))
        .andExpect(status().isBadRequest());

    verify(germCountService, times(0)).upsertGermCounts(any(), any(), any());
  }

  @Test
  void upsert_returns400_whenReplicateNumberOutOfRange() throws Exception {
    String badBody = """
        {"days":[{"slotIndex":1,"countDt":"2026-04-01","dayNoOfTest":1}],
         "replicates":[{"replicateNumber":5,"totalNoSeeds":100}]}
        """;
    mockMvc
        .perform(put(BASE_URL + "/881191")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(badBody))
        .andExpect(status().isBadRequest());

    verify(germCountService, times(0)).upsertGermCounts(any(), any(), any());
  }

  @Test
  void upsert_returns400_whenAbnormalCountOutOfRange() throws Exception {
    String badBody = """
        {"days":[{"slotIndex":1,"countDt":"2026-04-01","dayNoOfTest":1,
                  "rep1Abnormal":{"abnormalNumReverseEmbryo":1000}}],
         "replicates":[{"replicateNumber":1,"totalNoSeeds":100}]}
        """;
    mockMvc
        .perform(put(BASE_URL + "/881191")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(badBody))
        .andExpect(status().isBadRequest());

    verify(germCountService, times(0)).upsertGermCounts(any(), any(), any());
  }

  @Test
  void upsert_returns400_whenMoreThan13Days() throws Exception {
    StringBuilder days = new StringBuilder();
    for (int i = 1; i <= 14; i++) {
      days.append(i > 1 ? "," : "")
          .append("{\"slotIndex\":").append(Math.min(i, 13)).append('}');
    }
    String badBody = "{\"days\":[" + days
        + "],\"replicates\":[{\"replicateNumber\":1,\"totalNoSeeds\":100}]}";
    mockMvc
        .perform(put(BASE_URL + "/881191")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(badBody))
        .andExpect(status().isBadRequest());

    verify(germCountService, times(0)).upsertGermCounts(any(), any(), any());
  }

  @Test
  @WithAnonymousUser
  void upsert_returns401_whenAnonymous() throws Exception {
    mockMvc
        .perform(put(BASE_URL + "/881191")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(VALID_BODY))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
  void upsert_returns403_whenUserDoesNotHaveRequiredRole() throws Exception {
    mockMvc
        .perform(put(BASE_URL + "/881191")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(VALID_BODY))
        .andExpect(status().isForbidden());

    verify(germCountService, times(0)).upsertGermCounts(any(), any(), any());
  }
}
