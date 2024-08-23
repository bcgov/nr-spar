package ca.bc.gov.backendstartapi.provider;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpuDto;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;

@RestClientTest(OracleApiProvider.class)
class OracleApiProviderTest {

  @Autowired private OracleApiProvider oracleApiProvider;

  @MockBean private LoggedUserService loggedUserService;

  @MockBean private ProvidersConfig providersConfig;

  @Autowired private MockRestServiceServer mockRestServiceServer;

  @Test
  @DisplayName("findOrchardParentTreeGeneticQualityDataProviderTest")
  void findOrchardParentTreeGeneticQualityDataProviderTest() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("1f7a4k5e8t9o5k6e9n8h5e2r6e");

    String orchardId = "405";
    int spuId = 7;
    String url = "/null/api/orchards/parent-tree-genetic-quality/" + orchardId + "/" + spuId;

    String json =
        """
        {
          "orchardId": "123",
          "vegetationCode": "AT",
          "seedPlanningUnitId": 11,
          "parentTrees": []
        }
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    Optional<OrchardSpuDto> orchardSpuDto =
        oracleApiProvider.findOrchardParentTreeGeneticQualityData(orchardId, spuId);

    Assertions.assertTrue(orchardSpuDto.isPresent());
  }

  @Test
  @DisplayName("findOrchardParentTreeGeneticQualityDataErrorProviderTest")
  void findOrchardParentTreeGeneticQualityDataErrorProviderTest() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("");

    String orchardId = "405";
    int spuId = 7;
    String url = "/null/api/orchards/parent-tree-genetic-quality/" + orchardId + "/" + spuId;

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.NOT_FOUND));

    Optional<OrchardSpuDto> orchardSpuDto =
        oracleApiProvider.findOrchardParentTreeGeneticQualityData(orchardId, spuId);

    Assertions.assertFalse(orchardSpuDto.isPresent());
  }

  @Test
  @DisplayName("Get SPU with ID success test")
  void getSpuById_shouldSucceed() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("1f7a4k5e8t9o5k6e9n8h5e2r6e");

    Integer spuId = 7;
    String url = "/null/api/seed-plan-unit/" + spuId.toString();

    String json =
        """
          {
            "seedPlanUnitId": 7,
            "primaryInd": false,
            "seedPlanZoneId": 1284,
            "elevationBand": "LOW",
            "elevationMax": 700,
            "elevationMin": 1,
            "createDate": "2001-07-01",
            "latitudeBand": null,
            "latitudeDegreesMin": 48,
            "latitudeMinutesMin": 0,
            "latitudeDegreesMax": 52,
            "latitudeMinutesMax": 0,
            "seedPlanZoneCode": "M"
          }
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    Optional<SpuDto> optSpuDto = oracleApiProvider.getSpuById(spuId);

    Assertions.assertFalse(optSpuDto.isEmpty());
    Assertions.assertEquals(spuId, optSpuDto.get().getSeedPlanUnitId());
    Assertions.assertEquals("M", optSpuDto.get().getSeedPlanZoneCode());
  }

  @Test
  @DisplayName("Get SPU by id should return empty on error")
  void getSpuById_shouldReturnEmpty_onError() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("");

    Integer spuId = 7;
    String url = "/null/api/seed-plan-unit/" + spuId.toString();

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.BAD_REQUEST));

    Optional<SpuDto> optSpuDto = oracleApiProvider.getSpuById(spuId);

    Assertions.assertTrue(optSpuDto.isEmpty());
  }
}
