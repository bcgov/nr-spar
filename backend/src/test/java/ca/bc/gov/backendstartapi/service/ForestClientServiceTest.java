package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import ca.bc.gov.backendstartapi.provider.ForestClientApiProvider;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

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
}
