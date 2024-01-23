package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.dto.ForestClientSearchDto;
import ca.bc.gov.backendstartapi.provider.Provider;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

/** Service to deal with {@link ForestClientDto ForestClients}. */
@Service
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
    SparLog.info("Fetching a Forest Client by its number or acronym {}", identifier);
    try {
      return forestClientApiProvider.fetchClientByIdentifier(identifier);
    } catch (HttpClientErrorException.NotFound e) {
      SparLog.info(String.format("Client %s not found", identifier), e);
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
    SparLog.info("Fetching up to 10 first Forest Clients by its number {}", clientNumber);
    return forestClientApiProvider.fetchLocationsByClientNumber(clientNumber, false);
  }

  /**
   * Fetch a single location of a ForestClient its number and location code.
   *
   * @param clientNumber the ForestClient identifier to fetch their location
   * @param locationCode the location code that identifies the location to be fetched
   * @return {@link ForestClientLocationDto} containing the client's location data
   */
  public ForestClientLocationDto fetchSingleClientLocation(
      String clientNumber, String locationCode) {
    SparLog.info(
        "Fetching a single ForestClient location for clientNumber {} and locationCode {}",
        clientNumber,
        locationCode);
    return forestClientApiProvider.fetchSingleClientLocation(clientNumber, locationCode);
  }

  public List<ForestClientSearchDto> searchClients(String type, String query) {
    if (!type.equals("acronym") && !type.equals("client_number") && !type.equals("full_name")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid search type.");
    }

    if (type.equals("acronym") || type.equals("client_number")) {
      return searchClientsByIdentifier(query);
    }

    return List.of();
  }

  private List<ForestClientSearchDto> searchClientsByIdentifier(String query) {
    // Fetch the Forest client
    Optional<ForestClientDto> optionalForestClient = fetchClient(query);
    if (optionalForestClient.isEmpty()) {
      return List.of();
    }

    ForestClientDto fc = optionalForestClient.get();

    // Fetch location codes with client number
    String clientNumber = fc.clientNumber();

    List<ForestClientLocationDto> fcLocations =
        forestClientApiProvider.fetchLocationsByClientNumber(clientNumber, true);

    List<ForestClientSearchDto> mappedList = new ArrayList<>();

    fcLocations.forEach(
        fcl -> {
          mappedList.add(
              new ForestClientSearchDto(
                  fc.clientNumber(),
                  fc.clientName(),
                  fc.legalFirstName(),
                  fc.legalMiddleName(),
                  fc.clientStatusCode(),
                  fc.clientTypeCode(),
                  fc.acronym(),
                  fcl.locationCode(),
                  fcl.locationName(),
                  fcl.companyCode(),
                  fcl.address1(),
                  fcl.address2(),
                  fcl.address3(),
                  fcl.city(),
                  fcl.province(),
                  fcl.postalCode(),
                  fcl.country(),
                  fcl.businessPhone(),
                  fcl.homePhone(),
                  fcl.cellPhone(),
                  fcl.faxNumber(),
                  fcl.email(),
                  fcl.expired(),
                  fcl.trusted(),
                  fcl.returnedMailDate(),
                  fcl.comment()));
        });

    return mappedList;
  }
}
