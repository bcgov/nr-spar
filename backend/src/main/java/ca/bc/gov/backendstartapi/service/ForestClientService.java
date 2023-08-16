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
   * Fetch a forest client by its number or its acronym.
   *
   * @param identifier the client number or acronym to search for
   * @return the forest client with client number or acronym {@code identifier}, if one exists
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
   * Fetch up to the 10 first forest client location by its number.
   *
   * @param number the client number to search the location
   * @return an list of the locations of the forest client
   */
  public List<ForestClientLocationDto> fetchClientLocations(String number) {
    return forestClientApiProvider.fetchLocationsByClientNumber(number);
  }
}
