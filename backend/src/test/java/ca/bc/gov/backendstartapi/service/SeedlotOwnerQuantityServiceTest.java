package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOwnerQuantity;
import ca.bc.gov.backendstartapi.repository.SeedlotOwnerQuantityRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SeedlotOwnerQuantityServiceTest {

  @Mock SeedlotOwnerQuantityRepository seedlotOwnerQuantityRepository;

  @Mock LoggedUserService loggedUserService;

  @Mock MethodOfPaymentService methodOfPaymentService;

  private SeedlotOwnerQuantityService seedlotOwnerQuantityService;

  private SeedlotFormOwnershipDto createOwner(int location) {
    return new SeedlotFormOwnershipDto(
        "00012797",
        String.format("%02d", location),
        new BigDecimal("100"),
        new BigDecimal("100"),
        new BigDecimal("5"),
        "CLA",
        "ITC");
  }

  private List<SeedlotFormOwnershipDto> createFormDto(int size) {
    if (size <= 1) {
      return List.of(createOwner(1));
    }

    List<SeedlotFormOwnershipDto> ownerDtoList = new ArrayList<>(size);
    for (int i = 0; i < size; i++) {
      ownerDtoList.add(createOwner(i + 1));
    }

    return ownerDtoList;
  }

  @BeforeEach
  void setup() {
    seedlotOwnerQuantityService =
        new SeedlotOwnerQuantityService(
            seedlotOwnerQuantityRepository, loggedUserService, methodOfPaymentService);
  }

  @Test
  @DisplayName("Save Seedlot Owner Quantity first submmit")
  void saveSeedlotFormStep2_firstSubmit_shouldSucceed() {
    when(seedlotOwnerQuantityRepository.findAllBySeedlot_id("54321")).thenReturn(List.of());

    MethodOfPaymentEntity mope = new MethodOfPaymentEntity();
    mope.setMethodOfPaymentCode("CLA");
    when(methodOfPaymentService.getAllValidMethodOfPayments()).thenReturn(List.of(mope));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    Seedlot seedlot = new Seedlot("54321");
    SeedlotOwnerQuantity soq = new SeedlotOwnerQuantity(seedlot, "00012797", "02", mope);
    when(seedlotOwnerQuantityRepository.saveAll(any())).thenReturn(List.of(soq));

    List<SeedlotOwnerQuantity> soqList =
        seedlotOwnerQuantityService.saveSeedlotFormStep2(seedlot, createFormDto(1), false);

    Assertions.assertFalse(soqList.isEmpty());
    Assertions.assertEquals(1, soqList.size());
  }

  @Test
  @DisplayName("Save Seedlot Owner Quantity with one new method")
  void saveSeedlotFormStep2_updateSeedlotAdd_shouldSucceed() {
    ConeCollectionMethodEntity ccme1 = new ConeCollectionMethodEntity();
    ccme1.setConeCollectionMethodCode(1);

    MethodOfPaymentEntity mope = new MethodOfPaymentEntity();
    mope.setMethodOfPaymentCode("CLA");
    when(methodOfPaymentService.getAllValidMethodOfPayments()).thenReturn(List.of(mope));

    Seedlot seedlot = new Seedlot("54321");

    SeedlotOwnerQuantity soq = new SeedlotOwnerQuantity(seedlot, "00012797", "01", mope);
    when(seedlotOwnerQuantityRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(soq));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    SeedlotOwnerQuantity soq2 = new SeedlotOwnerQuantity(seedlot, "00012797", "02", mope);
    when(seedlotOwnerQuantityRepository.saveAll(any())).thenReturn(List.of(soq, soq2));

    List<SeedlotOwnerQuantity> soqList =
        seedlotOwnerQuantityService.saveSeedlotFormStep2(seedlot, createFormDto(2), true);

    Assertions.assertFalse(soqList.isEmpty());
    Assertions.assertEquals(2, soqList.size());
  }

  @Test
  @DisplayName("Save Seedlot Owner Quantity with two already existing")
  void saveSeedlotFormStep2_updateSeedlotEqual_shouldSucceed() {
    ConeCollectionMethodEntity ccme1 = new ConeCollectionMethodEntity();
    ccme1.setConeCollectionMethodCode(1);

    MethodOfPaymentEntity mope = new MethodOfPaymentEntity();
    mope.setMethodOfPaymentCode("CLA");
    when(methodOfPaymentService.getAllValidMethodOfPayments()).thenReturn(List.of(mope));

    Seedlot seedlot = new Seedlot("54321");

    SeedlotOwnerQuantity soq = new SeedlotOwnerQuantity(seedlot, "00012797", "01", mope);
    SeedlotOwnerQuantity soq2 = new SeedlotOwnerQuantity(seedlot, "00012797", "02", mope);
    when(seedlotOwnerQuantityRepository.findAllBySeedlot_id("54321"))
        .thenReturn(List.of(soq, soq2));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotOwnerQuantityRepository.saveAll(any())).thenReturn(List.of(soq, soq2));

    List<SeedlotOwnerQuantity> soqList =
        seedlotOwnerQuantityService.saveSeedlotFormStep2(seedlot, createFormDto(2), true);

    Assertions.assertFalse(soqList.isEmpty());
  }

  @Test
  @DisplayName("Save Seedlot Owner Quantity with one method removed")
  void saveSeedlotFormStep2_updateSeedlotRemove_shouldSucceed() {
    ConeCollectionMethodEntity ccme1 = new ConeCollectionMethodEntity();
    ccme1.setConeCollectionMethodCode(1);

    MethodOfPaymentEntity mope = new MethodOfPaymentEntity();
    mope.setMethodOfPaymentCode("CLA");
    when(methodOfPaymentService.getAllValidMethodOfPayments()).thenReturn(List.of(mope));

    Seedlot seedlot = new Seedlot("54321");

    SeedlotOwnerQuantity soq = new SeedlotOwnerQuantity(seedlot, "00012797", "01", mope);
    SeedlotOwnerQuantity soq2 = new SeedlotOwnerQuantity(seedlot, "00012797", "02", mope);
    when(seedlotOwnerQuantityRepository.findAllBySeedlot_id("54321"))
        .thenReturn(List.of(soq, soq2));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotOwnerQuantityRepository.saveAll(any())).thenReturn(List.of(soq));

    List<SeedlotOwnerQuantity> soqList =
        seedlotOwnerQuantityService.saveSeedlotFormStep2(seedlot, createFormDto(1), true);

    Assertions.assertTrue(soqList.size() == 1);
  }
}
