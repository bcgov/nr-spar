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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Setter
class Provider {

  private final Logger log;
  private final String providerName;
  private String baseUri;
  private RestTemplate restTemplate;
  private Map<String, String> aditionalHeaders;

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
    HttpEntity<Void> requesEntity = getRequestEntity();

    logParams(uriVars);

    try {
      ResponseEntity<T> response =
          restTemplate.exchange(
              getFullApiAddress(apiUrl), HttpMethod.GET, requesEntity, className, uriVars);

      log.info(providerName + " - Success response!");
      return response.getBody();
    } catch (HttpClientErrorException httpExc) {
      log.info(providerName + " - Response code error: {}", httpExc.getStatusCode());
    }

    return null;
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
    if (!Objects.isNull(aditionalHeaders)) {
      for (Map.Entry<String, String> entry : aditionalHeaders.entrySet()) {
        headers.set(entry.getKey(), entry.getValue());
      }
    }

    headers.forEach(
        (key, values) -> {
          String value = values.get(0);
          boolean shouldMask =
              key.toLowerCase().contains("key") || key.toLowerCase().contains("auth");
          if (shouldMask) {
            value = "****";
          }
          log.info(providerName + " - Adding Header -> [{}={}]", key, value);
        });

    return new HttpEntity<>(headers);
  }

  protected void logParams(Map<String, String> uriVars) {
    if (!Objects.isNull(uriVars)) {
      for (Map.Entry<String, String> entry : uriVars.entrySet()) {
        log.info(providerName + " - Adding Param -> [{}={}]", entry.getKey(), entry.getValue());
      }
    }
  }

  protected String getFullApiAddress(String apiUrl) {
    String fullApiUrl = baseUri + apiUrl;
    log.info(providerName + " - Sending GET request to: {}", fullApiUrl);
    return fullApiUrl;
  }

  protected RestTemplate getRestTemplate() {
    return this.restTemplate;
  }
}
