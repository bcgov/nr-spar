package ca.bc.gov.backendstartapi.provider;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.client.RestTemplate;

@ExtendWith(SpringExtension.class)
class OracleApiProviderTest {

  @Mock LoggedUserService loggedUserService;

  @Mock RestTemplate restTemplate;

  private OracleApiProvider oracleApiProvider;

  @BeforeEach
  void setup() {
    oracleApiProvider = new OracleApiProvider(loggedUserService, restTemplate);
  }

  @Test
  @DisplayName("findOrchardParentTreeGeneticQualityDataTest")
  void findOrchardParentTreeGeneticQualityDataTest() {
    String jwtToken = "1f7a4k5e8t9o5k6e9n8h5e2r6e";

    when(loggedUserService.getLoggedUserToken()).thenReturn(jwtToken);

    HttpHeaders headers = new HttpHeaders();
    headers.set("Content-Type", MediaType.APPLICATION_JSON_VALUE);
    headers.set("Authorization", "Bearer " + jwtToken);

    String url = "null/api/orchards/parent-tree-genetic-quality/{orchardId}/{spuId}";
    HttpMethod method = HttpMethod.GET;
    HttpEntity<Void> requestEntity = new HttpEntity<Void>(headers);
    Class<OrchardParentTreeDto> className = OrchardParentTreeDto.class;

    OrchardParentTreeDto orchard = new OrchardParentTreeDto("123", "AT", 11L, new ArrayList<>());

    ResponseEntity<OrchardParentTreeDto> orchardResponse =
        ResponseEntity.status(HttpStatusCode.valueOf(200)).body(orchard);

    String orchardId = "405";
    int spuId = 7;

    Map<String, String> uriVars = new HashMap<>();
    uriVars.put("orchardId", orchardId);
    uriVars.put("spuId", String.valueOf(spuId));

    when(restTemplate.exchange(url, method, requestEntity, className, uriVars))
        .thenReturn(orchardResponse);

    Optional<OrchardParentTreeDto> orchardDto =
        oracleApiProvider.findOrchardParentTreeGeneticQualityData(orchardId, spuId);

    Assertions.assertTrue(orchardDto.isPresent());
  }

  @Test
  @DisplayName("findOrchardParentTreeGeneticQualityDataErrorTest")
  void findOrchardParentTreeGeneticQualityDataErrorTest() {
    when(loggedUserService.getLoggedUserToken()).thenReturn("");

    HttpHeaders headers = new HttpHeaders();
    headers.set("Content-Type", MediaType.APPLICATION_JSON_VALUE);
    headers.set("Authorization", "Bearer ");

    String url = "null/api/orchards/parent-tree-genetic-quality/{orchardId}/{spuId}";
    HttpMethod method = HttpMethod.GET;
    HttpEntity<Void> requestEntity = new HttpEntity<Void>(headers);
    Class<OrchardParentTreeDto> className = OrchardParentTreeDto.class;

    ResponseEntity<OrchardParentTreeDto> orchardResponse =
        ResponseEntity.status(HttpStatusCode.valueOf(401)).build();

    String orchardId = "405";
    int spuId = 7;

    Map<String, String> uriVars = new HashMap<>();
    uriVars.put("orchardId", orchardId);
    uriVars.put("spuId", String.valueOf(spuId));

    when(restTemplate.exchange(url, method, requestEntity, className, uriVars))
        .thenReturn(orchardResponse);

    Optional<OrchardParentTreeDto> orchardDto =
        oracleApiProvider.findOrchardParentTreeGeneticQualityData(orchardId, spuId);

    Assertions.assertFalse(orchardDto.isPresent());
  }
}
