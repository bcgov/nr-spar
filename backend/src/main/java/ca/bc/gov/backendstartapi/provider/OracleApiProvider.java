package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeDto;
import ca.bc.gov.backendstartapi.dto.oracle.AreaOfUseDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpuDto;
import ca.bc.gov.backendstartapi.filter.RequestCorrelation;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.List;
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
   * @return An {@link List} of {@link ParentTreeDto}
   */
  @Override
  public List<OrchardDto> findOrchardsByVegCode(String vegCode) {
    String oracleApiUrl = String.format("%s/api/orchards/vegetation-codes/{vegCode}", rootUri);

    SparLog.info("Starting {} - {} request to {}", PROVIDER, "findOrchardsByVegCode", oracleApiUrl);

    try {
      ResponseEntity<List<OrchardDto>> orchardsResult =
          restTemplate.exchange(
              oracleApiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<List<OrchardDto>>() {},
              createParamsMap("vegCode", vegCode));
      List<OrchardDto> list = orchardsResult.getBody();
      int size = list == null ? 0 : list.size();
      SparLog.info("GET orchards by vegCode from Oracle - Success response with size: {}!", size);
      return list;
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "GET orchards by vegCode from Oracle - Response code error: {}, {}",
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

  /**
   * Finds all orchards with the provided vegCode from oracle-api.
   *
   * @param spuId The seed plan unit id.
   * @return An {@link List} of {@link OrchardDto}
   */
  @Override
  public Optional<AreaOfUseDto> getAreaOfUseData(Integer spuId) {
    String oracleApiUrl = String.format("%s/api/area-of-use/spu/{spuId}", rootUri);

    SparLog.info("Starting {} - {} request to {}", PROVIDER, "getAreaOfUseData", oracleApiUrl);

    try {
      ResponseEntity<AreaOfUseDto> areaOfUseRes =
          restTemplate.exchange(
              oracleApiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<AreaOfUseDto>() {},
              createParamsMap("spuId", spuId.toString()));
      SparLog.info("GET orchards by vegCode from oracle - Success response!");
      return Optional.of(areaOfUseRes.getBody());
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "GET orchards by vegCode from oracle - Response code error: {}", httpExc.getStatusCode());
    }

    return Optional.empty();
  }

  @Override
  public Optional<OrchardDto> findOrchardById(String orchardId) {
    String oracleApiUrl = String.format("%s/api/orchards/{orchardId}", rootUri);

    SparLog.info("Starting {} - {} request to {}", PROVIDER, "findOrchardById", oracleApiUrl);

    try {
      ResponseEntity<OrchardDto> areaOfUseRes =
          restTemplate.exchange(
              oracleApiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<OrchardDto>() {},
              createParamsMap("orchardId", orchardId));
      SparLog.info("GET orchard by id - Success response!");
      return Optional.of(areaOfUseRes.getBody());
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "GET orchards by vegCode from oracle - Response code error: {}", httpExc.getStatusCode());
    }

    return Optional.empty();
  }

  @Override
  public Optional<SpuDto> getSpuById(Integer spuId) {
    String oracleApiUrl = String.format("%s/api/seed-plan-unit/{spuId}", rootUri);

    SparLog.info("Starting {} - {} request to {}", PROVIDER, "getSpuById", oracleApiUrl);

    try {
      ResponseEntity<SpuDto> spuDtoRes =
          restTemplate.exchange(
              oracleApiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<SpuDto>() {},
              createParamsMap("spuId", spuId.toString()));
      SparLog.info("GET SPU by id - Success response!");
      return Optional.of(spuDtoRes.getBody());
    } catch (HttpClientErrorException httpExc) {
      SparLog.error("GET SPU by ID from oracle - Response code error: {}", httpExc.getStatusCode());
    }

    return Optional.empty();
  }
}
