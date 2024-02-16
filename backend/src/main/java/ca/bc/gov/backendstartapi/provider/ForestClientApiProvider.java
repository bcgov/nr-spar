package ca.bc.gov.backendstartapi.provider;

import ca.bc.gov.backendstartapi.config.ProvidersConfig;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import ca.bc.gov.backendstartapi.exception.BadConfigurationException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
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
    String apiUrl = rootUri + "/clients/findByClientNumber/{number}";
    SparLog.info("Starting {} request to {}", PROVIDER, apiUrl);

    if (shouldMock()) {
      return Optional.of(mockForestClientDto(number));
    }

    try {
      HttpHeaders headers = addHttpHeaders();
      if (headers == null) {
        throw new BadConfigurationException();
      }

      Map<String, Object> params = createParamsMap("number", number);
      if (params == null) {
        throw new BadConfigurationException();
      }

      ResponseEntity<ForestClientDto> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.valueOf("GET"),
              new HttpEntity<>(headers),
              ForestClientDto.class,
              params);

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
    String apiUrl = rootUri + "/clients/findByAcronym?acronym={acronym}";
    SparLog.info("Starting {} request to {}", PROVIDER, apiUrl);

    if (shouldMock()) {
      return Optional.of(mockForestClientDto(acronym));
    }

    try {
      HttpHeaders headers = addHttpHeaders();
      if (headers == null) {
        throw new BadConfigurationException();
      }

      Map<String, Object> params = createParamsMap("acronym", acronym.toUpperCase());
      if (params == null) {
        throw new BadConfigurationException();
      }

      ResponseEntity<List<ForestClientDto>> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.valueOf("GET"),
              new HttpEntity<>(headers),
              new ParameterizedTypeReference<List<ForestClientDto>>() {},
              params);

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
        String apiUrl = rootUri;
        apiUrl += "/clients/{clientNumber}/locations?page=" + page + "&size=" + size;

        SparLog.info("Starting {} request to {} for page {}", PROVIDER, apiUrl, page);

        HttpHeaders headers = addHttpHeaders();
        if (headers == null) {
          throw new BadConfigurationException();
        }

        Map<String, Object> params = createParamsMap("clientNumber", clientNumber);
        if (params == null) {
          throw new BadConfigurationException();
        }

        ResponseEntity<List<ForestClientLocationDto>> response =
            restTemplate.exchange(
                apiUrl,
                HttpMethod.valueOf("GET"),
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<List<ForestClientLocationDto>>() {},
                params);

        SparLog.info(
            "Finished {} request for function {} for page {} - 200 OK!",
            PROVIDER,
            "fetchLocationsByClientNumber",
            page);

        int responseSize = 0;
        List<ForestClientLocationDto> clientDtos = response.getBody();
        if (clientDtos != null) {
          responseSize = clientDtos.size();
        }

        if (!shouldFetchAll || responseSize == 0) {
          return clientDtos;
        }

        totalCount = 0;
        HttpHeaders responseHeaders = response.getHeaders();
        if (responseHeaders != null) {
          List<String> headerValues = responseHeaders.get("x-total-count");
          if (headerValues != null) {
            totalCount = Integer.parseInt(headerValues.get(0));
          }
        }

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
    String apiUrl = rootUri + "/clients/{clientNumber}/locations/{locationCode}";
    SparLog.info("Starting {} request to {}", PROVIDER, apiUrl);

    if (shouldMock()) {
      return mockForestClientLocationDto(clientNumber, locationCode);
    }

    try {
      HttpHeaders headers = addHttpHeaders();
      if (headers == null) {
        throw new BadConfigurationException();
      }

      Map<String, Object> params =
          createParamsMap("clientNumber", clientNumber, "locationCode", locationCode);
      if (params == null) {
        throw new BadConfigurationException();
      }

      ResponseEntity<ForestClientLocationDto> response =
          restTemplate.exchange(
              apiUrl,
              HttpMethod.valueOf("GET"),
              new HttpEntity<>(headers),
              new ParameterizedTypeReference<ForestClientLocationDto>() {},
              params);

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
            UriComponentsBuilder.fromUriString(rootUri + "%s/clients/findByNames")
                .queryParam("page", "{page}")
                .queryParam("size", "{size}")
                .queryParam("clientName", "{clientName}")
                .encode()
                .toUriString();

        SparLog.info("Starting {} request to {}, Page {}", PROVIDER, uriBuilder, page);

        HttpHeaders headers = addHttpHeaders();
        if (headers == null) {
          throw new BadConfigurationException();
        }

        Map<String, Object> params =
            createParamsMap(
                "page",
                String.valueOf(page),
                "size",
                String.valueOf(size),
                "clientName",
                clientName);
        if (params == null) {
          throw new BadConfigurationException();
        }

        ResponseEntity<List<ForestClientDto>> response =
            restTemplate.exchange(
                uriBuilder,
                HttpMethod.valueOf("GET"),
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<List<ForestClientDto>>() {},
                params);

        SparLog.info(
            "Finished {} request for function {}, Page {} - 200 OK!",
            PROVIDER,
            "fetchClientsByClientName",
            page);

        List<ForestClientDto> body = response.getBody();

        int responseSize = body == null ? 0 : body.size();

        // Empty response will not have a x-total-count header so we return the empty array here.
        if (responseSize == 0) {
          return result;
        }

        totalCount = 0;
        HttpHeaders responseHeaders = response.getHeaders();
        if (responseHeaders != null) {
          List<String> headerValues = responseHeaders.get("x-total-count");
          if (headerValues != null) {
            totalCount = Integer.parseInt(headerValues.get(0));
          }
        }

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
  public String getAuthorizationHeaderValue() {
    return this.providersConfig.getForestClientApiKey();
  }

  @Override
  public String getAuthorizationHeaderKey() {
    return "X-API-KEY";
  }

  @Override
  public HttpHeaders addHttpHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Content-Type", MediaType.APPLICATION_JSON_VALUE);

    String authKey = getAuthorizationHeaderValue();
    if (null == authKey) {
      SparLog.warn("Forest Client authentication key is not valid.");
      authKey = "";
    }

    String authValue = getAuthorizationHeaderKey();
    headers.set(authKey, authValue);

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
