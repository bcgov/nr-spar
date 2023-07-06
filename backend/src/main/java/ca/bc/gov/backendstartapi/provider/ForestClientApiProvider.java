package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/** Makes HTTP requests to the Forest Client API server. */
@Service
@Slf4j
public class ForestClientApiProvider extends Provider {

  private static final Predicate<String> numberPredicate =
      Pattern.compile("^\\d{8}$").asMatchPredicate();

  private RestTemplate restTemplate;

  @Value("${forest-client-api.address}")
  private static String baseUri;

  @Value("${forest-client-api.key}")
  private String forestClientApiKey;

  @Autowired
  ForestClientApiProvider() {
    this(new RestTemplate());
  }
  
  ForestClientApiProvider(RestTemplate restTemplate) {
    super(log, "ForestClient API");
    setBaseUri(baseUri);
    this.restTemplate = restTemplate;
  }

  /**
   * Fetch a forest client by its number or its acronym.
   *
   * @param identifier the client number or acronym to search for
   * @return the forest client with client number or acronym {@code identifier}, if one exists
   */
  Optional<ForestClientDto> fetchClientByIdentifier(String identifier) {
    if (numberPredicate.test(identifier)) {
      return fetchClientByNumber(identifier);
    }
    
    return fetchClientByAcronym(identifier);
  }

  // OK
  private Optional<ForestClientDto> fetchClientByNumber(String number) {
    String api = "/clients/findByClientNumber/{number}";

    Map<String, String> uriVars = new HashMap<>();
    uriVars.put("number", number);
    
    ForestClientDto clientDto = doGetRequest(ForestClientDto.class, api, uriVars);
    
    return Optional.ofNullable(clientDto);
  }

  // NEXT: keep going from here!
  private Optional<ForestClientDto> fetchClientByAcronym(String acronym) {
    log.debug(String.format("Fetching client %s", acronym));
    var response =
        restTemplate.exchange(
            "/clients/findByAcronym?acronym=" + acronym,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<ForestClientDto>>() {});
    var results = Objects.requireNonNull(response.getBody());
    if (results.isEmpty()) {
      return Optional.empty();
    }
    if (results.size() > 1) {
      log.warn("More than one client found for acronym " + acronym);
    }
    return Optional.of(results.get(0));
  }
}
