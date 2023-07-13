package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
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

/** This class contains methods for fetching data from Oracle REST API. */
@Slf4j
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

    log.info("Starting {} request to {}", PROVIDER, apiUrl);

    try {
      ResponseEntity<OrchardSpuDto> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              OrchardSpuDto.class,
              createParamsMap("orchardId", orchardId, "spuId", String.valueOf(spuId)));

      log.info("Finished {} request - 200 OK!", PROVIDER);
      return Optional.of(response.getBody());
    } catch (HttpClientErrorException httpExc) {
      log.info("Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
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
  public Optional<List<OrchardDto>> findOrchardsByVegCode(String vegCode) {
    String oracleApiUrl = String.format("%s/api/orchards/vegetation-code/{vegCode}", rootUri);

    log.info("Starting {} request to {}", PROVIDER, oracleApiUrl);

    try {
      ResponseEntity<List<OrchardDto>> orchardsResult =
          restTemplate.exchange(
              oracleApiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<List<OrchardDto>>() {},
              createParamsMap("vegCode", vegCode));
      log.info("GET orchards by vegCode from oracle - Success response!");
      return Optional.ofNullable(orchardsResult.getBody());
    } catch (HttpClientErrorException httpExc) {
      log.info(
          "GET orchards by vegCode from oracle - Response code error: {}", httpExc.getStatusCode());
    }

    return Optional.empty();
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

    return headers;
  }
}
