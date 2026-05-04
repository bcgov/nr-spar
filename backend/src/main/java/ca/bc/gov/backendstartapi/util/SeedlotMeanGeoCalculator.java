package ca.bc.gov.backendstartapi.util;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import java.util.Objects;

/**
 * Implements STEP 5 ("Set Mean Area of Use") of the Forestry Calculating Area of Use Geography
 * specification. For each of elevation / latitude / longitude, the seedlot mean column is set to
 * the area-of-use max when min == max across all DMS components, otherwise it falls back to the
 * collection mean.
 *
 * <p>The seedlot mean columns are read by legacy reports (e.g. SPRR048 Short Form). Leaving them
 * NULL silently drops rows from those reports.
 */
public final class SeedlotMeanGeoCalculator {

  private SeedlotMeanGeoCalculator() {}

  /**
   * Apply the mean Area-of-Use rule. Must be called only after the area-of-use min/max and the
   * collection mean values have been populated on the seedlot.
   */
  public static void applyMeanAreaOfUse(Seedlot seedlot) {
    // Mean Elevation
    seedlot.setElevation(
        Objects.equals(seedlot.getElevationMin(), seedlot.getElevationMax())
            ? seedlot.getElevationMax()
            : seedlot.getCollectionElevation());

    // Mean Latitude (DMS components must all match for min == max)
    boolean latEqual =
        Objects.equals(seedlot.getLatitudeDegMin(), seedlot.getLatitudeDegMax())
            && Objects.equals(seedlot.getLatitudeMinMin(), seedlot.getLatitudeMinMax())
            && Objects.equals(seedlot.getLatitudeSecMin(), seedlot.getLatitudeSecMax());
    seedlot.setLatitudeDegrees(
        latEqual ? seedlot.getLatitudeDegMax() : seedlot.getCollectionLatitudeDeg());
    seedlot.setLatitudeMinutes(
        latEqual ? seedlot.getLatitudeMinMax() : seedlot.getCollectionLatitudeMin());
    seedlot.setLatitudeSeconds(
        latEqual ? seedlot.getLatitudeSecMax() : seedlot.getCollectionLatitudeSec());

    // Mean Longitude
    boolean longEqual =
        Objects.equals(seedlot.getLongitudeDegMin(), seedlot.getLongitudeDegMax())
            && Objects.equals(seedlot.getLongitudeMinMin(), seedlot.getLongitudeMinMax())
            && Objects.equals(seedlot.getLongitudeSecMin(), seedlot.getLongitudeSecMax());
    seedlot.setLongitudeDegrees(
        longEqual ? seedlot.getLongitudeDegMax() : seedlot.getCollectionLongitudeDeg());
    seedlot.setLongitudeMinutes(
        longEqual ? seedlot.getLongitudeMinMax() : seedlot.getCollectionLongitudeMin());
    seedlot.setLongitudeSeconds(
        longEqual ? seedlot.getLongitudeSecMax() : seedlot.getCollectionLongitudeSec());
  }
}
