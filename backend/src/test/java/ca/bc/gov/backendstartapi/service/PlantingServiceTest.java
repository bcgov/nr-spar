package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SeedlotSpeciesDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PlantingServiceTest {

  @Mock private Provider oracleApiProvider;

  @Mock private SeedlotRepository seedlotRepository;

  private PlantingService plantingService;

  @BeforeEach
  void setUp() {
    plantingService = new PlantingService(oracleApiProvider, seedlotRepository);
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

  @Test
  @DisplayName("getSpeciesBySeedlot_shouldDeriveSpeciesFromSeedlot")
  void getSpeciesBySeedlot_shouldDeriveSpeciesFromSeedlot() {
    Seedlot seedlot = mock(Seedlot.class);
    when(seedlot.getId()).thenReturn("16258");
    when(seedlot.getVegetationCode()).thenReturn("PLI");
    when(seedlotRepository.findById("16258")).thenReturn(Optional.of(seedlot));

    SeedlotSpeciesDto result = plantingService.getSpeciesBySeedlot("16258");

    assertEquals(new SeedlotSpeciesDto(16258L, "PLI"), result);
  }

  @Test
  @DisplayName("getSpeciesBySeedlot_shouldThrowWhenSeedlotDoesNotExist")
  void getSpeciesBySeedlot_shouldThrowWhenSeedlotDoesNotExist() {
    when(seedlotRepository.findById("99999")).thenReturn(Optional.empty());

    assertThrows(
        SeedlotNotFoundException.class, () -> plantingService.getSpeciesBySeedlot("99999"));
  }
}
