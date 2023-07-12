package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/** This class contains methods for fetching data from Oracle REST API. */
@Service
@Slf4j
public class OracleApiProvider extends Provider {

  private final LoggedUserService loggedUserService;

  private final RestTemplate restTemplate;

  private final ProvidersConfig providersConfig;

  OracleApiProvider(
      LoggedUserService loggedUserService,
      RestTemplateBuilder templateBuilder,
      ProvidersConfig providersConfig) {
    super(log, "Oracle API");
    this.loggedUserService = loggedUserService;
    this.restTemplate = templateBuilder.build();
    this.providersConfig = providersConfig;
    setBaseUri(this.providersConfig.getOracleApiBaseUri());
    setRestTemplate(restTemplate);
  }

  /**
   * Find all Parent Tree and Genetic Quality to an Orchard.
   *
   * @param orchardId Orchard's identification.
   * @param spuId SPU's identification.
   * @return An {@link Optional} of {@link OrchardSpuDto}
   */
  public Optional<OrchardSpuDto> findOrchardParentTreeGeneticQualityData(
      String orchardId, int spuId) {
    setAuthentication();
    String oracleApiUrl = "/api/orchards/parent-tree-genetic-quality/{orchardId}/{spuId}";

    OrchardSpuDto orchardTreeDto =
        doGetRequestSingleObject(
            OrchardSpuDto.class,
            oracleApiUrl,
            createParamsMap("orchardId", orchardId, "spuId", String.valueOf(spuId)));

    return Optional.ofNullable(orchardTreeDto);
  }

  /**
   * Find all Parent Tree and Genetic Quality to an Orchard.
   *
   * @param vegCode The vegetation code of a seedlot.
   * @param spuList A list of spu object to be used for filtering
   * @return An {@link Optional} of {@link OrchardDto}
   */
  public Optional<List<OrchardDto>> findOrchardsByVegCode(String vegCode) {
    setAuthentication();
    String oracleApiUrl = "/api/orchards/vegetation-code/{vegCode}";

    HttpEntity<Void> requestEntity = getRequestEntity();

    try {
      ResponseEntity<List<OrchardDto>> orchardsResult =
          getRestTemplate()
              .exchange(
                  getFullApiAddress(oracleApiUrl),
                  HttpMethod.GET,
                  requestEntity,
                  new ParameterizedTypeReference<List<OrchardDto>>() {},
                  createParamsMap("vegCode", vegCode));
      log.info("GET orchards by vegCode - Success response!");
      return Optional.ofNullable(orchardsResult.getBody());
    } catch (HttpClientErrorException httpExc) {
      log.info("GET orchards by vegCode - Response code error: {}", httpExc.getStatusCode());
    }

    return Optional.empty();
  }

  private void setAuthentication() {
    String token = this.loggedUserService.getLoggedUserToken();
    setAditionalHeaders(Map.of("Authorization", "Bearer " + token));
  }
}
