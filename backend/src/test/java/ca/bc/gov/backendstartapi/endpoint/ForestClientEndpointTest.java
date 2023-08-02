package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
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

  @Test
  @DisplayName("fetchExistentClientLocations")
  void fetchExistentClientLocations() throws Exception {
    ForestClientLocationDto location =
        new ForestClientLocationDto(
            "00000000",
            "123",
            "Office",
            "0987",
            "25 Some Street",
            "",
            "",
            "Vancouver",
            "BC",
            "V9T6J9",
            "Canada",
            "123456987",
            "",
            "987654321",
            "",
            "office@email.com",
            ForestClientExpiredEnum.N,
            ForestClientExpiredEnum.Y,
            "",
            "Near a park"
        );

    when(forestClientService.fetchClientLocations("00000000")).thenReturn(Optional.of(location));

    mockMvc
        .perform(
            get("/api/forest-clients/00000000/locations")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpectAll(
            jsonPath("$.clientNumber").value(location.clientNumber()),
            jsonPath("$.locationCode").value(location.locationCode()),
            jsonPath("$.locationName").value(location.locationName()),
            jsonPath("$.companyCode").value(location.companyCode()),
            jsonPath("$.address1").value(location.address1()),
            jsonPath("$.address2").value(location.address2()),
            jsonPath("$.address3").value(location.address3()),
            jsonPath("$.city").value(location.city()),
            jsonPath("$.province").value(location.province()),
            jsonPath("$.postalCode").value(location.postalCode()),
            jsonPath("$.country").value(location.country()),
            jsonPath("$.businessPhone").value(location.businessPhone()),
            jsonPath("$.homePhone").value(location.homePhone()),
            jsonPath("$.cellPhone").value(location.cellPhone()),
            jsonPath("$.faxNumber").value(location.faxNumber()),
            jsonPath("$.email").value(location.email()),
            jsonPath("$.expired").value(location.expired().name()),
            jsonPath("$.trusted").value(location.trusted().name()),
            jsonPath("$.returnedMailDate").value(location.returnedMailDate()),
            jsonPath("$.comment").value(location.comment()));
  }

  @Test
  @DisplayName("fetchNonExistentClientByNumber")
  void fetchNonExistentClientLocations() throws Exception {
    when(forestClientService.fetchClientLocations("00000000")).thenReturn(Optional.empty());

    mockMvc
        .perform(
            get("/api/forest-clients/00000000")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

}
