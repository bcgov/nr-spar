package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.exception.BadConfigurationException;
import ca.bc.gov.backendstartapi.filter.RequestCorrelation;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

/** This class contains methods for fetching data from Oracle REST API. */
@Component
@Qualifier("oracleApi")
public class OracleApiProvider implements Provider {

  private final LoggedUserService loggedUserService;

  private final ProvidersConfig providersConfig;

  private final RestTemplate restTemplate;

  private final String rootUri;

  private static final String PROVIDER = "Oracle API";

  OracleApiProvider(
      LoggedUserService loggedUserService,
      ProvidersConfig providersConfig,
      RestTemplateBuilder templateBuilder) {
    this.loggedUserService = loggedUserService;
    this.providersConfig = providersConfig;
    this.restTemplate = templateBuilder.build();
    this.rootUri = this.providersConfig.getOracleApiBaseUri();
  }

  /**
   * Find all Parent Tree and Genetic Quality to an Orchard.
   *
   * @param orchardId Orchard's identification.
   * @param spuId SPU's identification.
   * @return An {@link Optional} of {@link OrchardSpuDto}
   */
  @Override
  public Optional<OrchardSpuDto> findOrchardParentTreeGeneticQualityData(
      String orchardId, int spuId) {
    String apiUrl = rootUri + "/api/orchards/parent-tree-genetic-quality/{orchardId}/{spuId}";

    SparLog.info("Starting {} request to {}", PROVIDER, apiUrl);

    try {
      HttpHeaders headers = addHttpHeaders();
      if (headers == null) {
        throw new BadConfigurationException();
      }

      Map<String, Object> params =
          createParamsMap("orchardId", orchardId, "spuId", String.valueOf(spuId));
      if (params == null) {
        throw new BadConfigurationException();
      }

      ResponseEntity<OrchardSpuDto> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.valueOf("GET"),
              new HttpEntity<>(headers),
              OrchardSpuDto.class,
              params);

      SparLog.info("Finished {} request - 200 OK!", PROVIDER);
      return Optional.of(response.getBody());
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
    }

    return Optional.empty();
  }

  /**
   * Finds all orchards with the provided vegCode from oracle-api.
   *
   * @param vegCode The vegetation code of a seedlot.
   * @return An {@link List} of {@link OrchardDto}
   */
  @Override
  public List<OrchardDto> findOrchardsByVegCode(String vegCode) {
    String oracleApiUrl = rootUri + "/api/orchards/vegetation-code/{vegCode}";

    SparLog.info("Starting {} - {} request to {}", PROVIDER, "findOrchardsByVegCode", oracleApiUrl);

    try {
      HttpHeaders headers = addHttpHeaders();
      if (headers == null) {
        throw new BadConfigurationException();
      }

      Map<String, Object> params = createParamsMap("vegCode", vegCode);
      if (params == null) {
        throw new BadConfigurationException();
      }

      ResponseEntity<List<OrchardDto>> orchardsResult =
          restTemplate.exchange(
              oracleApiUrl,
              HttpMethod.valueOf("GET"),
              new HttpEntity<>(headers),
              new ParameterizedTypeReference<List<OrchardDto>>() {},
              params);
      SparLog.info("GET orchards by vegCode from oracle - Success response!");
      return orchardsResult.getBody();
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "GET orchards by vegCode from oracle - Response code error: {}", httpExc.getStatusCode());
    }

    return List.of();
  }

  /**
   * Finds all orchards with the provided vegCode from oracle-api.
   *
   * @param vegCode The vegetation code of a seedlot.
   * @return An {@link List} of {@link ParentTreeDto}
   */
  @Override
  public List<SameSpeciesTreeDto> findParentTreesByVegCode(
      String vegCode, Map<String, String> orchardSpuMap) {
    String oracleApiUrl = rootUri + "/api/orchards/parent-trees/vegetation-codes/{vegCode}";

    SparLog.info(
        "Starting {} - {} request to {}", PROVIDER, "findParentTreesByVegCode", oracleApiUrl);

    HttpEntity<Map<String, String>> requestEntity =
        new HttpEntity<>(orchardSpuMap, addHttpHeaders());

    try {
      Map<String, Object> params = createParamsMap("vegCode", vegCode);
      if (params == null) {
        throw new BadConfigurationException();
      }

      ResponseEntity<List<SameSpeciesTreeDto>> parentTreesResult =
          restTemplate.exchange(
              oracleApiUrl,
              HttpMethod.valueOf("POST"),
              requestEntity,
              new ParameterizedTypeReference<List<SameSpeciesTreeDto>>() {},
              params);
      List<SameSpeciesTreeDto> list = parentTreesResult.getBody();
      int size = list == null ? 0 : list.size();
      SparLog.info(
          "POST spu to oracle to get parent trees with vegCode - Success response with size: {}!",
          size);
      return list;
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "POST spu to oracle to get parent trees with vegCode - Response code error: {}, {}",
          httpExc.getStatusCode(),
          httpExc.getMessage());
      throw new ResponseStatusException(httpExc.getStatusCode(), httpExc.getMessage());
    }
  }

  @Override
  public String getAuthorizationHeaderValue() {
    return "Bearer " + this.loggedUserService.getLoggedUserToken();
  }

  @Override
  public String getAuthorizationHeaderKey() {
    return "Authorization";
  }

  @Override
  public HttpHeaders addHttpHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Content-Type", MediaType.APPLICATION_JSON_VALUE);

    String authKey = getAuthorizationHeaderValue();
    if (null == authKey) {
      SparLog.warn("Forest Client authentication key is not valid.");
      authKey = "";
    }

    String authValue = getAuthorizationHeaderKey();
    headers.set(authKey, authValue);

    // For distributed log tracing
    String correlationId = RequestCorrelation.getId();
    headers.set(RequestCorrelation.CORRELATION_ID_HEADER, correlationId);

    return headers;
  }
}
