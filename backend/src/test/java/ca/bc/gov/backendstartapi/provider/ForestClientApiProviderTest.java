package ca.bc.gov.backendstartapi.provider;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.server.ResponseStatusException;

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

  @Test
  @DisplayName("fetchExistentClientLocation")
  void fetchExistentClientLocation() {
    String number = "00030064";
    String url = "/null/clients/" + number + "/locations";

    String json =
        """
          [
            {
                "clientNumber": "00030064",
                "locationCode": "00",
                "companyCode": "30064",
                "address1": "MINISTRY OF FORESTS",
                "address2": "100 MILE HOUSE FOREST DISTRICT",
                "address3": "PO BOX 129",
                "city": "100 MILE HOUSE",
                "province": "BC",
                "postalCode": "V0K2E0",
                "country": "CANADA",
                "businessPhone": "2503957800",
                "expired": "N",
                "trusted": "N"
            },
            {
                "clientNumber": "00030064",
                "locationCode": "01",
                "companyCode": " ",
                "address1": "PO BOX 129",
                "city": "100 MILE HOUSE",
                "province": "BC",
                "postalCode": "V0E2K0",
                "country": "CANADA",
                "expired": "N",
                "trusted": "N"
            }
          ]
        """;

    when(providersConfig.getForestClientApiKey()).thenReturn("1z2x2a4s5d5");

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    List<ForestClientLocationDto> locationDto =
        forestClientApiProvider.fetchLocationsByClientNumber(number);

    Assertions.assertFalse(locationDto.isEmpty());

    ForestClientLocationDto clientLocation = locationDto.get(0);
    Assertions.assertEquals("00030064", clientLocation.clientNumber());
    Assertions.assertEquals("00", clientLocation.locationCode());
    Assertions.assertEquals("30064", clientLocation.companyCode());
    Assertions.assertEquals("MINISTRY OF FORESTS", clientLocation.address1());
    Assertions.assertEquals("100 MILE HOUSE FOREST DISTRICT", clientLocation.address2());
    Assertions.assertEquals("PO BOX 129", clientLocation.address3());
    Assertions.assertEquals("100 MILE HOUSE", clientLocation.city());
    Assertions.assertEquals("BC", clientLocation.province());
    Assertions.assertEquals("V0K2E0", clientLocation.postalCode());
    Assertions.assertEquals("CANADA", clientLocation.country());
    Assertions.assertEquals("2503957800", clientLocation.businessPhone());
    Assertions.assertEquals(ForestClientExpiredEnum.N, clientLocation.expired());
    Assertions.assertEquals(ForestClientExpiredEnum.N, clientLocation.trusted());

    clientLocation = locationDto.get(1);
    Assertions.assertEquals("00030064", clientLocation.clientNumber());
    Assertions.assertEquals("01", clientLocation.locationCode());
    Assertions.assertEquals(" ", clientLocation.companyCode());
    Assertions.assertEquals("PO BOX 129", clientLocation.address1());
    Assertions.assertEquals("100 MILE HOUSE", clientLocation.city());
    Assertions.assertEquals("BC", clientLocation.province());
    Assertions.assertEquals("V0E2K0", clientLocation.postalCode());
    Assertions.assertEquals("CANADA", clientLocation.country());
    Assertions.assertEquals(ForestClientExpiredEnum.N, clientLocation.expired());
    Assertions.assertEquals(ForestClientExpiredEnum.N, clientLocation.trusted());

  }

  @Test
  @DisplayName("fetchNonExistentClientLocation")
  void fetchNonExistentClientLocation() {
    String number = "00000000";
    String url = "/null/clients/" + number + "/locations";

    when(providersConfig.getForestClientApiKey()).thenReturn("1z2x2a4s5d5");

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withStatus(HttpStatusCode.valueOf(404)));

    List<ForestClientLocationDto> locationDto =
        forestClientApiProvider.fetchLocationsByClientNumber(number);

    Assertions.assertTrue(locationDto.isEmpty());
  }

  @Test
  @DisplayName("fetchExistentSinglelientLocation")
  void fetchExistentSinglelientLocation() {
    String number = "00012797";
    String locationCode = "00";
    String url = "/null/clients/" + number + "/locations/" + locationCode;

    String json =
        """
          {
            "clientNumber": "00012797",
            "locationCode": "00",
            "locationName": "TREE SEED CENTRE",
            "companyCode": "12797",
            "address1": "TREE SEED CENTRE",
            "address2": "18793 32ND AVENUE",
            "city": "SURREY",
            "province": "BC",
            "postalCode": "V3Z1A7",
            "country": "CANADA",
            "businessPhone": "6045411683",
            "faxNumber": "6045411685",
            "expired": "N",
            "trusted": "N",
            "comment": "OCT. 28/14 - POSTAL CODE CHANGED BY CANADA POST FROM V3S 0L5 TO V3Z 1A7."
          }
        """;

    when(providersConfig.getForestClientApiKey()).thenReturn("1z2x2a4s5d5");

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    ForestClientLocationDto locationDto =
        forestClientApiProvider.fetchSingleClientLocation(number, locationCode);

    Assertions.assertNotNull(locationDto);

    Assertions.assertEquals("00012797", locationDto.clientNumber());
    Assertions.assertEquals("00", locationDto.locationCode());
    Assertions.assertEquals("TREE SEED CENTRE", locationDto.locationName());
    Assertions.assertEquals("12797", locationDto.companyCode());
    Assertions.assertEquals("TREE SEED CENTRE", locationDto.address1());
    Assertions.assertEquals("18793 32ND AVENUE", locationDto.address2());
    Assertions.assertEquals("SURREY", locationDto.city());
    Assertions.assertEquals("BC", locationDto.province());
    Assertions.assertEquals("V3Z1A7", locationDto.postalCode());
    Assertions.assertEquals("CANADA", locationDto.country());
    Assertions.assertEquals("6045411683", locationDto.businessPhone());
    Assertions.assertEquals("6045411685", locationDto.faxNumber());
    Assertions.assertEquals(ForestClientExpiredEnum.N, locationDto.expired());
    Assertions.assertEquals(ForestClientExpiredEnum.N, locationDto.trusted());
    Assertions.assertEquals("OCT. 28/14 - POSTAL CODE CHANGED BY CANADA POST FROM V3S 0L5 TO V3Z 1A7.", locationDto.comment());
  }

  @Test
  @DisplayName("fetchNonExistentSingleClientLocation")
  void fetchNonExistentSingleClientLocation() {
    String number = "00000000";
    String locationCode = "00";
    String url = "/null/clients/" + number + "/locations/" + locationCode;

    when(providersConfig.getForestClientApiKey()).thenReturn("1z2x2a4s5d5");

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withStatus(HttpStatusCode.valueOf(404)));

    ResponseStatusException exc =
      Assertions.assertThrows(
        ResponseStatusException.class,
        () -> {
          forestClientApiProvider.fetchSingleClientLocation(number, locationCode);
        });

    Assertions.assertEquals(HttpStatus.NOT_FOUND, exc.getStatusCode());
  }
}
