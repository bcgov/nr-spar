package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/** Makes HTTP requests to the Forest Client API server. */
@Component
@Slf4j
public class ForestClientApiProvider extends Provider {

  private static final Predicate<String> numberPredicate =
      Pattern.compile("^\\d{8}$").asMatchPredicate();

  @Value("${forest-client-api.address}")
  private static String baseUri;

  @Value("${forest-client-api.key}")
  private String forestClientApiKey;

  @Autowired
  public ForestClientApiProvider() {
    this(new RestTemplate());
  }

  /**
   * Creates a ForestClientApiProvider instance with a RestTemplate.
   *
   * @param restTemplate The RestTemplate instance to be set.
   */
  public ForestClientApiProvider(RestTemplate restTemplate) {
    super(log, "ForestClient API");
    setBaseUri(baseUri);
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
    String api = "/clients/findByClientNumber/{number}";

    ForestClientDto clientDto =
        doGetRequestSingleObject(ForestClientDto.class, api, createParamsMap("number", number));

    return Optional.ofNullable(clientDto);
  }

  private Optional<ForestClientDto> fetchClientByAcronym(String acronym) {
    String apiUrl = "/clients/findByAcronym?acronym={acronym}";
    Map<String, String> uriVars = createParamsMap("acronym", acronym);

    logParams(uriVars);

    ResponseEntity<List<ForestClientDto>> response =
        getRestTemplate()
            .exchange(
                getFullApiAddress(apiUrl),
                HttpMethod.GET,
                getRequestEntity(),
                new ParameterizedTypeReference<List<ForestClientDto>>() {},
                uriVars);

    logResponseError(response);

    if (response.getBody().size() > 1) {
      log.warn("More than one client found for acronym {}", acronym);
    }

    return response.getBody().stream().findAny();
  }
}
