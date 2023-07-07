package ca.bc.gov.backendstartapi.provider;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import lombok.Setter;
import org.apache.poi.ss.formula.functions.T;
import org.slf4j.Logger;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

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

  /**
   * Do a GET request to fetch a single object.
   *
   * @param className The class for the response.
   * @param apiUrl The API URL address.
   * @param uriVars Parameters and values for the API address (optional). You can call the method
   *     createParamsMap to create those.
   * @return A single object of the given className.
   */
  protected <T> T doGetRequestSingleObject(
      Class<T> className, String apiUrl, Map<String, String> uriVars) {
    logParams(uriVars);

    ResponseEntity<T> response =
        restTemplate.exchange(getFullApiAddress(apiUrl), HttpMethod.GET, getRequestEntity(), className, uriVars);

    logResponseError(response);

    return response.getBody();
  }

  /**
   * Create a HashMap with Strings, containing both key and values.
   *
   * @param values A list of String containing all parameters and values
   * @return A {@link HashMap} with all parameters.
   */
  protected Map<String, String> createParamsMap(String... values) {
    if (values.length % 2 == 1) {
      log.warn("Possible error creating parameters map. List of parameters do not match.");
    }

    Map<String, String> uriVars = new HashMap<>();
    for (int i = 0; i < values.length; i += 2) {
      uriVars.put(values[i], values[i + 1]);
    }
    return uriVars;
  }

  protected HttpEntity<Void> getRequestEntity() {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Content-Type", MediaType.APPLICATION_JSON_VALUE);
    if (!Objects.isNull(userJwtToken)) {
      headers.set("Authorization", "Bearer " + userJwtToken);
    }

    return new HttpEntity<>(headers);
  }

  protected void logParams(Map<String, String> uriVars) {
    if (!Objects.isNull(uriVars)) {
      for (Map.Entry<String, String> entry : uriVars.entrySet()) {
        log.info(providerName + " - URI variable {}={}", entry.getKey(), entry.getValue());
      }
    }
  }

  protected String getFullApiAddress(String apiUrl) {
    String fullApiUrl = baseUri + apiUrl;
    log.info(providerName + " - Sending GET request to: {}", fullApiUrl);
    return fullApiUrl;
  }

  protected void logResponseError(ResponseEntity<?> response) {
    if (!response.getStatusCode().equals(HttpStatusCode.valueOf(200))) {
      log.info(providerName + " - Response code error : {}", response.getStatusCode());
      return;
    }

    log.info(providerName + " - Success response!");
  }

  protected RestTemplate getRestTemplate() {
    return this.restTemplate;
  }
}
