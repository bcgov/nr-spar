package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/** This class contains methods for fetching data from Oracle REST API. */
@Service
@Slf4j
public class OracleApiProvider {

  private LoggedUserService loggedUserService;

  private RestTemplate restTemplate;

  @Autowired
  OracleApiProvider(LoggedUserService loggedUserService) {
    this(loggedUserService, new RestTemplate());
  }

  OracleApiProvider(LoggedUserService loggedUserService, RestTemplate restTemplate) {
    this.loggedUserService = loggedUserService;
    this.restTemplate = restTemplate;
  }

  @Value("${oracle-api.base-url}")
  private String oracleApiBaseUrl;

  private <T> T doGetRequest(Class<T> className, String apiUrl, Map<String, String> uriVars) {
    if (!Objects.isNull(uriVars)) {
      for (Map.Entry<String, String> entry : uriVars.entrySet()) {
        log.info("Oracle API - URI variable {}={}", entry.getKey(), entry.getValue());
      }
    }

    String jwtToken = loggedUserService.getLoggedUserToken();

    HttpHeaders headers = new HttpHeaders();
    headers.set("Content-Type", MediaType.APPLICATION_JSON_VALUE);
    headers.set("Authorization", "Bearer " + jwtToken);

    String fullApiUrl = oracleApiBaseUrl + apiUrl;
    log.info("Oracle API - Sending GET request to: {}", fullApiUrl);

    HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

    ResponseEntity<T> response =
        restTemplate.exchange(fullApiUrl, HttpMethod.GET, requestEntity, className, uriVars);

    if (!response.getStatusCode().equals(HttpStatusCode.valueOf(200))) {
      log.info("Oracle API - Response code error : {}", response.getStatusCode());
      return null;
    }

    log.info("Oracle API - Success response!");
    return response.getBody();
  }

  /**
   * Find all Parent Tree and Genetic Quality to an Orchard.
   *
   * @param orchardId Orchard's identification.
   * @param spuId SPU's identification.
   * @return An {@link Optional} of {@link OrchardParentTreeDto}
   */
  public Optional<OrchardParentTreeDto> findOrchardParentTreeGeneticQualityData(
      String orchardId, int spuId) {
    String oracleApiUrl = "/api/orchards/parent-tree-genetic-quality/{orchardId}/{spuId}";

    Map<String, String> uriVars = new HashMap<>();
    uriVars.put("orchardId", orchardId);
    uriVars.put("spuId", String.valueOf(spuId));

    OrchardParentTreeDto orchardTreeDto =
        doGetRequest(OrchardParentTreeDto.class, oracleApiUrl, uriVars);

    return Optional.ofNullable(orchardTreeDto);
  }
}
