package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpHeaders;

/** This interface contains methods for fetching from externals APIs. */
public interface Provider {

  // Forest Client
  default Optional<ForestClientDto> fetchClientByIdentifier(String identifier) {
    return Optional.empty();
  }

  // Oracle API
  default Optional<OrchardSpuDto> findOrchardParentTreeGeneticQualityData(
      String orchardId, int spuId) {
    return Optional.empty();
  }

  // Common methods
  String[] addAuthorizationHeader();

  HttpHeaders addHttpHeaders();

  // Default methods
  /**
   * Creates a {@link Map} for all parameters key and values.
   *
   * @param values An array of String with all keys and values. E.g: "Content-Type",
   *     "application/json", "accept", "someting"
   * @return Map containing all key and value parameters.
   */
  default Map<String, String> createParamsMap(String... values) {
    Map<String, String> uriVars = new HashMap<>();
    for (int i = 0; i < values.length; i += 2) {
      uriVars.put(values[i], values[i + 1]);
    }
    return uriVars;
  }
}
