package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.entity.SearchCriteriaEntity;
import ca.bc.gov.backendstartapi.service.SearchCriteriaService;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SearchCriteriaEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class SearchCriteriaEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private SearchCriteriaService searchCriteriaService;

  private static final String API_PATH = "/api/search-criteria";
  private static final String CONTENT_HEADER = "Content-Type";
  private static final String JSON = "application/json";

  private SearchCriteriaEntity createEntity(String pageId, String criteriaJson) {
    return new SearchCriteriaEntity("testUser", pageId, criteriaJson);
  }

  @Test
  @DisplayName("getCriteria returns 200 when criteria exist")
  void getCriteriaFoundTest() throws Exception {
    String pageId = "SEEDLOT_SEARCH";
    String criteriaJson = "{\"status\":\"active\"}";
    SearchCriteriaEntity entity = createEntity(pageId, criteriaJson);

    when(searchCriteriaService.getCriteria(eq(pageId))).thenReturn(Optional.of(entity));

    mockMvc
        .perform(
            get(API_PATH + "/{pageId}", pageId)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pageId").value(pageId))
        .andExpect(jsonPath("$.criteriaJson").value(criteriaJson))
        .andReturn();
  }

  @Test
  @DisplayName("getCriteria returns 404 when no criteria saved")
  void getCriteriaNotFoundTest() throws Exception {
    String pageId = "NONEXISTENT_PAGE";

    when(searchCriteriaService.getCriteria(eq(pageId))).thenReturn(Optional.empty());

    mockMvc
        .perform(
            get(API_PATH + "/{pageId}", pageId)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("setCriteria creates or updates criteria and returns 200")
  void setCriteriaSuccessTest() throws Exception {
    String pageId = "SEEDLOT_SEARCH";
    String criteriaJson = "{\"status\":\"pending\"}";
    SearchCriteriaEntity entity = createEntity(pageId, criteriaJson);

    when(searchCriteriaService.setCriteria(eq(pageId), anyString())).thenReturn(entity);

    String requestBody = "{\"criteriaJson\":\"{\\\"status\\\":\\\"pending\\\"}\"}";

    mockMvc
        .perform(
            put(API_PATH + "/{pageId}", pageId)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(requestBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pageId").value(pageId))
        .andExpect(jsonPath("$.criteriaJson").value(criteriaJson))
        .andReturn();
  }

  @Test
  @DisplayName("setCriteria returns 400 for blank criteriaJson")
  void setCriteriaBlankBodyTest() throws Exception {
    String pageId = "SEEDLOT_SEARCH";
    String requestBody = "{\"criteriaJson\":\"\"}";

    mockMvc
        .perform(
            put(API_PATH + "/{pageId}", pageId)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(requestBody))
        .andExpect(status().isBadRequest())
        .andReturn();
  }

  @Test
  @DisplayName("setCriteria returns 400 for null criteriaJson")
  void setCriteriaNullBodyTest() throws Exception {
    String pageId = "SEEDLOT_SEARCH";
    String requestBody = "{}";

    mockMvc
        .perform(
            put(API_PATH + "/{pageId}", pageId)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(requestBody))
        .andExpect(status().isBadRequest())
        .andReturn();
  }
}
