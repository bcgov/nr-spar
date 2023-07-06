package ca.bc.gov.backendstartapi.service;

import static org.springframework.http.HttpHeaders.ACCEPT;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/** Makes HTTP requests to the Forest Client API server. */
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Slf4j
class ForestClientApiProvider {

  private static final Predicate<String> numberPredicate =
      Pattern.compile("^\\d{8}$").asMatchPredicate();

  private static final Predicate<String> acronymPredicate =
      Pattern.compile("^\\w{1,8}$").asMatchPredicate();

  private final RestTemplate restTemplate;

  @Autowired
  private ForestClientApiProvider(
      @Value("${forest-client-api.address}") String forestClientApiAddress,
      @Value("${forest-client-api.key}") String forestClientApiKey,
      RestTemplateBuilder restTemplateBuilder) {
    this.restTemplate =
        restTemplateBuilder
            .setConnectTimeout(Duration.ofSeconds(5))
            .setReadTimeout(Duration.ofSeconds(5))
            .rootUri(forestClientApiAddress)
            .defaultHeader("X-API-KEY", forestClientApiKey)
            .defaultHeader(ACCEPT, MediaType.APPLICATION_JSON.toString())
            .build();
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
    } else if (acronymPredicate.test(identifier)) {
      return fetchClientByAcronym(identifier);
    }
    throw new IllegalArgumentException(
        """
            The identifier must be either an 8-digit string or an 8-character word string
            (consisting of alphanumeric characters and underscores [_]).""");
  }

  private Optional<ForestClientDto> fetchClientByNumber(String number) {
    log.debug(String.format("Fetching client %s", number));
    var response =
        restTemplate.getForEntity("/clients/findByClientNumber/" + number, ForestClientDto.class);
    return Optional.of(Objects.requireNonNull(response.getBody()));
  }

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
