package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SeedlotSpeciesDto;
import ca.bc.gov.backendstartapi.provider.Provider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PlantingServiceTest {

  @Mock private Provider oracleApiProvider;

  private PlantingService plantingService;

  @BeforeEach
  void setUp() {
    plantingService = new PlantingService(oracleApiProvider);
  }

  @Test
  @DisplayName("getSeedlotAndSpeciesByRequestKey_shouldDelegateToProvider")
  void getSeedlotAndSpeciesByRequestKey_shouldDelegateToProvider() {
    Long requestKey = 500L;
    SeedlotSpeciesDto dto = new SeedlotSpeciesDto(16258L, "PLI");

    when(oracleApiProvider.getSeedlotAndSpeciesByRequestKey(requestKey)).thenReturn(dto);

    SeedlotSpeciesDto result = plantingService.getSeedlotAndSpeciesByRequestKey(requestKey);

    assertEquals(dto, result);
    verify(oracleApiProvider).getSeedlotAndSpeciesByRequestKey(requestKey);
  }
}
