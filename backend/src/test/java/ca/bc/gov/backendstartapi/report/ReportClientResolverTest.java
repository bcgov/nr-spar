package ca.bc.gov.backendstartapi.report;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import ca.bc.gov.backendstartapi.service.ForestClientService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.client.HttpClientErrorException;

@ExtendWith(SpringExtension.class)
class ReportClientResolverTest {

  @Mock private ForestClientService forestClientService;

  private ReportClientResolver resolver;

  @BeforeEach
  void setup() {
    resolver = new ReportClientResolver(forestClientService);
  }

  @Test
  @DisplayName("blank client numbers skip the Forest Client API")
  void resolve_blankClient_returnsEmpty() {
    assertThat(resolver.resolve(null, "00")).isEqualTo(ClientDisplay.empty());
    assertThat(resolver.resolve("  ", "00")).isEqualTo(ClientDisplay.empty());
  }

  @Test
  @DisplayName("missing locations still print the client name")
  void resolve_locationNotFound_keepsClientName() {
    ForestClientDto client =
        new ForestClientDto(
            "00012797",
            "ACME FORESTS",
            null,
            null,
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.C,
            "ACME");
    when(forestClientService.fetchClient("00012797")).thenReturn(Optional.of(client));
    when(forestClientService.fetchSingleClientLocation("00012797", "00"))
        .thenThrow(
            HttpClientErrorException.create(
                HttpStatus.NOT_FOUND, "Not Found", HttpHeaders.EMPTY, new byte[0], null));

    ClientDisplay display = resolver.resolve("00012797", "00");

    assertThat(display.acronym()).isEqualTo("ACME");
    assertThat(display.name()).isEqualTo("ACME FORESTS");
    assertThat(display.address()).isNull();
  }

  @Test
  @DisplayName("lookups are memoized and blank address parts are omitted")
  void resolve_memoizesAndFormatsAddress() {
    ForestClientDto client =
        new ForestClientDto(
            "00012797",
            "ACME FORESTS",
            null,
            null,
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.C,
            "ACME");
    ForestClientLocationDto location =
        new ForestClientLocationDto(
            "00012797",
            "00",
            "Office",
            "01382",
            "123 Main St",
            "  ",
            null,
            "VICTORIA",
            "BC",
            "V8W1A1",
            "CANADA",
            null,
            null,
            null,
            null,
            null,
            ForestClientExpiredEnum.N,
            ForestClientExpiredEnum.N,
            null,
            null);
    when(forestClientService.fetchClient("00012797")).thenReturn(Optional.of(client));
    when(forestClientService.fetchSingleClientLocation("00012797", "00")).thenReturn(location);

    ClientDisplay first = resolver.resolve("00012797", "00");
    ClientDisplay second = resolver.resolve("00012797", "00");

    assertThat(first).isSameAs(second);
    assertThat(first.address()).isEqualTo("123 Main St, VICTORIA, BC, V8W1A1");
    verify(forestClientService, times(1)).fetchClient("00012797");
  }

  @Test
  @DisplayName("a blank location code skips the location lookup")
  void resolve_blankLocation_skipsAddressLookup() {
    ForestClientDto client =
        new ForestClientDto(
            "00012797",
            "ACME FORESTS",
            null,
            null,
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.C,
            "ACME");
    when(forestClientService.fetchClient("00012797")).thenReturn(Optional.of(client));

    ClientDisplay display = resolver.resolve("00012797", " ");

    assertThat(display.name()).isEqualTo("ACME FORESTS");
    assertThat(display.address()).isNull();
  }
}
