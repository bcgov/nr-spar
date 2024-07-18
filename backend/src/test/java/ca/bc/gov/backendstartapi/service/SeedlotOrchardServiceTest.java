package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.repository.SeedlotOrchardRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SeedlotOrchardServiceTest {

  @Mock SeedlotOrchardRepository seedlotOrchardRepository;

  @Mock LoggedUserService loggedUserService;

  private SeedlotOrchardService seedlotOrchardService;

  private SeedlotFormOrchardDto createFormDto() {

    return new SeedlotFormOrchardDto(
        "405", "406", "F3", "M3", false, true, false, 22, new BigDecimal("45.6"), "true");
  }

  @BeforeEach
  void setup() {
    seedlotOrchardService = new SeedlotOrchardService(seedlotOrchardRepository, loggedUserService);
  }

  @Test
  @DisplayName("Save Seedlot Orchard first submit")
  void saveSeedlotFormStep4_firstSubmit_shouldSucceed() {
    when(seedlotOrchardRepository.findAllBySeedlot_id("54321")).thenReturn(List.of());

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotOrchardRepository.saveAllAndFlush(any())).thenReturn(List.of());

    Seedlot seedlot = new Seedlot("54321");
    SeedlotFormOrchardDto formStep4 = createFormDto();
    seedlotOrchardService.saveSeedlotFormStep4(seedlot, formStep4, false);

    Assertions.assertEquals(
        formStep4.femaleGameticMthdCode(), seedlot.getFemaleGameticContributionMethod());
    Assertions.assertEquals(
        formStep4.maleGameticMthdCode(), seedlot.getMaleGameticContributionMethod());
    Assertions.assertEquals(
        formStep4.controlledCrossInd(), seedlot.getProducedThroughControlledCross());
    Assertions.assertEquals(
        formStep4.biotechProcessesInd(), seedlot.getProducedWithBiotechnologicalProcesses());
    Assertions.assertEquals(
        formStep4.pollenContaminationInd(), seedlot.getPollenContaminationPresentInOrchard());
    Assertions.assertEquals(
        formStep4.pollenContaminationPct(), seedlot.getPollenContaminationPercentage());
    Assertions.assertEquals(
        formStep4.contaminantPollenBv(), seedlot.getPollenContaminantBreedingValue());
    Assertions.assertEquals(
        formStep4.pollenContaminationMthdCode(), seedlot.getPollenContaminationMethodCode());
  }

  @Test
  @DisplayName("Save Seedlot Orchard with one new method")
  void saveSeedlotFormStep4_updateSeedlotAdd_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");

    SeedlotOrchard so = new SeedlotOrchard(seedlot, true, "405");
    when(seedlotOrchardRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(so));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotOrchardRepository.saveAllAndFlush(any())).thenReturn(List.of());

    SeedlotFormOrchardDto formStep4 = createFormDto();
    seedlotOrchardService.saveSeedlotFormStep4(seedlot, formStep4, true);

    Assertions.assertEquals(
        formStep4.femaleGameticMthdCode(), seedlot.getFemaleGameticContributionMethod());
    Assertions.assertEquals(
        formStep4.maleGameticMthdCode(), seedlot.getMaleGameticContributionMethod());
    Assertions.assertEquals(
        formStep4.controlledCrossInd(), seedlot.getProducedThroughControlledCross());
    Assertions.assertEquals(
        formStep4.biotechProcessesInd(), seedlot.getProducedWithBiotechnologicalProcesses());
    Assertions.assertEquals(
        formStep4.pollenContaminationInd(), seedlot.getPollenContaminationPresentInOrchard());
    Assertions.assertEquals(
        formStep4.pollenContaminationPct(), seedlot.getPollenContaminationPercentage());
    Assertions.assertEquals(
        formStep4.contaminantPollenBv(), seedlot.getPollenContaminantBreedingValue());
    Assertions.assertEquals(
        formStep4.pollenContaminationMthdCode(), seedlot.getPollenContaminationMethodCode());
  }

  @Test
  @DisplayName("Save Seedlot Orchard with two already existing")
  void saveSeedlotFormStep4_updateSeedlotEqual_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");

    SeedlotOrchard so = new SeedlotOrchard(seedlot, true, "400");
    when(seedlotOrchardRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(so));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotOrchardRepository.saveAllAndFlush(any())).thenReturn(List.of());

    SeedlotFormOrchardDto formStep4 = createFormDto();
    seedlotOrchardService.saveSeedlotFormStep4(seedlot, formStep4, true);

    Assertions.assertEquals(
        formStep4.femaleGameticMthdCode(), seedlot.getFemaleGameticContributionMethod());
    Assertions.assertEquals(
        formStep4.maleGameticMthdCode(), seedlot.getMaleGameticContributionMethod());
    Assertions.assertEquals(
        formStep4.controlledCrossInd(), seedlot.getProducedThroughControlledCross());
    Assertions.assertEquals(
        formStep4.biotechProcessesInd(), seedlot.getProducedWithBiotechnologicalProcesses());
    Assertions.assertEquals(
        formStep4.pollenContaminationInd(), seedlot.getPollenContaminationPresentInOrchard());
    Assertions.assertEquals(
        formStep4.pollenContaminationPct(), seedlot.getPollenContaminationPercentage());
    Assertions.assertEquals(
        formStep4.contaminantPollenBv(), seedlot.getPollenContaminantBreedingValue());
    Assertions.assertEquals(
        formStep4.pollenContaminationMthdCode(), seedlot.getPollenContaminationMethodCode());
  }

  @Test
  @DisplayName("Save Seedlot Orchard with one method removed")
  void saveSeedlotFormStep4_updateSeedlotRemove_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");

    SeedlotOrchard so = new SeedlotOrchard(seedlot, false, "400");
    when(seedlotOrchardRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(so));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotOrchardRepository.saveAllAndFlush(any())).thenReturn(List.of());

    SeedlotFormOrchardDto formStep4 = createFormDto();
    seedlotOrchardService.saveSeedlotFormStep4(seedlot, formStep4, true);

    Assertions.assertEquals(
        formStep4.femaleGameticMthdCode(), seedlot.getFemaleGameticContributionMethod());
    Assertions.assertEquals(
        formStep4.maleGameticMthdCode(), seedlot.getMaleGameticContributionMethod());
    Assertions.assertEquals(
        formStep4.controlledCrossInd(), seedlot.getProducedThroughControlledCross());
    Assertions.assertEquals(
        formStep4.biotechProcessesInd(), seedlot.getProducedWithBiotechnologicalProcesses());
    Assertions.assertEquals(
        formStep4.pollenContaminationInd(), seedlot.getPollenContaminationPresentInOrchard());
    Assertions.assertEquals(
        formStep4.pollenContaminationPct(), seedlot.getPollenContaminationPercentage());
    Assertions.assertEquals(
        formStep4.contaminantPollenBv(), seedlot.getPollenContaminantBreedingValue());
    Assertions.assertEquals(
        formStep4.pollenContaminationMthdCode(), seedlot.getPollenContaminationMethodCode());
  }

  @Test
  @DisplayName("Get Primary Seedlot Orchard should succeed")
  void getPrimarySeedlotOrchard_shouldSucceed() {
    String seedlotNumber = "54321";
    Seedlot seedlot = new Seedlot(seedlotNumber);

    SeedlotOrchard seedlotOrchard = new SeedlotOrchard(seedlot, true, "555");

    when(seedlotOrchardRepository.findBySeedlot_idAndIsPrimaryTrue(seedlotNumber))
        .thenReturn(Optional.of(seedlotOrchard));

    Optional<SeedlotOrchard> testSeedlotOrchard =
        seedlotOrchardService.getPrimarySeedlotOrchard(seedlotNumber);

    Assertions.assertTrue(testSeedlotOrchard.isPresent());

    Assertions.assertEquals(seedlotOrchard, testSeedlotOrchard.get());
  }

  @Test
  @DisplayName("Get Primary Seedlot Orchard should return empty if not found")
  void getPrimarySeedlotOrchard_ReturnEmpty() {
    String seedlotNumber = "54321";

    when(seedlotOrchardRepository.findBySeedlot_idAndIsPrimaryTrue(seedlotNumber))
        .thenReturn(Optional.empty());

    Optional<SeedlotOrchard> testSeedlotOrchard =
        seedlotOrchardService.getPrimarySeedlotOrchard(seedlotNumber);

    Assertions.assertTrue(testSeedlotOrchard.isEmpty());
  }
}
