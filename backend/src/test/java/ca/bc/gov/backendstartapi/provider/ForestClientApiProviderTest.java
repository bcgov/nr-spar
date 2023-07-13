package ca.bc.gov.backendstartapi.provider;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;

@RestClientTest(ForestClientApiProvider.class)
class ForestClientApiProviderTest {

  @Autowired private ForestClientApiProvider forestClientApiProvider;

  @Autowired private MockRestServiceServer mockRestServiceServer;

  @MockBean private ProvidersConfig providersConfig;

  @Test
  @DisplayName("fetchExistentClientByNumber")
  void fetchExistentClientByNumber() {
    String clientNumber = "00012797";
    String url = "/null/clients/findByClientNumber/" + clientNumber;

    String json =
        """
        {
          "clientNumber": "00012797",
          "clientName": "MINISTRY OF FORESTS",
          "legalFirstName": null,
          "legalMiddleName": null,
          "clientStatusCode": "ACT",
          "clientTypeCode": "F",
          "acronym": "MOF"
        }
        """;

    when(providersConfig.getForestClientApiKey()).thenReturn("1z2x2a4s5d5");

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    Optional<ForestClientDto> clientDto =
        forestClientApiProvider.fetchClientByIdentifier(clientNumber);

    Assertions.assertTrue(clientDto.isPresent());

    ForestClientDto forestClient = clientDto.get();
    Assertions.assertEquals("00012797", forestClient.clientNumber());
    Assertions.assertEquals("MINISTRY OF FORESTS", forestClient.clientName());
    Assertions.assertNull(forestClient.legalFirstName());
    Assertions.assertNull(forestClient.legalMiddleName());
    Assertions.assertEquals(ForestClientStatusEnum.ACT, forestClient.clientStatusCode());
    Assertions.assertEquals(ForestClientTypeEnum.F, forestClient.clientTypeCode());
    Assertions.assertEquals("MOF", forestClient.acronym());
  }

  @Test
  @DisplayName("fetchInexistentClientByNumber")
  void fetchInexistentClientByNumber() {
    String clientNumber = "00012797";
    String url = "/null/clients/findByClientNumber/" + clientNumber;

    when(providersConfig.getForestClientApiKey()).thenReturn("1z2x2a4s5d5");

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withStatus(HttpStatusCode.valueOf(404)));

    Optional<ForestClientDto> clientDto =
        forestClientApiProvider.fetchClientByIdentifier(clientNumber);

    Assertions.assertTrue(clientDto.isEmpty());
  }

  @Test
  @DisplayName("fetchExistentClientByAcronym")
  void fetchExistentClientByAcronym() {
    String identifier = "MOF";
    String url = "/null/clients/findByAcronym?acronym=" + identifier;

    String json =
        """
        [{
          "clientNumber": "00012797",
          "clientName": "MINISTRY OF FORESTS",
          "legalFirstName": null,
          "legalMiddleName": null,
          "clientStatusCode": "ACT",
          "clientTypeCode": "F",
          "acronym": "MOF"
        }]
        """;

    when(providersConfig.getForestClientApiKey()).thenReturn("1z2x2a4s5d5");

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    Optional<ForestClientDto> clientDto =
        forestClientApiProvider.fetchClientByIdentifier(identifier);

    Assertions.assertTrue(clientDto.isPresent());

    ForestClientDto forestClient = clientDto.get();
    Assertions.assertEquals("00012797", forestClient.clientNumber());
    Assertions.assertEquals("MINISTRY OF FORESTS", forestClient.clientName());
    Assertions.assertNull(forestClient.legalFirstName());
    Assertions.assertNull(forestClient.legalMiddleName());
    Assertions.assertEquals(ForestClientStatusEnum.ACT, forestClient.clientStatusCode());
    Assertions.assertEquals(ForestClientTypeEnum.F, forestClient.clientTypeCode());
    Assertions.assertEquals("MOF", forestClient.acronym());
  }

  @Test
  @DisplayName("fetchInexistentClientByAcronym")
  void fetchInexistentClientByAcronym() {
    String identifier = "MOFF";
    String url = "/null/clients/findByAcronym?acronym=" + identifier;

    when(providersConfig.getForestClientApiKey()).thenReturn("1z2x2a4s5d5");

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withStatus(HttpStatusCode.valueOf(404)));

    Optional<ForestClientDto> clientDto =
        forestClientApiProvider.fetchClientByIdentifier(identifier);

    Assertions.assertTrue(clientDto.isEmpty());
  }
}
