package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.provider.ForestClientApiProvider;

import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

/** Service to deal with {@link ForestClientDto ForestClients}. */
@Service
@Slf4j
public class ForestClientService {

  private ForestClientApiProvider provider;

  ForestClientService(ForestClientApiProvider provider) {
    this.provider = provider;
  }

  /**
   * Fetch a forest client by its number or its acronym.
   *
   * @param identifier the client number or acronym to search for
   * @return the forest client with client number or acronym {@code identifier}, if one exists
   */
  public Optional<ForestClientDto> fetchClient(String identifier) {
    try {
      return provider.fetchClientByIdentifier(identifier);
    } catch (HttpClientErrorException.NotFound e) {
      log.info(String.format("Client %s not found", identifier), e);
      return Optional.empty();
    }
  }
}
