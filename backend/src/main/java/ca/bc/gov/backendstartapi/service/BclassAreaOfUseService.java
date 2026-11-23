package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.oracle.SpzDto;
import ca.bc.gov.backendstartapi.dto.oracle.TransferLimitDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.GeneticClassNotFoundException;
import ca.bc.gov.backendstartapi.exception.OracleApiProviderException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.util.BclassAreaOfUseCalculator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 * Derives the area of use of a Class B seedlot on submit, ported from the legacy Oracle package
 * {@code SPR_SEEDLOT} procedure {@code get_area_of_use} and, for standard (non-superior
 * provenance) lots, {@code apply_no_superior_prov_limits}.
 *
 * <p>B+ (superior provenance) is retired. A seedlot is B+ when it has a provenance id, which only
 * migrated legacy seedlots have; those are left untouched, since legacy {@code
 * apply_superior_prov_limits} is not ported. Every other B lot is a standard lot.
 */
@Service
@RequiredArgsConstructor
public class BclassAreaOfUseService {

  /** Legacy {@code is_area_of_use_status}: area of use is always replaced from these statuses. */
  private static final Set<String> AREA_OF_USE_STATUSES = Set.of("INC", "PND");

  /** Legacy {@code SPR_GET_SPZ_TYPE} returns interior for anything not listed as coastal. */
  private static final String INTERIOR = "I";

  private static final String CLASS_B = "B";

  private final SeedlotSeedPlanZoneRepository seedlotSeedPlanZoneRepository;

  private final SeedlotGeneticWorthService seedlotGeneticWorthService;

  private final GeneticClassRepository geneticClassRepository;

  private final LoggedUserService loggedUserService;

  @Qualifier("oracleApi")
  private final Provider oracleApiProvider;

  /**
   * Derives the area of use for a Class B seedlot. Call after the collection geography has been
   * applied and before the mean area of use is set.
   *
   * <p>Legacy compares both the new and the previous status against INC/PND. Submit always moves
   * the lot to SUB, so only the previous status can match.
   *
   * @param seedlot the seedlot, with collection fields already applied
   * @param previousStatus the seedlot status before this submit
   */
  public void deriveAreaOfUse(Seedlot seedlot, String previousStatus) {
    if (seedlot.getGeneticClass() == null
        || !CLASS_B.equals(seedlot.getGeneticClass().getGeneticClassCode())) {
      throw new IllegalArgumentException(
          "B-class area of use requested for non-B seedlot " + seedlot.getId());
    }
    boolean replaceAll = AREA_OF_USE_STATUSES.contains(previousStatus);
    SparLog.info(
        "Deriving B-class area of use for seedlot {} (previous status {}, replace all: {})",
        seedlot.getId(),
        previousStatus,
        replaceAll);

    // B+ lots (with a provenance id) only exist as migrated legacy data. Legacy blanks their area
    // of use and recalculates it with apply_superior_prov_limits, which is not ported, so leave the
    // migrated values untouched rather than blank them and derive nothing.
    if (seedlot.getProvenanceId() != null) {
      SparLog.warn(
          "Seedlot {} is superior provenance (B+, provenance {}); area of use left as is, B+"
              + " derivation is not supported",
          seedlot.getId(),
          seedlot.getProvenanceId());
      return;
    }

    List<SeedlotSeedPlanZoneEntity> existingSpzs =
        seedlotSeedPlanZoneRepository.findAllBySeedlot_id(seedlot.getId());
    boolean spzListEmpty = existingSpzs.isEmpty();

    // get_area_of_use (PL/SQL 4608-4625): blank area of use for statuses where it is replaced
    if (replaceAll) {
      BclassAreaOfUseCalculator.blankAreaOfUseGeography(seedlot);
      if (!spzListEmpty) {
        seedlotSeedPlanZoneRepository.deleteAll(existingSpzs);
        // Flush so a re-inserted zone with the same key doesn't collide with the delete.
        seedlotSeedPlanZoneRepository.flush();
        spzListEmpty = true;
      }
    }

    // get_area_of_use (PL/SQL 4628-4641): only BC-source B lots derive limits
    if (!Boolean.TRUE.equals(seedlot.getSourceInBc())) {
      SparLog.info("Seedlot {} is not BC source; area of use not derived", seedlot.getId());
      return;
    }
    // Legacy branches on the superior provenance flag ('Y' / 'N'); SPAR dropped the flag in favour
    // of the provenance id, so a lot without one is a standard ('N') lot.
    applyNoSuperiorProvLimits(seedlot, replaceAll, spzListEmpty, existingSpzs);
  }

  // apply_no_superior_prov_limits (PL/SQL 4102-4261)
  private void applyNoSuperiorProvLimits(
      Seedlot seedlot,
      boolean replaceAll,
      boolean spzListEmpty,
      List<SeedlotSeedPlanZoneEntity> previousSpzs) {
    // B Class with No Superior Provenance has no Genetic Worth (PL/SQL 4136-4154)
    seedlotGeneticWorthService.deleteAllBySeedlot(seedlot);

    // Area of Use SPZ = Collection SPZ (PL/SQL 4156-4159)
    if (spzListEmpty) {
      saveCollectionSpzAsAreaOfUse(seedlot, previousSpzs);
    }

    // Derive Non Superior Provenance limits (PL/SQL 4161-4167). When no limit is found legacy
    // raises e_no_limits_found, whose handler (4257-4259) does nothing: the geography is
    // silently left as it is and the save succeeds.
    Optional<TransferLimitDto> limit = findTransferLimit(seedlot);
    if (limit.isEmpty()) {
      SparLog.warn(
          "No transfer limit found for seedlot {} (species {}, SPZ {}, latitude {});"
              + " area of use geography not derived",
          seedlot.getId(),
          seedlot.getVegetationCode(),
          seedlot.getSeedPlanZoneCode(),
          seedlot.getCollectionLatitudeDeg());
      return;
    }

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(seedlot, limit.get(), replaceAll);
    SparLog.info(
        "B-class area of use derived for seedlot {} from transfer limit {}",
        seedlot.getId(),
        limit.get().transferLimitSkey());
  }

  /**
   * Legacy cursor {@code c_limit} (PL/SQL 4107-4132), first row only. oracle-api returns rows in
   * the same order; the filter below re-applies the legacy WHERE clause exactly, because the
   * endpoint's "include null matches" option also matches a null superior provenance flag, and an
   * omitted criterion means "no filter" rather than legacy's "= NULL never matches".
   */
  private Optional<TransferLimitDto> findTransferLimit(Seedlot seedlot) {
    Integer latitudeDeg = seedlot.getCollectionLatitudeDeg();
    if (latitudeDeg == null) {
      // NULL BETWEEN ... is never true, so legacy finds no limit.
      return Optional.empty();
    }
    String vegCode = seedlot.getVegetationCode();
    String spzCode = seedlot.getSeedPlanZoneCode();
    String coastInteriorCode = getCoastInteriorCode(spzCode);

    return oracleApiProvider
        .searchTransferLimits(vegCode, CLASS_B, false, coastInteriorCode, spzCode, latitudeDeg)
        .stream()
        .filter(row -> row.vegetationCode() == null || row.vegetationCode().equals(vegCode))
        .filter(row -> CLASS_B.equals(row.geneticClassCode()))
        .filter(row -> Boolean.FALSE.equals(row.superiorProvenance()))
        .filter(row -> coastInteriorCode.equals(row.coastInteriorCode()))
        .filter(row -> row.seedPlanZoneCode() == null || row.seedPlanZoneCode().equals(spzCode))
        .filter(
            row ->
                row.siteMinLatDeg() != null
                    && row.siteMaxLatDeg() != null
                    && latitudeDeg >= row.siteMinLatDeg()
                    && latitudeDeg <= row.siteMaxLatDeg())
        .findFirst();
  }

  /**
   * Legacy {@code spr_get_spz_type}: interior unless the zone is listed as coastal. A missing
   * zone is interior without asking oracle-api; a missing answer from oracle-api is an error,
   * since guessing would pick the wrong transfer limits.
   */
  private String getCoastInteriorCode(String spzCode) {
    if (spzCode == null || spzCode.isBlank()) {
      return INTERIOR;
    }
    return oracleApiProvider
        .getSpzCoastInteriorCode(spzCode)
        .orElseThrow(OracleApiProviderException::new);
  }

  /** Saves the collection SPZ as the only area-of-use zone: Class B, not primary. */
  private void saveCollectionSpzAsAreaOfUse(
      Seedlot seedlot, List<SeedlotSeedPlanZoneEntity> previousSpzs) {
    String spzCode = seedlot.getSeedPlanZoneCode();
    if (spzCode == null || spzCode.isBlank()) {
      // set_spz_list(NULL): no area-of-use zone
      return;
    }
    String description = findSpzDescription(seedlot, spzCode, previousSpzs);

    GeneticClassEntity classB =
        geneticClassRepository.findById(CLASS_B).orElseThrow(GeneticClassNotFoundException::new);
    SeedlotSeedPlanZoneEntity spz =
        new SeedlotSeedPlanZoneEntity(seedlot, spzCode, classB, false, description);
    spz.setAuditInformation(loggedUserService.createAuditCurrentUser());
    seedlotSeedPlanZoneRepository.save(spz);
    SparLog.info("Area of use SPZ {} saved for seedlot {}", spzCode, seedlot.getId());
  }

  /**
   * The zone's description from oracle-api's current class B zones for the species. Validation
   * lets a resubmitted lot keep a zone that has since expired, and oracle-api only lists current
   * zones, so fall back to the description stored on the lot's previous row, then to the code.
   */
  private String findSpzDescription(
      Seedlot seedlot, String spzCode, List<SeedlotSeedPlanZoneEntity> previousSpzs) {
    Optional<String> current =
        oracleApiProvider.getSpzListByVegCode(seedlot.getVegetationCode(), CLASS_B).stream()
            .filter(spz -> spzCode.equals(spz.getCode()))
            .map(SpzDto::getDescription)
            .filter(Objects::nonNull)
            .findFirst();
    if (current.isPresent()) {
      return current.get();
    }
    Optional<String> stored =
        previousSpzs.stream()
            .filter(spz -> spzCode.equals(spz.getSpzCode()))
            .map(SeedlotSeedPlanZoneEntity::getSpzDescription)
            .filter(Objects::nonNull)
            .findFirst();
    SparLog.warn(
        "SPZ {} is not a current class B zone for species {} (seedlot {}); using {} description",
        spzCode,
        seedlot.getVegetationCode(),
        seedlot.getId(),
        stored.isPresent() ? "the stored" : "the code as its");
    return stored.orElse(spzCode);
  }
}
