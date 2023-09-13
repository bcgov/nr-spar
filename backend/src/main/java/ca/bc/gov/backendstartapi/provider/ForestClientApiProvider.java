package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.regex.Pattern;
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
import org.springframework.web.server.ResponseStatusException;

/** Makes HTTP requests to the Forest Client API server. */
@Slf4j
@Component
@Qualifier("forestClientApi")
public class ForestClientApiProvider implements Provider {

  private static final Predicate<String> numberPredicate =
      Pattern.compile("^\\d{8}$").asMatchPredicate();

  private final ProvidersConfig providersConfig;

  private final RestTemplate restTemplate;

  private final String rootUri;

  private static final String PROVIDER = "ForestClient API";

  ForestClientApiProvider(ProvidersConfig providersConfig, RestTemplateBuilder templateBuilder) {
    this.providersConfig = providersConfig;
    this.restTemplate = templateBuilder.build();
    this.rootUri = this.providersConfig.getForestClientBaseUri();
  }

  /**
   * Fetch a ForestClient by its number or its acronym.
   *
   * @param identifier the client number or acronym to search for
   * @return the ForestClient with client number or acronym {@code identifier}, if one exists
   */
  @Override
  public Optional<ForestClientDto> fetchClientByIdentifier(String identifier) {
    if (numberPredicate.test(identifier)) {
      return fetchClientByNumber(identifier);
    }

    return fetchClientByAcronym(identifier);
  }

  private Optional<ForestClientDto> fetchClientByNumber(String number) {
    String apiUrl = String.format("%s/clients/findByClientNumber/{number}", rootUri);
    log.info("Starting {} request to {}", PROVIDER, apiUrl);

    try {
      ResponseEntity<ForestClientDto> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              ForestClientDto.class,
              createParamsMap("number", number));

      log.info("Finished {} request for function {} - 200 OK!", PROVIDER, "fetchClientByNumber");
      return Optional.of(response.getBody());
    } catch (HttpClientErrorException httpExc) {
      log.error("Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
    }

    return Optional.empty();
  }

  private Optional<ForestClientDto> fetchClientByAcronym(String acronym) {
    String apiUrl = String.format("%s/clients/findByAcronym?acronym={acronym}", rootUri);
    log.info("Starting {} request to {}", PROVIDER, apiUrl);

    try {
      ResponseEntity<List<ForestClientDto>> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<List<ForestClientDto>>() {},
              createParamsMap("acronym", acronym));

      List<ForestClientDto> dtoList = response.getBody();
      
      if (dtoList == null) {
        return Optional.empty();
      }

      if (dtoList.size() > 1) {
        log.warn("More than one client found for acronym {}", acronym);
      }

      log.info("Finished {} request for function {} - 200 OK!", PROVIDER, "fetchClientByAcronym");
      return dtoList.stream().findFirst();
    } catch (HttpClientErrorException httpExc) {
      log.error("Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
    }

    return Optional.empty();
  }

  /**
   * Fetch up to the 10 first ForestClient's location by its number.
   *
   * @param clientNumber the ForestClient identifier to fetch their locations
   * @return a list of {@link ForestClientLocationDto} containing the client's locations data
   */
  @Override
  public List<ForestClientLocationDto> fetchLocationsByClientNumber(String clientNumber) {
    String apiUrl = String.format("%s/clients/{clientNumber}/locations", rootUri);
    log.info("Starting {} request to {}", PROVIDER, apiUrl);

    try {
      ResponseEntity<List<ForestClientLocationDto>> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<List<ForestClientLocationDto>>() {},
              createParamsMap("clientNumber", clientNumber));

      log.info(
          "Finished {} request for function {} - 200 OK!",
          PROVIDER,
          "fetchLocationsByClientNumber");
      return response.getBody();
    } catch (HttpClientErrorException httpExc) {
      log.error("Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
    }

    return List.of();
  }

  /**
   * Fetch a single location of a ForestClient its number and location code.
   *
   * @param clientNumber the ForestClient identifier to fetch their location
   * @param locationCode the location code that identifies the location to be fetched
   * @return {@link ForestClientLocationDto} containing the client's location data
   */
  @Override
  public ForestClientLocationDto fetchSingleClientLocation(
      String clientNumber,
      String locationCode) {
    String apiUrl = String.format("%s/clients/{clientNumber}/locations/{locationCode}", rootUri);
    log.info("Starting {} request to {}", PROVIDER, apiUrl);

    try {
      ResponseEntity<ForestClientLocationDto> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<ForestClientLocationDto>() {},
              createParamsMap("clientNumber", clientNumber, "locationCode", locationCode));

      log.info(
          "Finished {} request for function {} - 200 OK!",
          PROVIDER,
          "fetchSingleClientLocation");
      return response.getBody();
    } catch (HttpClientErrorException httpExc) {
      log.error("Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
      throw new ResponseStatusException(httpExc.getStatusCode(), httpExc.getMessage(), httpExc);
    }
  }

  @Override
  public String[] addAuthorizationHeader() {
    String apiKey = this.providersConfig.getForestClientApiKey();
    return new String[] {"X-API-KEY", apiKey};
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
