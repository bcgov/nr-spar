package ca.bc.gov.backendstartapi.util;

import ca.bc.gov.backendstartapi.dto.oracle.TransferLimitDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;

/**
 * Area-of-use geography for Class B seedlots, ported line for line from the legacy Oracle package
 * {@code SPR_SEEDLOT} (procedures {@code get_area_of_use} and {@code
 * apply_no_superior_prov_limits}).
 *
 * <p>This is a strict port, including Oracle NULL semantics: arithmetic with a NULL operand gives
 * NULL, a comparison with NULL is false, and {@code GREATEST(NULL, 1)} is NULL. Known legacy quirks
 * are kept on purpose and marked "Legacy quirk" below so they can be confirmed with the business.
 */
public final class BclassAreaOfUseCalculator {

  private static final int LAT_MIN_BOUNDARY_DEG = 48;
  private static final int LAT_MAX_BOUNDARY_DEG = 60;
  private static final int LONG_MIN_BOUNDARY_DEG = 114;
  private static final int LONG_MAX_BOUNDARY_DEG = 140;
  private static final int MINUTES_PER_DEGREE = 60;
  private static final int MIN_ELEVATION_METRES = 1;

  private BclassAreaOfUseCalculator() {}

  /**
   * Blanks the area-of-use geography, as legacy {@code get_area_of_use} does (PL/SQL lines
   * 4609-4625) when the current or previous status is INC or PND. The area-of-use SPZ list is
   * blanked by the caller, since it is stored as child rows.
   *
   * @param seedlot the seedlot to update
   */
  public static void blankAreaOfUseGeography(Seedlot seedlot) {
    seedlot.setElevationMin(null);
    seedlot.setElevationMax(null);
    seedlot.setLatitudeDegMin(null);
    seedlot.setLatitudeMinMin(null);
    seedlot.setLatitudeSecMin(null);
    seedlot.setLatitudeDegMax(null);
    seedlot.setLatitudeMinMax(null);
    seedlot.setLatitudeSecMax(null);
    seedlot.setLongitudeDegMin(null);
    seedlot.setLongitudeMinMin(null);
    seedlot.setLongitudeSecMin(null);
    seedlot.setLongitudeDegMax(null);
    seedlot.setLongitudeMinMax(null);
    seedlot.setLongitudeSecMax(null);
  }

  /**
   * Applies a non-superior-provenance transfer limit to the collection geography, as legacy {@code
   * apply_no_superior_prov_limits} does (PL/SQL lines 4169-4255).
   *
   * <p>Each part is only written when {@code replaceAll} is true (legacy {@code
   * is_area_of_use_status}: current or previous status INC/PND) or when that part is empty.
   *
   * @param seedlot the seedlot, with collection geography set
   * @param limit the first matching transfer limit; must not be null (legacy skips the geography
   *     entirely when no limit is found)
   * @param replaceAll whether the current or previous status is INC or PND
   */
  public static void applyNoSuperiorProvLimits(
      Seedlot seedlot, TransferLimitDto limit, boolean replaceAll) {
    applyElevation(seedlot, limit, replaceAll);
    applyLatitudeMin(seedlot, limit, replaceAll);
    applyLatitudeMax(seedlot, limit, replaceAll);
    applyLongitudeMin(seedlot, limit, replaceAll);
    applyLongitudeMax(seedlot, limit, replaceAll);
  }

  // PL/SQL lines 4169-4179
  private static void applyElevation(Seedlot s, TransferLimitDto limit, boolean replaceAll) {
    if (replaceAll || s.getElevationMin() == null) {
      s.setElevationMin(minus(s.getCollectionElevation(), nvl(limit.limitDownElevation())));
    }
    // Legacy quirk: the 1 m floor is applied even when min was not recalculated above.
    // GREATEST(NULL, 1) is NULL in Oracle, so an empty min stays empty.
    if (s.getElevationMin() != null) {
      s.setElevationMin(Math.max(s.getElevationMin(), MIN_ELEVATION_METRES));
    }
    if (replaceAll || s.getElevationMax() == null) {
      s.setElevationMax(plus(s.getCollectionElevation(), nvl(limit.limitUpElevation())));
    }
  }

  // PL/SQL lines 4181-4198
  private static void applyLatitudeMin(Seedlot s, TransferLimitDto limit, boolean replaceAll) {
    if (!(replaceAll || isLatMinEmpty(s))) {
      return;
    }
    // Legacy quirk: only the degrees use NVL(collection, 0), so a missing collection latitude
    // gives a negative min that is then clamped to 48 00 00.
    s.setLatitudeDegMin(nvl(s.getCollectionLatitudeDeg()) - nvl(limit.limitSouthLatDeg()));
    s.setLatitudeMinMin(minus(s.getCollectionLatitudeMin(), nvl(limit.limitSouthLatMin())));
    s.setLatitudeSecMin(s.getCollectionLatitudeSec());
    // Adjust for provincial boundary at 48 00 00
    if (lessThan(s.getLatitudeMinMin(), 0)) {
      s.setLatitudeDegMin(nvl(s.getLatitudeDegMin()) - 1);
      s.setLatitudeMinMin(s.getLatitudeMinMin() + MINUTES_PER_DEGREE);
    }
    if (lessThan(s.getLatitudeDegMin(), LAT_MIN_BOUNDARY_DEG)) {
      s.setLatitudeDegMin(LAT_MIN_BOUNDARY_DEG);
      s.setLatitudeMinMin(0);
      s.setLatitudeSecMin(0);
    }
  }

  // PL/SQL lines 4200-4217
  private static void applyLatitudeMax(Seedlot s, TransferLimitDto limit, boolean replaceAll) {
    if (!(replaceAll || isLatMaxEmpty(s))) {
      return;
    }
    s.setLatitudeDegMax(plus(s.getCollectionLatitudeDeg(), nvl(limit.limitNorthLatDeg())));
    s.setLatitudeMinMax(plus(s.getCollectionLatitudeMin(), nvl(limit.limitNorthLatMin())));
    s.setLatitudeSecMax(s.getCollectionLatitudeSec());
    // Adjust for provincial boundary at 60 00 00
    // Legacy quirk: "> 60" leaves exactly 60 minutes uncarried.
    if (greaterThan(s.getLatitudeMinMax(), MINUTES_PER_DEGREE)) {
      s.setLatitudeDegMax(nvl(s.getLatitudeDegMax()) + 1);
      s.setLatitudeMinMax(nvl(s.getLatitudeMinMax()) - MINUTES_PER_DEGREE);
    }
    // Legacy quirk: only the degrees are checked, so e.g. 60 30 is not clamped to 60 00 00.
    if (greaterThan(s.getLatitudeDegMax(), LAT_MAX_BOUNDARY_DEG)) {
      s.setLatitudeDegMax(LAT_MAX_BOUNDARY_DEG);
      s.setLatitudeMinMax(0);
      s.setLatitudeSecMax(0);
    }
  }

  // PL/SQL lines 4219-4236
  private static void applyLongitudeMin(Seedlot s, TransferLimitDto limit, boolean replaceAll) {
    if (!(replaceAll || isLongMinEmpty(s))) {
      return;
    }
    s.setLongitudeDegMin(minus(s.getCollectionLongitudeDeg(), nvl(limit.limitEastLongDeg())));
    s.setLongitudeMinMin(minus(s.getCollectionLongitudeMin(), nvl(limit.limitEastLongMin())));
    s.setLongitudeSecMin(s.getCollectionLongitudeSec());
    // Adjust for provincial boundary at 114 00 00
    if (lessThan(s.getLongitudeMinMin(), 0)) {
      s.setLongitudeDegMin(nvl(s.getLongitudeDegMin()) - 1);
      s.setLongitudeMinMin(nvl(s.getLongitudeMinMin()) + MINUTES_PER_DEGREE);
    }
    if (lessThan(s.getLongitudeDegMin(), LONG_MIN_BOUNDARY_DEG)) {
      s.setLongitudeDegMin(LONG_MIN_BOUNDARY_DEG);
      s.setLongitudeMinMin(0);
      s.setLongitudeSecMin(0);
    }
  }

  // PL/SQL lines 4238-4255
  private static void applyLongitudeMax(Seedlot s, TransferLimitDto limit, boolean replaceAll) {
    if (!(replaceAll || isLongMaxEmpty(s))) {
      return;
    }
    s.setLongitudeDegMax(plus(s.getCollectionLongitudeDeg(), nvl(limit.limitWestLongDeg())));
    s.setLongitudeMinMax(plus(s.getCollectionLongitudeMin(), nvl(limit.limitWestLongMin())));
    s.setLongitudeSecMax(s.getCollectionLongitudeSec());
    // Adjust for provincial boundary at 140 00 00
    // Legacy quirk: "> 60" leaves exactly 60 minutes uncarried.
    if (greaterThan(s.getLongitudeMinMax(), MINUTES_PER_DEGREE)) {
      s.setLongitudeDegMax(nvl(s.getLongitudeDegMax()) + 1);
      s.setLongitudeMinMax(nvl(s.getLongitudeMinMax()) - MINUTES_PER_DEGREE);
    }
    // Legacy quirk: only the degrees are checked, so e.g. 140 30 is not clamped to 140 00 00.
    if (greaterThan(s.getLongitudeDegMax(), LONG_MAX_BOUNDARY_DEG)) {
      s.setLongitudeDegMax(LONG_MAX_BOUNDARY_DEG);
      s.setLongitudeMinMax(0);
      s.setLongitudeSecMax(0);
    }
  }

  // PL/SQL lines 2607-2647: emptiness checks
  private static boolean isLatMinEmpty(Seedlot s) {
    return s.getLatitudeDegMin() == null
        && s.getLatitudeMinMin() == null
        && s.getLatitudeSecMin() == null;
  }

  private static boolean isLatMaxEmpty(Seedlot s) {
    return s.getLatitudeDegMax() == null
        && s.getLatitudeMinMax() == null
        && s.getLatitudeSecMax() == null;
  }

  private static boolean isLongMinEmpty(Seedlot s) {
    return s.getLongitudeDegMin() == null
        && s.getLongitudeMinMin() == null
        && s.getLongitudeSecMin() == null;
  }

  private static boolean isLongMaxEmpty(Seedlot s) {
    return s.getLongitudeDegMax() == null
        && s.getLongitudeMinMax() == null
        && s.getLongitudeSecMax() == null;
  }

  // Oracle NULL semantics helpers

  private static int nvl(Integer value) {
    return value == null ? 0 : value;
  }

  private static Integer plus(Integer value, int offset) {
    return value == null ? null : value + offset;
  }

  private static Integer minus(Integer value, int offset) {
    return value == null ? null : value - offset;
  }

  private static boolean lessThan(Integer value, int bound) {
    return value != null && value < bound;
  }

  private static boolean greaterThan(Integer value, int bound) {
    return value != null && value > bound;
  }
}
