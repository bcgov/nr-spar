package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/** This class contains methods for fetching data from Oracle REST API. */
@Component
@Slf4j
public class OracleApiProvider extends Provider {

  private LoggedUserService loggedUserService;

  @Autowired
  OracleApiProvider(LoggedUserService loggedUserService) {
    this(loggedUserService, new RestTemplate());
  }

  OracleApiProvider(LoggedUserService loggedUserService, RestTemplate restTemplate) {
    super(log, "Oracle API");
    this.loggedUserService = loggedUserService;
    setRestTemplate(restTemplate);
    setUserJwtToken(this.loggedUserService.getLoggedUserToken());
  }

  @Value("${oracle-api.base-url}")
  private String oracleApiBaseUrl;

  /**
   * Find all Parent Tree and Genetic Quality to an Orchard.
   *
   * @param orchardId Orchard's identification.
   * @param spuId SPU's identification.
   * @return An {@link Optional} of {@link OrchardSpuDto}
   */
  public Optional<OrchardSpuDto> findOrchardParentTreeGeneticQualityData(
      String orchardId, int spuId) {
    String oracleApiUrl = "/api/orchards/parent-tree-genetic-quality/{orchardId}/{spuId}";

    OrchardSpuDto orchardTreeDto =
        doGetRequestSingleObject(
            OrchardSpuDto.class,
            oracleApiUrl,
            createParamsMap("orchardId", orchardId, "spuId", String.valueOf(spuId)));

    return Optional.ofNullable(orchardTreeDto);
  }
}
