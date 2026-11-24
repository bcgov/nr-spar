package ca.bc.gov.backendstartapi.provider;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.anything;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.SeedlotSpeciesDto;
import ca.bc.gov.backendstartapi.dto.oracle.AreaOfUseDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpuDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpzDto;
import ca.bc.gov.backendstartapi.dto.oracle.SuperiorProvenanceDto;
import ca.bc.gov.backendstartapi.exception.OracleApiProviderException;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpMethod;
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

  @Test
  @DisplayName("getAllDistrictOrgUnits - error should throw")
  void getAllDistrictOrgUnits_error_shouldThrow() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/org-unit-districts";

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.NOT_FOUND));

    assertThrows(ResponseStatusException.class, () -> oracleApiProvider.getAllDistrictOrgUnits());
  }

  @Test
  @DisplayName("getAllValidFundingSources - error should throw")
  void getAllValidFundingSources_error_shouldThrow() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/funding-sources";

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.NOT_FOUND));

    assertThrows(
        ResponseStatusException.class, () -> oracleApiProvider.getAllValidFundingSources());
  }

  @Test
  @DisplayName("getSpzListByVegCode returns the class list for the species")
  void getSpzListByVegCode_shouldReturnZones() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/area-of-use/spz-list/vegetation-code/FDC?geneticClass=B";
    String json =
        """
        [ { "code": "M", "description": "Maritime", "isPrimary": null } ]
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    List<SpzDto> zones = oracleApiProvider.getSpzListByVegCode("FDC", "B");

    Assertions.assertEquals(1, zones.size());
    Assertions.assertEquals("M", zones.get(0).getCode());
    Assertions.assertEquals("Maritime", zones.get(0).getDescription());
  }

  @Test
  @DisplayName("getSpzListByVegCode treats an empty body as no zones")
  void getSpzListByVegCode_nullBody_shouldReturnEmpty() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/area-of-use/spz-list/vegetation-code/FDC?geneticClass=B";

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess("null", MediaType.APPLICATION_JSON));

    Assertions.assertTrue(oracleApiProvider.getSpzListByVegCode("FDC", "B").isEmpty());
  }

  @Test
  @DisplayName("getSpzListByVegCode rethrows a client error")
  void getSpzListByVegCode_clientError_shouldThrow() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/area-of-use/spz-list/vegetation-code/FDC?geneticClass=Z";

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.BAD_REQUEST));

    assertThrows(
        ResponseStatusException.class, () -> oracleApiProvider.getSpzListByVegCode("FDC", "Z"));
  }

  @Test
  @DisplayName("getSpzCoastInteriorCode returns the zone's coast/interior code")
  void getSpzCoastInteriorCode_shouldReturnCode() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/seed-plan-zones/M/coast-interior";

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(
            withSuccess(
                "{ \"seedPlanZoneCode\": \"M\", \"coastInteriorCode\": \"C\" }",
                MediaType.APPLICATION_JSON));

    Assertions.assertEquals(Optional.of("C"), oracleApiProvider.getSpzCoastInteriorCode("M"));
  }

  @Test
  @DisplayName("getSpzCoastInteriorCode rethrows a client error")
  void getSpzCoastInteriorCode_clientError_shouldThrow() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/seed-plan-zones/M/coast-interior";

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.UNAUTHORIZED));

    assertThrows(
        ResponseStatusException.class, () -> oracleApiProvider.getSpzCoastInteriorCode("M"));
  }

  @Test
  @DisplayName("searchTransferLimits sends every criterion and includes null matches")
  void searchTransferLimits_shouldReturnLimits() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url =
        "/null/api/transfer-limits?vegetationCode=FDC&geneticClassCode=B"
            + "&superiorProvenance=false&coastInteriorCode=C&seedPlanZoneCode=M"
            + "&latitudeDeg=49&includeNullMatches=true";
    String json =
        """
        [ { "transferLimitSkey": 2, "vegetationCode": "FDC", "geneticClassCode": "B",
            "superiorProvenance": false, "coastInteriorCode": "C", "seedPlanZoneCode": "M",
            "siteMinLatDeg": 48, "siteMaxLatDeg": 60, "limitNorthLatDeg": 3,
            "limitUpElevation": 350, "transferRecommendation": null } ]
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    var limits = oracleApiProvider.searchTransferLimits("FDC", "B", false, "C", "M", 49);

    Assertions.assertEquals(1, limits.size());
    Assertions.assertEquals(2L, limits.get(0).transferLimitSkey());
    Assertions.assertEquals(3, limits.get(0).limitNorthLatDeg());
    Assertions.assertEquals(350, limits.get(0).limitUpElevation());
  }

  @Test
  @DisplayName("getSuperiorProvenance returns the provenance")
  void getSuperiorProvenance_shouldReturnProvenance() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    mockRestServiceServer
        .expect(requestTo("/null/api/superior-provenances/7"))
        .andRespond(
            withSuccess(
                "{ \"provenanceId\": 7, \"vegetationCode\": \"FDC\","
                    + " \"provenanceDescription\": \"Fraser Valley\" }",
                MediaType.APPLICATION_JSON));

    Assertions.assertEquals(
        Optional.of(new SuperiorProvenanceDto(7, "FDC", "Fraser Valley")),
        oracleApiProvider.getSuperiorProvenance(7));
  }

  @Test
  @DisplayName("getSuperiorProvenance is empty when oracle-api has no such provenance")
  void getSuperiorProvenance_notFound_shouldBeEmpty() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    mockRestServiceServer
        .expect(requestTo("/null/api/superior-provenances/99"))
        .andRespond(withStatus(HttpStatus.NOT_FOUND));

    Assertions.assertEquals(Optional.empty(), oracleApiProvider.getSuperiorProvenance(99));
  }

  @Test
  @DisplayName("getSuperiorProvenance rethrows other client errors")
  void getSuperiorProvenance_clientError_shouldThrow() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    mockRestServiceServer
        .expect(requestTo("/null/api/superior-provenances/7"))
        .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

    assertThrows(
        ResponseStatusException.class, () -> oracleApiProvider.getSuperiorProvenance(7));
  }

  @Test
  @DisplayName("getSuperiorProvenance maps a server error to a failed dependency")
  void getSuperiorProvenance_serverError_shouldThrowProviderException() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    mockRestServiceServer
        .expect(requestTo("/null/api/superior-provenances/7"))
        .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

    assertThrows(
        OracleApiProviderException.class, () -> oracleApiProvider.getSuperiorProvenance(7));
  }

  @Test
  @DisplayName("getSpzCoastInteriorCode maps a server error to a failed dependency")
  void getSpzCoastInteriorCode_serverError_shouldThrowProviderException() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    mockRestServiceServer
        .expect(requestTo("/null/api/seed-plan-zones/M/coast-interior"))
        .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

    assertThrows(
        OracleApiProviderException.class, () -> oracleApiProvider.getSpzCoastInteriorCode("M"));
  }

  @Test
  @DisplayName("searchTransferLimits sends a missing criterion as empty, which applies no filter")
  void searchTransferLimits_nullCriterion_shouldSendEmpty() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url =
        "/null/api/transfer-limits?vegetationCode=FDC&geneticClassCode=B"
            + "&superiorProvenance=false&coastInteriorCode=I&seedPlanZoneCode="
            + "&latitudeDeg=49&includeNullMatches=true";

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

    Assertions.assertTrue(
        oracleApiProvider.searchTransferLimits("FDC", "B", false, "I", null, 49).isEmpty());
  }

  @Test
  @DisplayName("searchTransferLimits maps a server error to a failed dependency")
  void searchTransferLimits_serverError_shouldThrowProviderException() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    mockRestServiceServer
        .expect(anything())
        .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

    assertThrows(
        OracleApiProviderException.class,
        () -> oracleApiProvider.searchTransferLimits("FDC", "B", false, "C", "M", 49));
  }

  @Test
  @DisplayName("searchTransferLimits rethrows a client error")
  void searchTransferLimits_clientError_shouldThrow() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");

    mockRestServiceServer
        .expect(anything())
        .andRespond(withStatus(HttpStatus.BAD_REQUEST));

    assertThrows(
        ResponseStatusException.class,
        () -> oracleApiProvider.searchTransferLimits("FDC", "B", false, "C", "M", 49));
  }

  @Test
  @DisplayName("getPtGeospatialDataByIdList posts the id list and returns geospatial data")
  void getPtGeospatialDataByIdList_shouldReturnList() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/parent-trees/geospatial-data";
    String json =
        """
        [
          { "parentTreeId": 8512, "latitudeDegree": 49, "latitudeMinute": 16,
            "latitudeSecond": 57, "longitudeDegree": 123, "longitudeMinute": 10,
            "longitudeSecond": 5, "elevation": 128 },
          { "parentTreeId": 8513, "latitudeDegree": 50, "latitudeMinute": 1,
            "latitudeSecond": 2, "longitudeDegree": 124, "longitudeMinute": 3,
            "longitudeSecond": 4, "elevation": 300 }
        ]
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andExpect(method(HttpMethod.POST))
        .andExpect(content().json("[{\"parentTreeId\":8512},{\"parentTreeId\":8513}]"))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    List<GeospatialOracleResDto> result =
        oracleApiProvider.getPtGeospatialDataByIdList(List.of(8512L, 8513L));

    Assertions.assertEquals(2, result.size());
    Assertions.assertEquals(8512L, result.get(0).parentTreeId());
    Assertions.assertEquals(300, result.get(1).elevation());
  }

  @Test
  @DisplayName("getPtGeospatialDataByIdList tolerates a null body")
  void getPtGeospatialDataByIdList_nullBody_shouldReturnNull() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/parent-trees/geospatial-data";

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess("null", MediaType.APPLICATION_JSON));

    Assertions.assertNull(oracleApiProvider.getPtGeospatialDataByIdList(List.of(1L)));
  }

  @Test
  @DisplayName("getPtGeospatialDataByIdList rethrows a client error")
  void getPtGeospatialDataByIdList_clientError_shouldThrow() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/parent-trees/geospatial-data";

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.BAD_REQUEST));

    assertThrows(
        ResponseStatusException.class,
        () -> oracleApiProvider.getPtGeospatialDataByIdList(List.of(1L)));
  }

  @Test
  @DisplayName("getAreaOfUseData returns the area of use for an SPU")
  void getAreaOfUseData_shouldReturnDto() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/area-of-use/spu/7";
    String json =
        """
        { "spzList": [ { "code": "M", "description": "Maritime", "isPrimary": true } ] }
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    Optional<AreaOfUseDto> result = oracleApiProvider.getAreaOfUseData(7);

    Assertions.assertTrue(result.isPresent());
    Assertions.assertEquals(1, result.get().getSpzList().size());
    Assertions.assertEquals("M", result.get().getSpzList().get(0).getCode());
  }

  @Test
  @DisplayName("getAreaOfUseData returns empty on a client error")
  void getAreaOfUseData_clientError_shouldReturnEmpty() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/area-of-use/spu/7";

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.NOT_FOUND));

    Assertions.assertTrue(oracleApiProvider.getAreaOfUseData(7).isEmpty());
  }

  @Test
  @DisplayName("findOrchardById returns the orchard")
  void findOrchardById_shouldReturnOrchard() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/orchards/405";
    String json =
        """
        { "id": "405", "name": "Primary Orchard", "vegetationCode": "FDC", "spuId": 7 }
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    Optional<OrchardDto> result = oracleApiProvider.findOrchardById("405");

    Assertions.assertTrue(result.isPresent());
    Assertions.assertEquals("Primary Orchard", result.get().getName());
    Assertions.assertEquals(7, result.get().getSpuId());
  }

  @Test
  @DisplayName("findOrchardById returns empty on a client error")
  void findOrchardById_clientError_shouldReturnEmpty() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/orchards/999";

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.NOT_FOUND));

    Assertions.assertTrue(oracleApiProvider.findOrchardById("999").isEmpty());
  }

  @Test
  @DisplayName("getAllDistrictOrgUnits treats a null body as an empty list")
  void getAllDistrictOrgUnits_nullBody_shouldReturnEmpty() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/org-unit-districts";

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess("null", MediaType.APPLICATION_JSON));

    Assertions.assertTrue(oracleApiProvider.getAllDistrictOrgUnits().isEmpty());
  }

  @Test
  @DisplayName("getAllValidFundingSources treats a null body as an empty list")
  void getAllValidFundingSources_nullBody_shouldReturnEmpty() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/funding-sources";

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess("null", MediaType.APPLICATION_JSON));

    Assertions.assertTrue(oracleApiProvider.getAllValidFundingSources().isEmpty());
  }

  @Test
  @DisplayName("findOrchardsByVegCode tolerates a null body")
  void findOrchardsByVegCode_nullBody_shouldReturnNull() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("sample-token");
    String url = "/null/api/orchards/vegetation-codes/BV";

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess("null", MediaType.APPLICATION_JSON));

    Assertions.assertNull(oracleApiProvider.findOrchardsByVegCode("BV"));
  }
}
