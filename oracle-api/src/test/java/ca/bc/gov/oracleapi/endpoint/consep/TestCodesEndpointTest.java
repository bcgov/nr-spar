package ca.bc.gov.oracleapi.endpoint.consep;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.TestCodeDto;
import ca.bc.gov.oracleapi.service.consep.TestCodeService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TestCodeEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
class TestCodesEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private TestCodeService testCodeService;

  @Test
  void getTestTypeCodes_shouldReturnList() throws Exception {
    List<TestCodeDto> mockCodes = List.of(new TestCodeDto("TT1", "TEST type 1"));
    when(testCodeService.getTestTypeCodes()).thenReturn(mockCodes);

    mockMvc.perform(get("/api/test-codes/type").with(csrf()))
        .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].code").value("TT1"));
  }

  @Test
  void getTestCategoryCodes_shouldReturnList() throws Exception {
    List<TestCodeDto> mockCodes = List.of(new TestCodeDto("CAT1", "Category 1"));
    when(testCodeService.getTestCategoryCodes()).thenReturn(mockCodes);

    mockMvc.perform(get("/api/test-codes/category").with(csrf()))
        .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].code").value("CAT1"));
  }

  @Test
  void getCodesByActivity_shouldReturnList() throws Exception {
    String activity = "TEST_ACTIVITY";
    List<String> mockCodes = List.of("CODE1", "CODE2");
    when(testCodeService.getCodesByColumnActivity(activity)).thenReturn(mockCodes);

    mockMvc.perform(get("/api/test-codes/by-activity?activity={activity}", activity).with(csrf()))
        .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0]").value("CODE1"))
        .andExpect(jsonPath("$[1]").value("CODE2"));
  }

  @Test
  void getRequestTypes_shouldReturnList() throws Exception {
    List<TestCodeDto> mockCodes = List.of(new TestCodeDto("ASP", "Additional Seed Processing"));
    when(testCodeService.getRequestTypes()).thenReturn(mockCodes);

    mockMvc.perform(get("/api/test-codes/request-types").with(csrf()))
        .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].code").value("ASP"));
  }

  @Test
  void getActivityDurationTimeUnits_shouldReturnList() throws Exception {
    List<String> mockUnits = List.of("HR", "DY", "WK");
    when(testCodeService.getActivityDurationTimeUnits()).thenReturn(mockUnits);

    mockMvc.perform(get("/api/test-codes/activity-duration-units").with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(3)))
        .andExpect(jsonPath("$[0]").value("HR"))
        .andExpect(jsonPath("$[1]").value("DY"))
        .andExpect(jsonPath("$[2]").value("WK"));
  }
}