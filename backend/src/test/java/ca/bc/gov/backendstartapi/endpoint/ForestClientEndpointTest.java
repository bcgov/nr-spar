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
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

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
    ForestClientLocationDto testLocation =
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


    List<ForestClientLocationDto> locations = List.of(testLocation);

    when(forestClientService.fetchClientLocations("00000000")).thenReturn(locations);

    mockMvc
        .perform(
            get("/api/forest-clients/00000000/locations")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpectAll(
            jsonPath("$[0].clientNumber").value(locations.get(0).clientNumber()),
            jsonPath("$[0].locationCode").value(locations.get(0).locationCode()),
            jsonPath("$[0].locationName").value(locations.get(0).locationName()),
            jsonPath("$[0].companyCode").value(locations.get(0).companyCode()),
            jsonPath("$[0].address1").value(locations.get(0).address1()),
            jsonPath("$[0].address2").value(locations.get(0).address2()),
            jsonPath("$[0].address3").value(locations.get(0).address3()),
            jsonPath("$[0].city").value(locations.get(0).city()),
            jsonPath("$[0].province").value(locations.get(0).province()),
            jsonPath("$[0].postalCode").value(locations.get(0).postalCode()),
            jsonPath("$[0].country").value(locations.get(0).country()),
            jsonPath("$[0].businessPhone").value(locations.get(0).businessPhone()),
            jsonPath("$[0].homePhone").value(locations.get(0).homePhone()),
            jsonPath("$[0].cellPhone").value(locations.get(0).cellPhone()),
            jsonPath("$[0].faxNumber").value(locations.get(0).faxNumber()),
            jsonPath("$[0].email").value(locations.get(0).email()),
            jsonPath("$[0].expired").value(locations.get(0).expired().name()),
            jsonPath("$[0].trusted").value(locations.get(0).trusted().name()),
            jsonPath("$[0].returnedMailDate").value(locations.get(0).returnedMailDate()),
            jsonPath("$[0].comment").value(locations.get(0).comment()));
  }

  @Test
  @DisplayName("fetchNonExistentClientLocations")
  void fetchNonExistentClientLocations() throws Exception {
    when(forestClientService.fetchClientLocations("00000000")).thenReturn(Collections.emptyList());

    // Forest Client API returns an empty list for non existent
    // clientNumber, with an OK status
    mockMvc
        .perform(
            get("/api/forest-clients/00000000/locations")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("fetchExistentSingleClientLocation")
  void fetchExistentSingleClientLocation() throws Exception {
    ForestClientLocationDto testLocation =
        new ForestClientLocationDto(
            "00000000",
            "12",
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

    when(forestClientService.fetchSingleClientLocation("00000000", "12")).thenReturn(testLocation);

    mockMvc
        .perform(
            get("/api/forest-clients/00000000/location/12")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpectAll(
            jsonPath("$.clientNumber").value(testLocation.clientNumber()),
            jsonPath("$.locationCode").value(testLocation.locationCode()),
            jsonPath("$.locationName").value(testLocation.locationName()),
            jsonPath("$.companyCode").value(testLocation.companyCode()),
            jsonPath("$.address1").value(testLocation.address1()),
            jsonPath("$.address2").value(testLocation.address2()),
            jsonPath("$.address3").value(testLocation.address3()),
            jsonPath("$.city").value(testLocation.city()),
            jsonPath("$.province").value(testLocation.province()),
            jsonPath("$.postalCode").value(testLocation.postalCode()),
            jsonPath("$.country").value(testLocation.country()),
            jsonPath("$.businessPhone").value(testLocation.businessPhone()),
            jsonPath("$.homePhone").value(testLocation.homePhone()),
            jsonPath("$.cellPhone").value(testLocation.cellPhone()),
            jsonPath("$.faxNumber").value(testLocation.faxNumber()),
            jsonPath("$.email").value(testLocation.email()),
            jsonPath("$.expired").value(testLocation.expired().name()),
            jsonPath("$.trusted").value(testLocation.trusted().name()),
            jsonPath("$.returnedMailDate").value(testLocation.returnedMailDate()),
            jsonPath("$.comment").value(testLocation.comment()));
  }

  @Test
  @DisplayName("fetchNonExistentSingleClientLocation")
  void fetchNonExistentSingleClientLocation() throws Exception {
    when(forestClientService.fetchSingleClientLocation("00000000", "12"))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

    mockMvc
        .perform(
            get("/api/forest-clients/00000000/locations/12")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }
}
