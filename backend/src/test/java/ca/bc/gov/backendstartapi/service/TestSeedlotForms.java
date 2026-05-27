package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSmpParentOutsideDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Reusable test fixtures for {@link SeedlotFormSubmissionDto}. Later tasks add static factory
 * mutators (e.g. withInvalidOrchard()) to this class with step-specific variants.
 */
public final class TestSeedlotForms {

  private TestSeedlotForms() {}

  /**
   * Returns a form identical to {@link #valid()} but with the given primary orchard ID and no
   * secondary orchard. Useful for orchard-step validation tests.
   */
  public static SeedlotFormSubmissionDto withOrchardPrimary(String primaryOrchardId) {
    SeedlotFormSubmissionDto base = valid();
    SeedlotFormOrchardDto orig = base.seedlotFormOrchardDto();
    SeedlotFormOrchardDto replaced =
        new SeedlotFormOrchardDto(
            primaryOrchardId,
            null, // no secondary
            orig.femaleGameticMthdCode(),
            orig.maleGameticMthdCode(),
            orig.controlledCrossInd(),
            orig.biotechProcessesInd(),
            orig.pollenContaminationInd(),
            orig.pollenContaminationPct(),
            orig.contaminantPollenBv(),
            orig.pollenContaminationMthdCode());
    return new SeedlotFormSubmissionDto(
        base.seedlotFormCollectionDto(),
        base.seedlotFormOwnershipDtoList(),
        base.seedlotFormInterimDto(),
        replaced,
        base.seedlotFormParentTreeDtoList(),
        base.seedlotFormParentTreeSmpDtoList(),
        base.seedlotFormSmpParentOutsideDto(),
        base.seedlotFormExtractionDto(),
        base.seedlotReviewSeedPlanZones(),
        base.seedlotReviewElevationLatLong(),
        base.seedlotReviewGeneticWorth(),
        base.seedlotReviewGeoInformation(),
        base.applicantAndSeedlotInfo());
  }

  /** Returns a fully-populated, structurally valid {@link SeedlotFormSubmissionDto}. */
  public static SeedlotFormSubmissionDto valid() {

    // Step 1 – Collection
    SeedlotFormCollectionDto collection =
        new SeedlotFormCollectionDto(
            "00012797",
            "00",
            LocalDate.of(2024, 9, 1),
            LocalDate.of(2024, 9, 30),
            new BigDecimal("2"),
            new BigDecimal("4"),
            new BigDecimal("8"),
            "Test collection comment",
            List.of(1, 2));

    // Step 2 – Ownership (single owner, 100 % owned, reserved/surplus = 0)
    SeedlotFormOwnershipDto ownership =
        new SeedlotFormOwnershipDto(
            "00012797",
            "00",
            new BigDecimal("100"),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            "CLA",
            "ITC");

    // Step 3 – Interim storage
    SeedlotFormInterimDto interim =
        new SeedlotFormInterimDto(
            "00012797",
            "00",
            LocalDate.of(2024, 10, 1),
            LocalDate.of(2024, 10, 31),
            null, // no OTH description needed – facility is not OTH
            "OCV");

    // Step 4 – Orchard  (primary 405, secondary 406, gametic F3/M3, no contamination)
    SeedlotFormOrchardDto orchard =
        new SeedlotFormOrchardDto(
            "405",
            "406",
            "F3",
            "M3",
            false,
            true,
            false,
            22,
            new BigDecimal("45.6"),
            "RPM");

    // Step 5 – Parent tree / SMP mix
    ParentTreeGeneticQualityDto genQuality =
        new ParentTreeGeneticQualityDto("BV", "GVO", new BigDecimal("18"), true, false);

    SeedlotFormParentTreeSmpDto parentTree =
        new SeedlotFormParentTreeSmpDto(
            "63000",
            4023,
            "87",
            new BigDecimal("1"),
            new BigDecimal("5"),
            6,
            2,
            50,
            new BigDecimal("100"),
            List.of(genQuality));

    SeedlotFormParentTreeSmpDto smpParentTree =
        new SeedlotFormParentTreeSmpDto(
            "63000",
            4024,
            "88",
            null,
            null,
            null,
            null,
            10,
            new BigDecimal("50"),
            List.of(genQuality));

    // SMP parents outside the orchard count
    SeedlotFormSmpParentOutsideDto smpParentOutside = new SeedlotFormSmpParentOutsideDto(2);

    // Step 6 – Extraction and storage
    SeedlotFormExtractionDto extraction =
        new SeedlotFormExtractionDto(
            "00012797",
            "00",
            LocalDate.of(2024, 11, 1),
            LocalDate.of(2024, 11, 30),
            "00012797",
            "00",
            LocalDate.of(2024, 12, 1),
            LocalDate.of(2024, 12, 31));

    return new SeedlotFormSubmissionDto(
        collection,
        List.of(ownership),
        interim,
        orchard,
        List.of(parentTree),
        List.of(smpParentTree),
        smpParentOutside,
        extraction,
        null, // seedlotReviewSeedPlanZones – review path only
        null, // seedlotReviewElevationLatLong – review path only
        null, // seedlotReviewGeneticWorth – review path only
        null, // seedlotReviewGeoInformation – review path only
        null); // applicantAndSeedlotInfo – review path only
  }
}
