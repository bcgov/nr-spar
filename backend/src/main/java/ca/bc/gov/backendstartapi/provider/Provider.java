package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.oracle.AreaOfUseDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpuDto;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpHeaders;

/** This interface contains methods for fetching from externals APIs. */
public interface Provider {

  // Forest Client
  default Optional<ForestClientDto> fetchClientByIdentifier(String identifier) {
    return Optional.empty();
  }

  default List<ForestClientLocationDto> fetchLocationsByClientNumber(
      String number, Boolean shouldFetchAll) {
    return List.of();
  }

  default ForestClientLocationDto fetchSingleClientLocation(String number, String locationCode) {
    return null;
  }

  default List<ForestClientDto> fetchClientsByClientName(String clientName) {
    return null;
  }

  // Oracle API
  default Optional<OrchardSpuDto> findOrchardParentTreeGeneticQualityData(
      String orchardId, int spuId) {
    return Optional.empty();
  }

  default List<GeospatialOracleResDto> getPtGeospatialDataByIdList(List<Long> ptIds) {
    return List.of();
  }

  default Optional<AreaOfUseDto> getAreaOfUseData(Integer spuId) {
    return Optional.empty();
  }

  default Optional<OrchardDto> findOrchardById(String orchardId) {
    return Optional.empty();
  }

  default Optional<SpuDto> getSpuById(Integer spuId) {
    return Optional.empty();
  }

  default List<OrchardDto> findOrchardsByVegCode(String vegCode) {
    return List.of();
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
