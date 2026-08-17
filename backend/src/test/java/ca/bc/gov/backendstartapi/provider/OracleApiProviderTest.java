package ca.bc.gov.backendstartapi.provider;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.SeedlotSpeciesDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpuDto;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.List;
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

  @Test
  @DisplayName("findOrchardsByVegCode - valid vegCode should return orchard list")
  void findOrchardsByVegCode_validVegCode_shouldReturnOrchardList() {
    String vegCode = "BV";
    String url = "/null/api/orchards/vegetation-codes/BV";
    String json = "[{ \"id\": \"1\", \"name\": \"Primary Orchard\", \"vegetationCode\": \"BV\" }]";

    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    List<OrchardDto> result = oracleApiProvider.findOrchardsByVegCode(vegCode);

    Assertions.assertFalse(result.isEmpty());
    Assertions.assertEquals(1, result.size());
    Assertions.assertEquals("Primary Orchard", result.get(0).getName());
  }

  @Test
  @DisplayName("findOrchardsByVegCode - invalid vegCode should return empty list")
  void findOrchardsByVegCode_invalidVegCode_shouldReturnEmptyList() {
    String vegCode = "INVALID";
    String url = "/null/api/orchards/vegetation-codes/INVALID";

    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.NOT_FOUND));

    assertThrows(
        ResponseStatusException.class,
        () -> {
          oracleApiProvider.findOrchardsByVegCode(vegCode);
        });
  }

  @Test
  @DisplayName("findOrchardsByVegCode - empty vegCode should return empty list")
  void findOrchardsByVegCode_emptyVegCode_shouldReturnEmptyList() {
    String vegCode = "";
    String url = "/null/api/orchards/vegetation-codes/";

    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.NOT_FOUND));

    assertThrows(
        ResponseStatusException.class,
        () -> {
          oracleApiProvider.findOrchardsByVegCode(vegCode);
        });
  }

  @Test
  @DisplayName("getSeedlotAndSpeciesByRequestKey - success should return dto")
  void getSeedlotAndSpeciesByRequestKey_success_shouldReturnDto() {
    Long requestKey = 500L;
    String url = "/null/api/request-seedlot-and-veglot/seedlot-species/" + requestKey;

    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    String json =
        """
        {
          "seedlotNumber": 16258,
          "vegetationCode": "PLI"
        }
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    SeedlotSpeciesDto result = oracleApiProvider.getSeedlotAndSpeciesByRequestKey(requestKey);

    Assertions.assertEquals(16258L, result.seedlotNumber());
    Assertions.assertEquals("PLI", result.vegetationCode());
  }

  @Test
  @DisplayName("getSeedlotAndSpeciesByRequestKey - not found should throw ResponseStatusException")
  void getSeedlotAndSpeciesByRequestKey_notFound_shouldThrow() {
    Long requestKey = 404L;
    String url = "/null/api/request-seedlot-and-veglot/seedlot-species/" + requestKey;

    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.NOT_FOUND));

    assertThrows(
        ResponseStatusException.class,
        () -> oracleApiProvider.getSeedlotAndSpeciesByRequestKey(requestKey));
  }

  @Test
  @DisplayName("getAllDistrictOrgUnits - success should return list")
  void getAllDistrictOrgUnits_success_shouldReturnList() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/org-unit-districts";
    String json = """
        [{ "orgUnitNo": 73, "orgUnitName": "Cariboo-Chilcotin Natural Resource District" }]
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    var result = oracleApiProvider.getAllDistrictOrgUnits();

    Assertions.assertEquals(1, result.size());
    Assertions.assertEquals(73, result.get(0).orgUnitNo());
    Assertions.assertEquals(
        "Cariboo-Chilcotin Natural Resource District", result.get(0).orgUnitName());
  }

  @Test
  @DisplayName("getAllValidFundingSources - success should return list")
  void getAllValidFundingSources_success_shouldReturnList() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/funding-sources";
    String json = """
        [{ "code": "ITC", "description": "Incremental Tree Improvement" }]
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    var result = oracleApiProvider.getAllValidFundingSources();

    Assertions.assertEquals(1, result.size());
    Assertions.assertEquals("ITC", result.get(0).getCode());
    Assertions.assertEquals("Incremental Tree Improvement", result.get(0).getDescription());
  }

  @Test
  @DisplayName("getVegetationCode - success should return description")
  void getVegetationCode_success_shouldReturnDescription() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/vegetation-codes/FDI";
    String json = """
        { "code": "FDI", "description": "Interior Douglas-fir" }
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    var result = oracleApiProvider.getVegetationCode("FDI");

    Assertions.assertTrue(result.isPresent());
    Assertions.assertEquals("FDI", result.get().getCode());
    Assertions.assertEquals("Interior Douglas-fir", result.get().getDescription());
  }

  @Test
  @DisplayName("getVegetationCode - not found should return empty")
  void getVegetationCode_notFound_shouldReturnEmpty() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/vegetation-codes/ZZZ";

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.NOT_FOUND));

    Assertions.assertTrue(oracleApiProvider.getVegetationCode("ZZZ").isEmpty());
  }
}
