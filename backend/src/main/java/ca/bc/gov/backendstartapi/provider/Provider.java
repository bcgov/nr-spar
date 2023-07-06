package ca.bc.gov.backendstartapi.provider;

import java.util.Map;
import java.util.Objects;

import org.slf4j.Logger;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import lombok.Setter;

@Setter
class Provider {

  private final Logger log;
  private final String providerName;
  private String userJwtToken;
  private String baseUri;
  private RestTemplate restTemplate;

  public Provider(Logger log, String providerName) {
    this.log = log;
    this.providerName = providerName;
  }

  protected <T> T doGetRequest(Class<T> className, String apiUrl, Map<String, String> uriVars) {
    if (!Objects.isNull(uriVars)) {
      for (Map.Entry<String, String> entry : uriVars.entrySet()) {
        log.info(providerName + " - URI variable {}={}", entry.getKey(), entry.getValue());
      }
    }

    HttpHeaders headers = new HttpHeaders();
    headers.set("Content-Type", MediaType.APPLICATION_JSON_VALUE);
    if (!Objects.isNull(userJwtToken)) {
      headers.set("Authorization", "Bearer " + userJwtToken);
    }

    String fullApiUrl = baseUri + apiUrl;
    log.info(providerName + " - Sending GET request to: {}", fullApiUrl);

    HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

    ResponseEntity<T> response =
        restTemplate.exchange(fullApiUrl, HttpMethod.GET, requestEntity, className, uriVars);

    if (!response.getStatusCode().equals(HttpStatusCode.valueOf(200))) {
      log.info(providerName + " - Response code error : {}", response.getStatusCode());
      return null;
    }

    log.info(providerName + " - Success response!");
    return response.getBody();
  }  
}
