package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.provider.Provider;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

/** Service to deal with {@link ForestClientDto ForestClients}. */
@Service
@Slf4j
public class ForestClientService {

  @Qualifier("forestClientApi")
  private Provider forestClientApiProvider;

  ForestClientService(Provider forestClientApiProvider) {
    this.forestClientApiProvider = forestClientApiProvider;
  }

  /**
   * Fetch a ForestClient by its number or its acronym.
   *
   * @param identifier the client number or acronym to search for
   * @return the ForestClient with client number or acronym {@code identifier}, if one exists
   */
  public Optional<ForestClientDto> fetchClient(String identifier) {
    try {
      return forestClientApiProvider.fetchClientByIdentifier(identifier);
    } catch (HttpClientErrorException.NotFound e) {
      log.info(String.format("Client %s not found", identifier), e);
      return Optional.empty();
    }
  }

  /**
   * Fetch up to the 10 first ForestClient location by its number.
   *
   * @param clientNumber the ForestClient identifier to fetch their locations
   * @return a list of {@link ForestClientLocationDto} containing the client's locations data
   */
  public List<ForestClientLocationDto> fetchClientLocations(String clientNumber) {
    return forestClientApiProvider.fetchLocationsByClientNumber(clientNumber);
  }

  /**
   * Fetch a single location of a ForestClient its number and location code.
   *
   * @param clientNumber the ForestClient identifier to fetch their location
   * @param locationCode the location code that identifies the location to be fetched
   * @return {@link ForestClientLocationDto} containing the client's location data
   */
  public ForestClientLocationDto fetchSingleClientLocation(
      String clientNumber,
      String locationCode) {
    return forestClientApiProvider.fetchSingleClientLocation(clientNumber, locationCode);
  }
}
