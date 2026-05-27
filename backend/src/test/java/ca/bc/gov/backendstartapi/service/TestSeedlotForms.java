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
import java.util.ArrayList;

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

  /**
   * Returns a form with the given primary orchard, pollenContaminationInd, and
   * pollenContaminationPct. All other orchard fields come from {@link #valid()}.
   */
  public static SeedlotFormSubmissionDto withPollenContamination(
      String primaryOrchardId, boolean ind, Integer pct) {
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
            ind,
            pct,
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

  /**
   * Returns a form identical to {@link #valid()} but with the given collection start/end dates.
   * Useful for date-order validation tests.
   */
  public static SeedlotFormSubmissionDto withCollectionDates(LocalDate start, LocalDate end) {
    SeedlotFormSubmissionDto base = valid();
    SeedlotFormCollectionDto orig = base.seedlotFormCollectionDto();
    SeedlotFormCollectionDto replaced =
        new SeedlotFormCollectionDto(
            orig.collectionClientNumber(),
            orig.collectionLocnCode(),
            start,
            end,
            orig.noOfContainers(),
            orig.volPerContainer(),
            orig.clctnVolume(),
            orig.seedlotComment(),
            orig.coneCollectionMethodCodes());
    return new SeedlotFormSubmissionDto(
        replaced,
        base.seedlotFormOwnershipDtoList(),
        base.seedlotFormInterimDto(),
        base.seedlotFormOrchardDto(),
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

  /**
   * Returns a form identical to {@link #valid()} but with the given {@code noOfContainers} value.
   * Useful for C4 non-positive volume validation tests.
   */
  public static SeedlotFormSubmissionDto withCollectionContainers(BigDecimal noOfContainers) {
    SeedlotFormSubmissionDto base = valid();
    SeedlotFormCollectionDto orig = base.seedlotFormCollectionDto();
    SeedlotFormCollectionDto replaced =
        new SeedlotFormCollectionDto(
            orig.collectionClientNumber(),
            orig.collectionLocnCode(),
            orig.collectionStartDate(),
            orig.collectionEndDate(),
            noOfContainers,
            orig.volPerContainer(),
            orig.clctnVolume(),
            orig.seedlotComment(),
            orig.coneCollectionMethodCodes());
    return new SeedlotFormSubmissionDto(
        replaced,
        base.seedlotFormOwnershipDtoList(),
        base.seedlotFormInterimDto(),
        base.seedlotFormOrchardDto(),
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

  /**
   * Returns a form identical to {@link #valid()} but with the ownership list replaced by the given
   * owners. Useful for ownership-step validation tests (OW1-OW5).
   */
  public static SeedlotFormSubmissionDto withOwners(SeedlotFormOwnershipDto... owners) {
    SeedlotFormSubmissionDto base = valid();
    return new SeedlotFormSubmissionDto(
        base.seedlotFormCollectionDto(),
        List.of(owners),
        base.seedlotFormInterimDto(),
        base.seedlotFormOrchardDto(),
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

  /**
   * Builds an owner with reserved/surplus set to 0 and the valid payment/fund codes from
   * {@link #valid()}. Useful for constructing simple ownership scenarios.
   */
  public static SeedlotFormOwnershipDto owner(
      String clientNumber, String locnCode, BigDecimal pctOwned) {
    return new SeedlotFormOwnershipDto(
        clientNumber,
        locnCode,
        pctOwned,
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        "CLA",
        "ITC");
  }

  /**
   * Builds an owner with full control over all percentage values and the valid payment/fund codes
   * from {@link #valid()}.
   */
  public static SeedlotFormOwnershipDto ownerFull(
      String clientNumber,
      String locnCode,
      BigDecimal owned,
      BigDecimal rsrvd,
      BigDecimal srpls) {
    return new SeedlotFormOwnershipDto(
        clientNumber,
        locnCode,
        owned,
        rsrvd,
        srpls,
        "CLA",
        "ITC");
  }

  /**
   * Returns a form identical to {@link #valid()} but with the interim facility code and description
   * overridden. Useful for I2 (OTH description) validation tests.
   */
  public static SeedlotFormSubmissionDto withInterimFacility(
      String intermFacilityCode, String intermOtherFacilityDesc) {
    SeedlotFormSubmissionDto base = valid();
    SeedlotFormInterimDto orig = base.seedlotFormInterimDto();
    SeedlotFormInterimDto replaced =
        new SeedlotFormInterimDto(
            orig.intermStrgClientNumber(),
            orig.intermStrgLocnCode(),
            orig.intermStrgStDate(),
            orig.intermStrgEndDate(),
            intermOtherFacilityDesc,
            intermFacilityCode);
    return new SeedlotFormSubmissionDto(
        base.seedlotFormCollectionDto(),
        base.seedlotFormOwnershipDtoList(),
        replaced,
        base.seedlotFormOrchardDto(),
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

  /**
   * Returns a form identical to {@link #valid()} but with the interim storage start and end dates
   * overridden. Useful for I3 (date order) validation tests.
   */
  public static SeedlotFormSubmissionDto withInterimDates(LocalDate start, LocalDate end) {
    SeedlotFormSubmissionDto base = valid();
    SeedlotFormInterimDto orig = base.seedlotFormInterimDto();
    SeedlotFormInterimDto replaced =
        new SeedlotFormInterimDto(
            orig.intermStrgClientNumber(),
            orig.intermStrgLocnCode(),
            start,
            end,
            orig.intermOtherFacilityDesc(),
            orig.intermFacilityCode());
    return new SeedlotFormSubmissionDto(
        base.seedlotFormCollectionDto(),
        base.seedlotFormOwnershipDtoList(),
        replaced,
        base.seedlotFormOrchardDto(),
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

  /**
   * Returns a form identical to {@link #valid()} but with the interim client/location overridden.
   * Useful for I1 (client/location 404) validation tests.
   */
  public static SeedlotFormSubmissionDto withInterimClient(
      String clientNumber, String locationCode) {
    SeedlotFormSubmissionDto base = valid();
    SeedlotFormInterimDto orig = base.seedlotFormInterimDto();
    SeedlotFormInterimDto replaced =
        new SeedlotFormInterimDto(
            clientNumber,
            locationCode,
            orig.intermStrgStDate(),
            orig.intermStrgEndDate(),
            orig.intermOtherFacilityDesc(),
            orig.intermFacilityCode());
    return new SeedlotFormSubmissionDto(
        base.seedlotFormCollectionDto(),
        base.seedlotFormOwnershipDtoList(),
        replaced,
        base.seedlotFormOrchardDto(),
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

  /**
   * Returns a form identical to {@link #valid()} but with the given cone collection method codes.
   * Useful for cone-code validation tests.
   */
  public static SeedlotFormSubmissionDto withConeCollectionMethodCodes(List<Integer> codes) {
    SeedlotFormSubmissionDto base = valid();
    SeedlotFormCollectionDto orig = base.seedlotFormCollectionDto();
    SeedlotFormCollectionDto replaced =
        new SeedlotFormCollectionDto(
            orig.collectionClientNumber(),
            orig.collectionLocnCode(),
            orig.collectionStartDate(),
            orig.collectionEndDate(),
            orig.noOfContainers(),
            orig.volPerContainer(),
            orig.clctnVolume(),
            orig.seedlotComment(),
            new ArrayList<>(codes));
    return new SeedlotFormSubmissionDto(
        replaced,
        base.seedlotFormOwnershipDtoList(),
        base.seedlotFormInterimDto(),
        base.seedlotFormOrchardDto(),
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
}
