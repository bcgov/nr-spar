package ca.bc.gov.backendstartapi.provider;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpuDto;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import org.springframework.web.server.ResponseStatusException;

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
  @DisplayName("findOrchardWithVegCodeProviderTest")
  void findOrchardWithVegCodeProviderTest() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("1f7a4k5e8t9o5k6e9n8h5e2r6e");

    String vegCode = "FDC";
    String url = "/null/api/orchards/vegetation-code/" + vegCode;

    String json =
        """
        [
          {
            "id": "339",
            "name": "EAGLEROCK",
            "vegetationCode": "PLI",
            "lotTypeCode": "S",
            "lotTypeDescription": "Seed Lot",
            "stageCode": "PRD"
          }
        ]
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    List<OrchardDto> orchardDtoList = oracleApiProvider.findOrchardsByVegCode(vegCode);

    Assertions.assertEquals("339", orchardDtoList.get(0).id());
    Assertions.assertFalse(orchardDtoList.isEmpty());
  }

  @Test
  @DisplayName("findOrchardWithVegCodeProviderErrorTest")
  void findOrchardWithVegCodeProviderErrorTest() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("");

    String vegCode = "FDC";
    String url = "/null/api/orchards/vegetation-code/" + vegCode;

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.NOT_FOUND));

    List<OrchardDto> orchardDtoList = oracleApiProvider.findOrchardsByVegCode(vegCode);

    Assertions.assertTrue(orchardDtoList.isEmpty());
  }

  @Test
  @DisplayName("findParentTreesByVegCodeTest")
  void findParentTreesByVegCodeTest() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("1f7a4k5e8t9o5k6e9n8h5e2r6e");

    String vegCode = "FDC";
    String url = "/null/api/orchards/parent-trees/vegetation-codes/" + vegCode;

    String json =
        """
        [
          {
            "parentTreeId": 1003477,
            "parentTreeNumber": "34",
            "orchardId": "1",
            "spu": 0,
            "parentTreeGeneticQualities": [
              {
                "geneticTypeCode": "BV",
                "geneticWorthCode": "GVO",
                "geneticQualityValue": 18
              }
            ]
          }
        ]
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    Map<String, String> testMap = new HashMap<>();

    List<SameSpeciesTreeDto> parentTreeDtoList =
        oracleApiProvider.findParentTreesByVegCode(vegCode, testMap);

    Assertions.assertFalse(parentTreeDtoList.isEmpty());
    Assertions.assertEquals("1003477", parentTreeDtoList.get(0).getParentTreeId().toString());
    Assertions.assertEquals("34", parentTreeDtoList.get(0).getParentTreeNumber());
  }

  @Test
  @DisplayName("findParentTreesByVegCodeErrorTest")
  void findParentTreesByVegCodeErrorTest() throws Exception {
    when(loggedUserService.getLoggedUserToken()).thenReturn("");

    String vegCode = "LAMB";
    String url = "/null/api/orchards/parent-trees/vegetation-codes/" + vegCode;

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.BAD_REQUEST));

    Map<String, String> testMap = new HashMap<>();

    ResponseStatusException httpExc =
        Assertions.assertThrows(
            ResponseStatusException.class,
            () -> {
              oracleApiProvider.findParentTreesByVegCode(vegCode, testMap);
            });

    Assertions.assertEquals(HttpStatus.BAD_REQUEST, httpExc.getStatusCode());
  }

  @Test
  @DisplayName("Find Orchard with ID success test.")
  void findOrchardById_shouldSucceed() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("1f7a4k5e8t9o5k6e9n8h5e2r6e");

    String orchardId = "339";
    String url = "/null/api/orchards/" + orchardId;

    String json =
        """
          {
            "id": "339",
            "name": "EAGLEROCK",
            "vegetationCode": "PLI",
            "lotTypeCode": "S",
            "lotTypeDescription": "Seed Lot",
            "stageCode": "PRD",
            "becZoneCode": "CWH",
            "becZoneDescription": "Coastal Western Hemlock",
            "becSubzoneCode": "dm",
            "variant": null,
            "becVersionId": 5
          }
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    Optional<OrchardDto> orchardDtoOpt = oracleApiProvider.findOrchardById(orchardId);

    Assertions.assertFalse(orchardDtoOpt.isEmpty());
    Assertions.assertEquals(orchardId, orchardDtoOpt.get().id());
    Assertions.assertEquals("Coastal Western Hemlock", orchardDtoOpt.get().becZoneDescription());
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
