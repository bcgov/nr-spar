package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import java.util.ArrayList;
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
import org.springframework.web.util.UriComponentsBuilder;

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
              createParamsMap("acronym", acronym.toUpperCase()));

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
   * Fetch the 10 first ForestClient's location by its number if shouldFetchAll is false, fetch the
   * all matching records if shouldFetchAll is true.
   *
   * @param clientNumber the ForestClient identifier to fetch their locations
   * @param shouldFetchAll specifies if all records should be fetched for the given client number
   * @return a list of {@link ForestClientLocationDto} containing the client's locations data
   */
  @Override
  public List<ForestClientLocationDto> fetchLocationsByClientNumber(
      String clientNumber, Boolean shouldFetchAll) {
    if (shouldMock()) {
      return List.of(mockForestClientLocationDto(clientNumber, "99"));
    }

    int page = 0;
    int size = shouldFetchAll ? 50 : 10;
    int totalFetched = 0;
    int totalCount = Integer.MAX_VALUE;
    List<ForestClientLocationDto> result = new ArrayList<>();

    while (totalFetched < totalCount) {
      try {
        String apiUrl =
            String.format(
                "%s/clients/{clientNumber}/locations?page=%s&size=%s", rootUri, page, size);
        SparLog.info("Starting {} request to {} for page {}", PROVIDER, apiUrl, page);

        ResponseEntity<List<ForestClientLocationDto>> response =
            restTemplate.exchange(
                apiUrl,
                HttpMethod.GET,
                new HttpEntity<>(addHttpHeaders()),
                new ParameterizedTypeReference<List<ForestClientLocationDto>>() {},
                createParamsMap("clientNumber", clientNumber));

        SparLog.info(
            "Finished {} request for function {} for page {} - 200 OK!",
            PROVIDER,
            "fetchLocationsByClientNumber",
            page);

        int responseSize = response.getBody().size();

        if (!shouldFetchAll || responseSize == 0) {
          return response.getBody();
        }

        totalCount = Integer.parseInt(response.getHeaders().get("x-total-count").get(0));

        totalFetched += responseSize;

        page += 1;

        result.addAll(response.getBody());
      } catch (HttpClientErrorException httpExc) {
        SparLog.error(
            "Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
        throw new ResponseStatusException(httpExc.getStatusCode(), httpExc.getMessage());
      }
    }

    SparLog.info("Fetched {} location records for client number {}", result.size(), clientNumber);

    return result;
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

  /**
   * Fetch the entire records of forest clients that matches the param.
   *
   * @param clientName the name of the clients to search for
   * @return a list of {@link ForestClientDto}
   */
  @Override
  public List<ForestClientDto> fetchClientsByClientName(String clientName) {
    if (shouldMock()) {
      return List.of(mockForestClientDto("000012345"));
    }

    int page = 0;
    int size = 50;
    int totalFetched = 0;
    int totalCount = Integer.MAX_VALUE;
    List<ForestClientDto> result = new ArrayList<>();

    while (totalFetched < totalCount) {
      try {
        String uriBuilder =
            UriComponentsBuilder.fromUriString(String.format("%s/clients/findByNames", rootUri))
                .queryParam("page", "{page}")
                .queryParam("size", "{size}")
                .queryParam("clientName", "{clientName}")
                .encode()
                .toUriString();

        SparLog.info("Starting {} request to {}, Page {}", PROVIDER, uriBuilder, page);

        ResponseEntity<List<ForestClientDto>> response =
            restTemplate.exchange(
                uriBuilder,
                HttpMethod.GET,
                new HttpEntity<>(addHttpHeaders()),
                new ParameterizedTypeReference<List<ForestClientDto>>() {},
                createParamsMap(
                    "page",
                    String.valueOf(page),
                    "size",
                    String.valueOf(size),
                    "clientName",
                    clientName));

        SparLog.info(
            "Finished {} request for function {}, Page {} - 200 OK!",
            PROVIDER,
            "fetchClientsByClientName",
            page);

        int responseSize = response.getBody().size();

        // Empty response will not have a x-total-count header so we return the empty array here.
        if (responseSize == 0) {
          return result;
        }

        totalCount = Integer.parseInt(response.getHeaders().get("x-total-count").get(0));

        totalFetched += responseSize;

        page += 1;

        result.addAll(response.getBody());
      } catch (HttpClientErrorException httpExc) {
        SparLog.error(
            "Finished {} request - Response code error: {}", PROVIDER, httpExc.getStatusCode());
        throw new ResponseStatusException(httpExc.getStatusCode(), httpExc.getMessage(), httpExc);
      }
    }

    SparLog.info("Found {} clients with the name of {}", result.size(), clientName);

    return result;
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
    SparLog.info("Mocking ForestClientLocationDto for dev, testing, VPN purposes.");
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
