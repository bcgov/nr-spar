package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
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

  private SeedlotFormCollectionDto createFormDto(Integer... methods) {
    return new SeedlotFormCollectionDto(
        "00012797",
        "02",
        LocalDateTime.now(),
        LocalDateTime.now(),
        new BigDecimal("2"),
        new BigDecimal("4"),
        new BigDecimal("8"),
        "seedlot comment",
        List.of(methods));
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
    when(seedlotCollectionMethodRepository.findAllBySeedlot_id(any())).thenReturn(List.of());

    ConeCollectionMethodEntity ccme = new ConeCollectionMethodEntity();
    ccme.setConeCollectionMethodCode(1);
    when(coneCollectionMethodService.getAllValidConeCollectionMethods()).thenReturn(List.of(ccme));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotCollectionMethodRepository.saveAllAndFlush(any())).thenReturn(List.of());

    Seedlot seedlot = new Seedlot("54321");
    SeedlotFormCollectionDto formDto = createFormDto(1);
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

  @Test
  @DisplayName("Save Seedlot Collection Method with one new method")
  void saveSeedlotFormStep1_updateSeedlotAdd_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");

    ConeCollectionMethodEntity ccme1 = new ConeCollectionMethodEntity();
    ccme1.setConeCollectionMethodCode(1);

    SeedlotCollectionMethod scm = new SeedlotCollectionMethod(seedlot, ccme1);
    when(seedlotCollectionMethodRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(scm));

    ConeCollectionMethodEntity ccme2 = new ConeCollectionMethodEntity();
    ccme2.setConeCollectionMethodCode(2);

    when(coneCollectionMethodService.getAllValidConeCollectionMethods())
        .thenReturn(List.of(ccme1, ccme2));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotCollectionMethodRepository.saveAllAndFlush(any())).thenReturn(List.of());

    SeedlotFormCollectionDto formDto = createFormDto(1, 2);
    seedCollectionMethodService.saveSeedlotFormStep1(seedlot, formDto);

    Assertions.assertNotNull(seedlot);
    Assertions.assertEquals(formDto.collectionClientNumber(), seedlot.getCollectionClientNumber());
    Assertions.assertEquals(formDto.collectionLocnCode(), seedlot.getCollectionLocationCode());
    Assertions.assertEquals(formDto.collectionStartDate(), seedlot.getCollectionStartDate());
    Assertions.assertEquals(formDto.collectionEndDate(), seedlot.getCollectionEndDate());
    Assertions.assertEquals(formDto.volPerContainer(), seedlot.getContainerVolume());
    Assertions.assertEquals(formDto.clctnVolume(), seedlot.getTotalConeVolume());
    Assertions.assertEquals(formDto.seedlotComment(), seedlot.getComment());

    verify(seedlotCollectionMethodRepository).saveAll(any());
  }

  @Test
  @DisplayName("Save Seedlot Collection Method with two already existing")
  void saveSeedlotFormStep1_updateSeedlotEqual_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");

    ConeCollectionMethodEntity ccme1 = new ConeCollectionMethodEntity();
    ccme1.setConeCollectionMethodCode(1);

    ConeCollectionMethodEntity ccme2 = new ConeCollectionMethodEntity();
    ccme2.setConeCollectionMethodCode(2);

    SeedlotCollectionMethod scm = new SeedlotCollectionMethod(seedlot, ccme1);
    SeedlotCollectionMethod scm2 = new SeedlotCollectionMethod(seedlot, ccme2);
    when(seedlotCollectionMethodRepository.findAllBySeedlot_id("54321"))
        .thenReturn(List.of(scm, scm2));

    when(coneCollectionMethodService.getAllValidConeCollectionMethods())
        .thenReturn(List.of(ccme1, ccme2));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotCollectionMethodRepository.saveAllAndFlush(any())).thenReturn(List.of());

    SeedlotFormCollectionDto formDto = createFormDto(1, 2);
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

  @Test
  @DisplayName("Save Seedlot Collection Method with one method removed")
  void saveSeedlotFormStep1_updateSeedlotRemove_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");

    ConeCollectionMethodEntity ccme1 = new ConeCollectionMethodEntity();
    ccme1.setConeCollectionMethodCode(1);

    ConeCollectionMethodEntity ccme2 = new ConeCollectionMethodEntity();
    ccme2.setConeCollectionMethodCode(2);

    SeedlotCollectionMethod scm = new SeedlotCollectionMethod(seedlot, ccme1);
    SeedlotCollectionMethod scm2 = new SeedlotCollectionMethod(seedlot, ccme2);
    when(seedlotCollectionMethodRepository.findAllBySeedlot_id("54321"))
        .thenReturn(List.of(scm, scm2));

    when(coneCollectionMethodService.getAllValidConeCollectionMethods())
        .thenReturn(List.of(ccme1, ccme2));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotCollectionMethodRepository.saveAllAndFlush(any())).thenReturn(List.of());

    SeedlotFormCollectionDto formDto = createFormDto();
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
}
