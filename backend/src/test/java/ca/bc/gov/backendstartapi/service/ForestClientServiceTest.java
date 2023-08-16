package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import ca.bc.gov.backendstartapi.provider.ForestClientApiProvider;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(SpringExtension.class)
class ForestClientServiceTest {

  @Mock private ForestClientApiProvider forestClientApiProvider;

  private ForestClientService forestClientService;

  @BeforeEach
  void setup() {
    forestClientService = new ForestClientService(forestClientApiProvider);
  }

  @Test
  @DisplayName("fetchExistentClientByNumber")
  void fetchClientNotFound() {
    String identifier = "00000001";

    when(forestClientApiProvider.fetchClientByIdentifier(identifier)).thenReturn(Optional.empty());

    Optional<ForestClientDto> optionalDto = forestClientService.fetchClient(identifier);

    Assertions.assertTrue(optionalDto.isEmpty());
  }

  @Test
  @DisplayName("fetchClientSuccess")
  void fetchClientSuccess() {
    String identifier = "00000101";

    ForestClientDto client =
        new ForestClientDto(
            identifier,
            "SMITH",
            "JOHN",
            "JOSEPH",
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.I,
            "JSMITH");

    when(forestClientApiProvider.fetchClientByIdentifier(identifier))
        .thenReturn(Optional.of(client));

    Optional<ForestClientDto> optionalDto = forestClientService.fetchClient(identifier);

    Assertions.assertFalse(optionalDto.isEmpty());

    ForestClientDto clientDto = optionalDto.get();

    Assertions.assertNotNull(clientDto);
    Assertions.assertEquals("00000101", clientDto.clientNumber());
    Assertions.assertEquals("SMITH", clientDto.clientName());
    Assertions.assertEquals("JOHN", clientDto.legalFirstName());
    Assertions.assertEquals("JOSEPH", clientDto.legalMiddleName());
    Assertions.assertEquals(ForestClientStatusEnum.ACT, clientDto.clientStatusCode());
    Assertions.assertEquals(ForestClientTypeEnum.I, clientDto.clientTypeCode());
    Assertions.assertEquals("JSMITH", clientDto.acronym());
  }

  @Test
  @DisplayName("fetchNonExistingLocation")
  void fetchNonExistingLocation() {
    String number = "00000001";

    when(forestClientApiProvider.fetchLocationsByClientNumber(number))
        .thenReturn(Collections.emptyList());

    List<ForestClientLocationDto> locationDto = forestClientService.fetchClientLocations(number);

    Assertions.assertTrue(locationDto.isEmpty());
  }

  @Test
  @DisplayName("fetchClientLocationSuccess")
  void fetchClientLocationSuccess() {
    String number = "00030055";

    ForestClientLocationDto location =
        new ForestClientLocationDto(
            number,
            "00",
            "",
            "30055",
            "MINISTRY OF FORESTS",
            "ARROW FOREST DISTRICT",
            "845 COLUMBIA AVENUE",
            "CASTLEGAR",
            "BC",
            "V1N1H3",
            "CANADA",
            "2503658600",
            "",
            "",
            "",
            "",
            ForestClientExpiredEnum.N,
            ForestClientExpiredEnum.N,
            "",
            "");

    List<ForestClientLocationDto> locations = List.of(location);

    when(forestClientApiProvider.fetchLocationsByClientNumber(number))
        .thenReturn(locations);

    List<ForestClientLocationDto> locationsDto = forestClientService.fetchClientLocations(number);

    Assertions.assertFalse(locationsDto.isEmpty());

    ForestClientLocationDto singleLocationDto = locationsDto.get(0);

    Assertions.assertNotNull(singleLocationDto);
    Assertions.assertEquals("00030055", singleLocationDto.clientNumber());
    Assertions.assertEquals("00", singleLocationDto.locationCode());
    Assertions.assertEquals("30055", singleLocationDto.companyCode());
    Assertions.assertEquals("MINISTRY OF FORESTS", singleLocationDto.address1());
    Assertions.assertEquals("ARROW FOREST DISTRICT", singleLocationDto.address2());
    Assertions.assertEquals("845 COLUMBIA AVENUE", singleLocationDto.address3());
    Assertions.assertEquals("CASTLEGAR", singleLocationDto.city());
    Assertions.assertEquals("BC", singleLocationDto.province());
    Assertions.assertEquals("V1N1H3", singleLocationDto.postalCode());
    Assertions.assertEquals("CANADA", singleLocationDto.country());
    Assertions.assertEquals("2503658600", singleLocationDto.businessPhone());
    Assertions.assertEquals(ForestClientExpiredEnum.N,
                            ForestClientExpiredEnum.valueOf(singleLocationDto.expired().name()));
    Assertions.assertEquals(ForestClientExpiredEnum.N,
                            ForestClientExpiredEnum.valueOf(singleLocationDto.trusted().name()));
  }

  @Test
  @DisplayName("fetchNonExistingSingleLocation")
  void fetchNonExistingSingleLocation() {
    String number = "00000001";
    String locationCode = "123";

    when(forestClientApiProvider.fetchSingleClientLocation(number, locationCode))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

    Assertions.assertThrows(
        ResponseStatusException.class,
        () -> {
          forestClientService.fetchSingleClientLocation(number, locationCode);
        });
  }

  @Test
  @DisplayName("fetchClientSingleLocationSuccess")
  void fetchClientSingleLocationSuccess() {
    String number = "00030055";
    String locationCode = "00";

    ForestClientLocationDto location =
        new ForestClientLocationDto(
            number,
            locationCode,
            "",
            "30055",
            "MINISTRY OF FORESTS",
            "ARROW FOREST DISTRICT",
            "845 COLUMBIA AVENUE",
            "CASTLEGAR",
            "BC",
            "V1N1H3",
            "CANADA",
            "2503658600",
            "",
            "",
            "",
            "",
            ForestClientExpiredEnum.N,
            ForestClientExpiredEnum.N,
            "",
            "");

    when(forestClientApiProvider.fetchSingleClientLocation(number, locationCode))
        .thenReturn(location);

    ForestClientLocationDto locationDto =
        forestClientService.fetchSingleClientLocation(number, locationCode);

    Assertions.assertNotNull(locationDto);

    Assertions.assertEquals("00030055", locationDto.clientNumber());
    Assertions.assertEquals("00", locationDto.locationCode());
    Assertions.assertEquals("30055", locationDto.companyCode());
    Assertions.assertEquals("MINISTRY OF FORESTS", locationDto.address1());
    Assertions.assertEquals("ARROW FOREST DISTRICT", locationDto.address2());
    Assertions.assertEquals("845 COLUMBIA AVENUE", locationDto.address3());
    Assertions.assertEquals("CASTLEGAR", locationDto.city());
    Assertions.assertEquals("BC", locationDto.province());
    Assertions.assertEquals("V1N1H3", locationDto.postalCode());
    Assertions.assertEquals("CANADA", locationDto.country());
    Assertions.assertEquals("2503658600", locationDto.businessPhone());
    Assertions.assertEquals(ForestClientExpiredEnum.N,
                            ForestClientExpiredEnum.valueOf(locationDto.expired().name()));
    Assertions.assertEquals(ForestClientExpiredEnum.N,
                            ForestClientExpiredEnum.valueOf(locationDto.trusted().name()));
  }
}
