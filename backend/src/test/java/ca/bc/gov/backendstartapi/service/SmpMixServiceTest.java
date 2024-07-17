package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SmpMixRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SmpMixServiceTest {

  @Mock SmpMixRepository smpMixRepository;

  @Mock LoggedUserService loggedUserService;

  private SmpMixService smpMixService;

  private SeedlotFormParentTreeSmpDto createFormDto(Integer parentTreeId) {
    ParentTreeGeneticQualityDto ptgqDto =
        new ParentTreeGeneticQualityDto("BV", "GVO", new BigDecimal("18"));
    return new SeedlotFormParentTreeSmpDto(
        "85",
        parentTreeId,
        "87",
        new BigDecimal("1"),
        new BigDecimal("5"),
        6,
        2,
        50,
        new BigDecimal("100"),
        List.of(ptgqDto));
  }

  @BeforeEach
  void setup() {
    smpMixService = new SmpMixService(smpMixRepository, loggedUserService);
  }

  @Test
  @DisplayName("Save SmpMix first submit")
  void saveSeedlotFormStep5_firstSubmit_shouldSucceed() {
    when(smpMixRepository.findAllBySeedlot_id("54321")).thenReturn(List.of());

    AuditInformation audit = new AuditInformation();
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    SeedlotFormParentTreeSmpDto formStep5 = createFormDto(4023);

    Seedlot seedlot = new Seedlot("54321");
    SmpMix smpMix =
        new SmpMix(
            seedlot,
            formStep5.parentTreeId(),
            formStep5.parentTreeNumber(),
            formStep5.amountOfMaterial(),
            formStep5.proportion(),
            audit,
            0);
    when(smpMixRepository.saveAll(any())).thenReturn(List.of(smpMix));

    List<SmpMix> list = smpMixService.saveSeedlotFormStep5(seedlot, List.of(formStep5));

    Assertions.assertFalse(list.isEmpty());
    Assertions.assertEquals(1, list.size());
  }

  @Test
  @DisplayName("Save SmpMix with one new method")
  void saveSeedlotFormStep5_updateSeedlotAdd_shouldSucceed() {
    Seedlot seedlot = new Seedlot("54321");
    SeedlotFormParentTreeSmpDto formStep5 = createFormDto(4023);
    AuditInformation audit = new AuditInformation();
    SmpMix smpMix =
        new SmpMix(
            seedlot,
            formStep5.parentTreeId(),
            formStep5.parentTreeNumber(),
            formStep5.amountOfMaterial(),
            formStep5.proportion(),
            audit,
            0);

    when(smpMixRepository.findAllBySeedlot_id("54321")).thenReturn(List.of(smpMix));
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);
    when(smpMixRepository.saveAll(any())).thenReturn(List.of(smpMix));

    List<SmpMix> list = smpMixService.saveSeedlotFormStep5(seedlot, List.of(createFormDto(4024)));

    Assertions.assertFalse(list.isEmpty());
    Assertions.assertEquals(1, list.size());
  }

  @Test
  @DisplayName("")
  void getAllBySeedlotNumber_simpleFetch_shouldSucceed() {
    SmpMix smpMix =
        new SmpMix(
            new Seedlot("1123"), 1, "11", 1, BigDecimal.ONE, new AuditInformation(), 0);

    when(smpMixRepository.findAllBySeedlot_id("1123")).thenReturn(List.of(smpMix));

    List<SmpMix> list = smpMixService.getAllBySeedlotNumber("1123");

    Assertions.assertFalse(list.isEmpty());
    Assertions.assertEquals(1, list.size());
  }
}
