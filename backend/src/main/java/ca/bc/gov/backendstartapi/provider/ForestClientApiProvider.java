package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.env.Environment;
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
@Component
@Qualifier("forestClientApi")
public class ForestClientApiProvider implements Provider {

  private static final Predicate<String> numberPredicate =
      Pattern.compile("^\\d{8}$").asMatchPredicate();

  private final ProvidersConfig providersConfig;

  private final RestTemplate restTemplate;

  private final String rootUri;

  private static final String PROVIDER = "ForestClient API";

  @Autowired private Environment environment;

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
    SparLog.info("Starting {} request to {}", PROVIDER, apiUrl);

    if (shouldMock()) {
      return Optional.of(mockForestClientDto(number));
    }

    try {
      ResponseEntity<ForestClientDto> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              ForestClientDto.class,
              createParamsMap("number", number));

      SparLog.info(
          "Finished {} request for function {} - 200 OK!", PROVIDER, "fetchClientByNumber");
      return Optional.of(response.getBody());
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
    }

    return Optional.empty();
  }

  private Optional<ForestClientDto> fetchClientByAcronym(String acronym) {
    String apiUrl = String.format("%s/clients/findByAcronym?acronym={acronym}", rootUri);
    SparLog.info("Starting {} request to {}", PROVIDER, apiUrl);

    if (shouldMock()) {
      return Optional.of(mockForestClientDto(acronym));
    }

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
        SparLog.warn("More than one client found for acronym {}", acronym);
      }

      SparLog.info(
          "Finished {} request for function {} - 200 OK!", PROVIDER, "fetchClientByAcronym");
      return dtoList.stream().findFirst();
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
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
    SparLog.info("Starting {} request to {}", PROVIDER, apiUrl);

    if (shouldMock()) {
      return List.of(mockForestClientLocationDto(clientNumber, "99"));
    }

    try {
      ResponseEntity<List<ForestClientLocationDto>> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<List<ForestClientLocationDto>>() {},
              createParamsMap("clientNumber", clientNumber));

      SparLog.info(
          "Finished {} request for function {} - 200 OK!",
          PROVIDER,
          "fetchLocationsByClientNumber");
      return response.getBody();
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
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
      String clientNumber, String locationCode) {
    String apiUrl = String.format("%s/clients/{clientNumber}/locations/{locationCode}", rootUri);
    SparLog.info("Starting {} request to {}", PROVIDER, apiUrl);

    if (shouldMock()) {
      return mockForestClientLocationDto(clientNumber, locationCode);
    }

    try {
      ResponseEntity<ForestClientLocationDto> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.GET,
              new HttpEntity<>(addHttpHeaders()),
              new ParameterizedTypeReference<ForestClientLocationDto>() {},
              createParamsMap("clientNumber", clientNumber, "locationCode", locationCode));

      SparLog.info(
          "Finished {} request for function {} - 200 OK!", PROVIDER, "fetchSingleClientLocation");
      return response.getBody();
    } catch (HttpClientErrorException httpExc) {
      SparLog.error(
          "Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
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

  /**
   * Checks if the response should be mocked. To enable it, register an environment variable called
   * BYPASS_FOREST_CLIENT and give it: Y. Note that is only possible to mock if this is not a prod
   * environment.
   *
   * @return a boolean. True if should mock, false otherwise.
   */
  private boolean shouldMock() {
    if (Arrays.stream(environment.getActiveProfiles())
        .anyMatch(env -> !env.equalsIgnoreCase("prod"))) {
      String byPass = System.getenv("BYPASS_FOREST_CLIENT");
      boolean shouldMockValue = "Y".equals(byPass);
      SparLog.info("Should mock ForestClient API request: {}", shouldMockValue);
      return shouldMockValue;
    }
    return false;
  }

  private ForestClientDto mockForestClientDto(String number) {
    return new ForestClientDto(
        number,
        "name",
        "firstName",
        "legalMiddleName",
        ForestClientStatusEnum.ACT,
        ForestClientTypeEnum.A,
        "acronym");
  }

  private ForestClientLocationDto mockForestClientLocationDto(String number, String location) {
    SparLog.info("Mocking ForestClientLocationDto for dev,testing,VPN purposes.");
    return new ForestClientLocationDto(
        number,
        location,
        "locationName",
        "company",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ForestClientExpiredEnum.N,
        ForestClientExpiredEnum.Y,
        "",
        "");
  }
}
