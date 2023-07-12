package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;

/** This class contains methods for fetching data from Oracle REST API. */
@Service
@Slf4j
public class OracleApiProvider extends Provider {

  private final LoggedUserService loggedUserService;

  private final ProvidersConfig providersConfig;

  OracleApiProvider(
      LoggedUserService loggedUserService,
      RestTemplateBuilder templateBuilder,
      ProvidersConfig providersConfig) {
    super(log, "Oracle API", templateBuilder.build());
    this.loggedUserService = loggedUserService;
    this.providersConfig = providersConfig;
    setBaseUri(this.providersConfig.getOracleApiBaseUri());
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

  private void setAuthentication() {
    String token = this.loggedUserService.getLoggedUserToken();
    setAditionalHeaders(Map.of("Authorization", "Bearer " + token));
  }
}
