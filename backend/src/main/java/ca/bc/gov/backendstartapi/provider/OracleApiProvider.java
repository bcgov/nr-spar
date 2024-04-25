package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.dto.SeedPlanZoneDto;
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
    String apiUrl =
        String.format("%s/api/orchards/parent-tree-genetic-quality/{orchardId}/{spuId}", rootUri);

    SparLog.info("Starting {} request to {}", PROVIDER, apiUrl);

    try {
      ResponseEntity<OrchardSpuDto> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              OrchardSpuDto.class,
              createParamsMap("orchardId", orchardId, "spuId", String.valueOf(spuId)));

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
    String oracleApiUrl = String.format("%s/api/orchards/vegetation-code/{vegCode}", rootUri);

    SparLog.info("Starting {} - {} request to {}", PROVIDER, "findOrchardsByVegCode", oracleApiUrl);

    try {
      ResponseEntity<List<OrchardDto>> orchardsResult =
          restTemplate.exchange(
              oracleApiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<List<OrchardDto>>() {},
              createParamsMap("vegCode", vegCode));
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
    String oracleApiUrl =
        String.format("%s/api/orchards/parent-trees/vegetation-codes/{vegCode}", rootUri);

    SparLog.info(
        "Starting {} - {} request to {}", PROVIDER, "findParentTreesByVegCode", oracleApiUrl);

    HttpEntity<Map<String, String>> requestEntity =
        new HttpEntity<>(orchardSpuMap, addHttpHeaders());

    try {
      ResponseEntity<List<SameSpeciesTreeDto>> parentTreesResult =
          restTemplate.exchange(
              oracleApiUrl,
              HttpMethod.POST,
              requestEntity,
              new ParameterizedTypeReference<List<SameSpeciesTreeDto>>() {},
              createParamsMap("vegCode", vegCode));
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
  public List<SeedPlanZoneDto> getSpzInformationBySpuIds(List<Integer> spuIds) {
    String oracleApiUrl =
        String.format("%s/api/orchards/spz-information-by-spu-ids/{spuIds}", rootUri);

    SparLog.info(
        "Starting {} - {} request to {}", PROVIDER, "getSpzInformationBySpuIds", oracleApiUrl);

    try {
      StringBuilder sb = new StringBuilder();
      for (Integer id : spuIds) {
        if (!sb.isEmpty()) {
          sb.append(",");
        }
        sb.append(id);
      }

      ResponseEntity<List<SeedPlanZoneDto>> seedPlanZoneResult =
          restTemplate.exchange(
              oracleApiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<List<SeedPlanZoneDto>>() {},
              createParamsMap("spuIds", sb.toString()));
      List<SeedPlanZoneDto> list = seedPlanZoneResult.getBody();
      int size = list == null ? 0 : list.size();
      SparLog.info("GET SPZ from Oracle - Success response with {} record(s)!", size);
      return list;
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "GET SPZ from Oracle - Response code error: {}, {}",
          httpExc.getStatusCode(),
          httpExc.getMessage());
      throw new ResponseStatusException(httpExc.getStatusCode(), httpExc.getMessage());
    }
  }

  @Override
  public List<GeospatialOracleResDto> getPtGeospatialDataByIdList(List<Long> ptIds) {
    String oracleApiUrl = String.format("%s/api/parent-trees/geospatial-data", rootUri);

    SparLog.info(
        "Starting {} - {} request to {}", PROVIDER, "getParentTreeLatLongByIdList", oracleApiUrl);

    try {
      StringBuilder sb = new StringBuilder("[");
      ptIds.forEach(
          (id) -> {
            if (ptIds.indexOf(id) > 0) {
              sb.append(",");
            }
            sb.append("{").append("\"parentTreeId\":").append(id).append("}");
          });
      sb.append("]");
      HttpEntity<String> requestEntity = new HttpEntity<>(sb.toString(), addHttpHeaders());

      ResponseEntity<List<GeospatialOracleResDto>> ptreeResponse =
          restTemplate.exchange(
              oracleApiUrl,
              HttpMethod.POST,
              requestEntity,
              new ParameterizedTypeReference<List<GeospatialOracleResDto>>() {});

      List<GeospatialOracleResDto> list = ptreeResponse.getBody();
      int size = list == null ? 0 : list.size();
      SparLog.info(
          "GET parent tree lat long from Oracle - Success response with {} record(s)!", size);
      return list;
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "GET parent tree lat long from Oracle - Response code error: {}, {}",
          httpExc.getStatusCode(),
          httpExc.getMessage());
      throw new ResponseStatusException(httpExc.getStatusCode(), httpExc.getMessage());
    }
  }

  @Override
  public String[] addAuthorizationHeader() {
    String token = this.loggedUserService.getLoggedUserToken();
    return new String[] {"Authorization", "Bearer " + token};
  }

  @Override
  public HttpHeaders addHttpHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Content-Type", MediaType.APPLICATION_JSON_VALUE);

    String[] authorization = addAuthorizationHeader();
    headers.set(authorization[0], authorization[1]);

    // For distributed log tracing
    String correlationId = RequestCorrelation.getId();
    headers.set(RequestCorrelation.CORRELATION_ID_HEADER, correlationId);

    return headers;
  }
}
