package ca.bc.gov.backendstartapi.provider;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.ListItemDto;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
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
            "id": "1003477",
            "value": 34
          }
        ]
        """;

    mockRestServiceServer
        .expect(requestTo(url))
        .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

    List<ListItemDto> parentTreeDtoList = oracleApiProvider.findParentTreesByVegCode(vegCode);

    Assertions.assertFalse(parentTreeDtoList.isEmpty());
    Assertions.assertEquals("1003477", parentTreeDtoList.get(0).id());
    Assertions.assertEquals("34", parentTreeDtoList.get(0).value());
  }

  @Test
  @DisplayName("findParentTreesByVegCodeErrorTest")
  void findParentTreesByVegCodeErrorTest() throws Exception {
    when(loggedUserService.getLoggedUserToken()).thenReturn("");

    String vegCode = "LAMB";
    String url = "/null/api/orchards/parent-trees/vegetation-codes/" + vegCode;

    mockRestServiceServer.expect(requestTo(url)).andRespond(withStatus(HttpStatus.BAD_REQUEST));

    ResponseStatusException httpExc =
        Assertions.assertThrows(
            ResponseStatusException.class,
            () -> {
              oracleApiProvider.findParentTreesByVegCode(vegCode);
            });

    Assertions.assertEquals(HttpStatus.BAD_REQUEST, httpExc.getStatusCode());
  }
}
