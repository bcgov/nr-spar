package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/** Makes HTTP requests to the Forest Client API server. */
@Component
@Slf4j
public class ForestClientApiProvider extends Provider {

  private static final Predicate<String> numberPredicate =
      Pattern.compile("^\\d{8}$").asMatchPredicate();

  private final ProvidersConfig providersConfig;
  private final static String providerName = "ForestClient API";

  @Autowired
  public ForestClientApiProvider(ProvidersConfig providersConfig) {
    this(new RestTemplate(), providersConfig);
  }

  /**
   * Creates a ForestClientApiProvider instance with a RestTemplate.
   *
   * @param restTemplate The RestTemplate instance to be set.
   */
  public ForestClientApiProvider(RestTemplate restTemplate, ProvidersConfig providersConfig) {
    super(log, providerName);
    this.providersConfig = providersConfig;
    setBaseUri(this.providersConfig.getForestClientBaseUri());
    setRestTemplate(restTemplate);
  }

  /**
   * Fetch a forest client by its number or its acronym.
   *
   * @param identifier the client number or acronym to search for
   * @return the forest client with client number or acronym {@code identifier}, if one exists
   */
  public Optional<ForestClientDto> fetchClientByIdentifier(String identifier) {
    if (numberPredicate.test(identifier)) {
      return fetchClientByNumber(identifier);
    }

    return fetchClientByAcronym(identifier);
  }

  private Optional<ForestClientDto> fetchClientByNumber(String number) {
    setAuthentication();
    String api = "/clients/findByClientNumber/{number}";

    ForestClientDto clientDto =
        doGetRequestSingleObject(ForestClientDto.class, api, createParamsMap("number", number));

    return Optional.ofNullable(clientDto);
  }

  private Optional<ForestClientDto> fetchClientByAcronym(String acronym) {
    setAuthentication();
    String apiUrl = "/clients/findByAcronym?acronym={acronym}";

    HttpEntity<Void> requesEntity = getRequestEntity();
    
    Map<String, String> uriVars = createParamsMap("acronym", acronym);
    logParams(uriVars);

    try {
      ResponseEntity<List<ForestClientDto>> response =
        getRestTemplate()
            .exchange(
                getFullApiAddress(apiUrl),
                HttpMethod.GET,
                requesEntity,
                new ParameterizedTypeReference<List<ForestClientDto>>() {},
                uriVars);

      if (response.getBody().size() > 1) {
        log.warn("More than one client found for acronym {}", acronym);
      }
      log.info(providerName + " - Success response!");
      return response.getBody().stream().findAny();

    } catch (HttpClientErrorException httpExc) {
      log.info(providerName + " - Response code error: {}", httpExc.getStatusCode());
    }

    return Optional.empty();
  }

  private void setAuthentication() {
    String apiKey = this.providersConfig.getForestClientApiKey();
    setAditionalHeaders(Map.of("X-API-KEY", apiKey));
  }
}
