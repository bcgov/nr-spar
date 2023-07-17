package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import ca.bc.gov.backendstartapi.service.ForestClientService;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ForestClientEndpoint.class)
@WithMockUser(roles = "user_read")
class ForestClientEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private ForestClientService forestClientService;

  @Test
  @DisplayName("fetchExistentClientByNumber")
  void fetchExistentClientByNumber() throws Exception {
    ForestClientDto client =
        new ForestClientDto(
            "00000000",
            "SMITH",
            "JOHN",
            "JOSEPH",
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.I,
            "JSMITH");

    when(forestClientService.fetchClient("00000000")).thenReturn(Optional.of(client));

    mockMvc
        .perform(
            get("/api/forest-clients/00000000")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpectAll(
            jsonPath("$.clientNumber").value(client.clientNumber()),
            jsonPath("$.clientName").value(client.clientName()),
            jsonPath("$.legalFirstName").value(client.legalFirstName()),
            jsonPath("$.legalMiddleName").value(client.legalMiddleName()),
            jsonPath("$.clientStatusCode").value(client.clientStatusCode().name()),
            jsonPath("$.clientTypeCode").value(client.clientTypeCode().name()),
            jsonPath("$.acronym").value(client.acronym()));
  }

  @Test
  @DisplayName("fetchNonExistentClientByNumber")
  void fetchNonExistentClientByNumber() throws Exception {
    when(forestClientService.fetchClient("00000000")).thenReturn(Optional.empty());

    mockMvc
        .perform(
            get("/api/forest-clients/00000000")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("fetchExistentClientByAcronym")
  void fetchExistentClientByAcronym() throws Exception {
    ForestClientDto client =
        new ForestClientDto(
            "00000000",
            "SMITH",
            "JOHN",
            "JOSEPH",
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.I,
            "JSMITH");

    when(forestClientService.fetchClient("JSMITH")).thenReturn(Optional.of(client));

    mockMvc
        .perform(
            get("/api/forest-clients/JSMITH")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpectAll(
            jsonPath("$.clientNumber").value(client.clientNumber()),
            jsonPath("$.clientName").value(client.clientName()),
            jsonPath("$.legalFirstName").value(client.legalFirstName()),
            jsonPath("$.legalMiddleName").value(client.legalMiddleName()),
            jsonPath("$.clientStatusCode").value(client.clientStatusCode().name()),
            jsonPath("$.clientTypeCode").value(client.clientTypeCode().name()),
            jsonPath("$.acronym").value(client.acronym()));
  }

  @Test
  @DisplayName("fetchNonExistentClientByAcronym")
  void fetchNonExistentClientByAcronym() throws Exception {
    when(forestClientService.fetchClient("JSMITH")).thenReturn(Optional.empty());

    mockMvc
        .perform(
            get("/api/forest-clients/JSMITH")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }
}
