package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SeedlotCollectionMethodServiceTest {

  @Mock SeedlotCollectionMethodRepository seedlotCollectionMethodRepository;

  @Mock ConeCollectionMethodService coneCollectionMethodService;

  @Mock LoggedUserService loggedUserService;

  private SeedlotCollectionMethodService seedCollectionMethodService;

  private SeedlotFormCollectionDto createFormDto() {
    return new SeedlotFormCollectionDto(
        "00012797",
        "02",
        LocalDateTime.now(),
        LocalDateTime.now(),
        new BigDecimal("2"),
        new BigDecimal("4"),
        new BigDecimal("8"),
        "seedlot comment",
        List.of(1));
  }

  @BeforeEach
  void setup() {
    seedCollectionMethodService =
        new SeedlotCollectionMethodService(
            seedlotCollectionMethodRepository, coneCollectionMethodService, loggedUserService);
  }

  @Test
  @DisplayName("Save Seedlot Collection Method first submmit")
  void saveSeedlotFormStep1_firstSubmit_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");
    SeedlotFormCollectionDto formDto = createFormDto();

    when(seedlotCollectionMethodRepository.findAllBySeedlot_id(any())).thenReturn(List.of());

    ConeCollectionMethodEntity ccme = new ConeCollectionMethodEntity();
    ccme.setConeCollectionMethodCode(1);
    when(coneCollectionMethodService.getAllValidConeCollectionMethods()).thenReturn(List.of(ccme));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotCollectionMethodRepository.saveAllAndFlush(any())).thenReturn(List.of());

    seedCollectionMethodService.saveSeedlotFormStep1(seedlot, formDto);

    Assertions.assertNotNull(seedlot);
    Assertions.assertEquals(formDto.collectionClientNumber(), seedlot.getCollectionClientNumber());
    Assertions.assertEquals(formDto.collectionLocnCode(), seedlot.getCollectionLocationCode());
    Assertions.assertEquals(formDto.collectionStartDate(), seedlot.getCollectionStartDate());
    Assertions.assertEquals(formDto.collectionEndDate(), seedlot.getCollectionEndDate());
    Assertions.assertEquals(formDto.volPerContainer(), seedlot.getContainerVolume());
    Assertions.assertEquals(formDto.clctnVolume(), seedlot.getTotalConeVolume());
    Assertions.assertEquals(formDto.seedlotComment(), seedlot.getComment());
  }

  // update - add one
  void saveSeedlotFormStep1_updateSeedlotAdd_shouldSucceed() {
    //
  }

  // update - equal
  void saveSeedlotFormStep1_updateSeedlotEqual_shouldSucceed() {
    //
  }

  // update - remove one
  void saveSeedlotFormStep1_updateSeedlotRemove_shouldSucceed() {
    //
  }
}
