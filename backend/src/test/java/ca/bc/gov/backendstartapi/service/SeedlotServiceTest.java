package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SeedlotServiceTest {

  @Mock SeedlotRepository seedlotRepository;

  @Mock SeedlotSourceRepository seedlotSourceRepository;

  @Mock SeedlotStatusRepository seedlotStatusRepository;

  @Mock LoggedUserService loggedUserService;

  private SeedlotService seedlotService;

  @BeforeEach
  void setup() {
    seedlotService =
        new SeedlotService(
            seedlotRepository, seedlotSourceRepository, seedlotStatusRepository, loggedUserService);
  }

  @Test
  @DisplayName("createSeedlotSuccessTest")
  void createSeedlotSuccessTest() {
    when(seedlotRepository.findNextSeedlotNumber(anyInt(), anyInt())).thenReturn(63000);

    EffectiveDateRange dateRange = new EffectiveDateRange(LocalDate.now(), LocalDate.now());
    SeedlotStatusEntity statusEntity = new SeedlotStatusEntity("PND", "Pending", dateRange);
    when(seedlotStatusRepository.findById("PND")).thenReturn(Optional.of(statusEntity));

    SeedlotSourceEntity sourceEntity =
        new SeedlotSourceEntity("TPT", "Tested Parent Trees", dateRange);
    when(seedlotSourceRepository.findById("TPT")).thenReturn(Optional.of(sourceEntity));

    Seedlot seedlot = new Seedlot("63000");
    when(seedlotRepository.save(seedlot)).thenReturn(seedlot);

    when(loggedUserService.getLoggedUserIdirOrBceId()).thenReturn("IDIR");

    SeedlotCreateDto createDto =
        new SeedlotCreateDto(
            "00012797", "01", "user.lastname@domain.com", "FDI", "TPT", true, true);

    SeedlotCreateResponseDto response = seedlotService.createSeedlot(createDto);

    Assertions.assertNotNull(response);
  }
}
