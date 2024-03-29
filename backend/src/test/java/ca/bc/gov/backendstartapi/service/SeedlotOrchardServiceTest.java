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
class SeedlotOrchardServiceTest {

  @Mock SeedlotOrchardRepository seedlotOrchardRepository;

  @Mock LoggedUserService loggedUserService;

  private SeedlotOrchardService seedlotOrchardService;

  private SeedlotFormOrchardDto createFormDto(int size) {
    List<String> orchardIdList = new ArrayList<>(size);
    orchardIdList.add("405");
    if (size > 1) {
      size--;
      for (int i = 0; i < size; i++) {
        orchardIdList.add(String.format("%d", (i + 1 + size)));
      }
    }
    return new SeedlotFormOrchardDto(
        orchardIdList, "F3", "M3", false, true, false, 22, new BigDecimal("45.6"), "true");
  }

  @BeforeEach
  void setup() {
    seedlotOrchardService = new SeedlotOrchardService(seedlotOrchardRepository, loggedUserService);
  }

  @Test
  @DisplayName("Save Seedlot Orchard first submmit")
  void saveSeedlotFormStep4_firstSubmit_shouldSucceed() {
    when(seedlotOrchardRepository.findAllBySeedlot_id("54321")).thenReturn(List.of());

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotOrchardRepository.saveAllAndFlush(any())).thenReturn(List.of());

    Seedlot seedlot = new Seedlot("54321");
    SeedlotFormOrchardDto formStep4 = createFormDto(1);
    seedlotOrchardService.saveSeedlotFormStep4(seedlot, formStep4);

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

    SeedlotOrchard so = new SeedlotOrchard(seedlot, "405");
    when(seedlotOrchardRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(so));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotOrchardRepository.saveAllAndFlush(any())).thenReturn(List.of());

    SeedlotFormOrchardDto formStep4 = createFormDto(2);
    seedlotOrchardService.saveSeedlotFormStep4(seedlot, formStep4);

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

    SeedlotOrchard so = new SeedlotOrchard(seedlot, "400");
    when(seedlotOrchardRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(so));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotOrchardRepository.saveAllAndFlush(any())).thenReturn(List.of());

    SeedlotFormOrchardDto formStep4 = createFormDto(2);
    seedlotOrchardService.saveSeedlotFormStep4(seedlot, formStep4);

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

    SeedlotOrchard so = new SeedlotOrchard(seedlot, "400");
    when(seedlotOrchardRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(so));

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    when(seedlotOrchardRepository.saveAllAndFlush(any())).thenReturn(List.of());

    SeedlotFormOrchardDto formStep4 = createFormDto(1);
    seedlotOrchardService.saveSeedlotFormStep4(seedlot, formStep4);

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
}
