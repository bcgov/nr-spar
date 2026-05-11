package ca.bc.gov.backendstartapi.util;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class SeedlotMeanGeoCalculatorTest {

  private Seedlot baseSeedlot() {
    Seedlot seedlot = new Seedlot("64220");
    seedlot.setCollectionElevation(450);
    seedlot.setCollectionLatitudeDeg(49);
    seedlot.setCollectionLatitudeMin(30);
    seedlot.setCollectionLatitudeSec(0);
    seedlot.setCollectionLongitudeDeg(124);
    seedlot.setCollectionLongitudeMin(15);
    seedlot.setCollectionLongitudeSec(0);
    return seedlot;
  }

  @Test
  void elevationMinEqualsMaxUsesMaxTest() {
    Seedlot seedlot = baseSeedlot();
    seedlot.setElevationMin(500);
    seedlot.setElevationMax(500);

    SeedlotMeanGeoCalculator.applyMeanAreaOfUse(seedlot);

    Assertions.assertEquals(500, seedlot.getElevation());
  }

  @Test
  void elevationMinNotEqualsMaxUsesCollectionTest() {
    Seedlot seedlot = baseSeedlot();
    seedlot.setElevationMin(200);
    seedlot.setElevationMax(800);

    SeedlotMeanGeoCalculator.applyMeanAreaOfUse(seedlot);

    Assertions.assertEquals(450, seedlot.getElevation());
  }

  @Test
  void elevationBothNullFallsBackToCollectionTest() {
    // Regression for SPRR048 / issue 2434: when min/max are NULL the mean must still
    // be populated (not left NULL) so the legacy report does not silently drop the row.
    Seedlot seedlot = baseSeedlot();
    seedlot.setElevationMin(null);
    seedlot.setElevationMax(null);

    SeedlotMeanGeoCalculator.applyMeanAreaOfUse(seedlot);

    Assertions.assertEquals(450, seedlot.getElevation());
  }

  @Test
  void latitudeAllDmsComponentsEqualUsesMaxTest() {
    Seedlot seedlot = baseSeedlot();
    seedlot.setLatitudeDegMin(50);
    seedlot.setLatitudeDegMax(50);
    seedlot.setLatitudeMinMin(15);
    seedlot.setLatitudeMinMax(15);
    seedlot.setLatitudeSecMin(0);
    seedlot.setLatitudeSecMax(0);

    SeedlotMeanGeoCalculator.applyMeanAreaOfUse(seedlot);

    Assertions.assertEquals(50, seedlot.getLatitudeDegrees());
    Assertions.assertEquals(15, seedlot.getLatitudeMinutes());
    Assertions.assertEquals(0, seedlot.getLatitudeSeconds());
  }

  @Test
  void latitudeAnyDmsComponentDiffersUsesCollectionTest() {
    Seedlot seedlot = baseSeedlot();
    seedlot.setLatitudeDegMin(50);
    seedlot.setLatitudeDegMax(50);
    seedlot.setLatitudeMinMin(10);
    seedlot.setLatitudeMinMax(20);
    seedlot.setLatitudeSecMin(0);
    seedlot.setLatitudeSecMax(0);

    SeedlotMeanGeoCalculator.applyMeanAreaOfUse(seedlot);

    Assertions.assertEquals(49, seedlot.getLatitudeDegrees());
    Assertions.assertEquals(30, seedlot.getLatitudeMinutes());
    Assertions.assertEquals(0, seedlot.getLatitudeSeconds());
  }

  @Test
  void latitudeAllDmsComponentsNullFallsBackToCollectionTest() {
    Seedlot seedlot = baseSeedlot();

    SeedlotMeanGeoCalculator.applyMeanAreaOfUse(seedlot);

    Assertions.assertEquals(49, seedlot.getLatitudeDegrees());
    Assertions.assertEquals(30, seedlot.getLatitudeMinutes());
    Assertions.assertEquals(0, seedlot.getLatitudeSeconds());
  }

  @Test
  void longitudeAllDmsComponentsEqualUsesMaxTest() {
    Seedlot seedlot = baseSeedlot();
    seedlot.setLongitudeDegMin(125);
    seedlot.setLongitudeDegMax(125);
    seedlot.setLongitudeMinMin(45);
    seedlot.setLongitudeMinMax(45);
    seedlot.setLongitudeSecMin(0);
    seedlot.setLongitudeSecMax(0);

    SeedlotMeanGeoCalculator.applyMeanAreaOfUse(seedlot);

    Assertions.assertEquals(125, seedlot.getLongitudeDegrees());
    Assertions.assertEquals(45, seedlot.getLongitudeMinutes());
    Assertions.assertEquals(0, seedlot.getLongitudeSeconds());
  }

  @Test
  void longitudeDmsComponentsDifferUsesCollectionTest() {
    Seedlot seedlot = baseSeedlot();
    seedlot.setLongitudeDegMin(124);
    seedlot.setLongitudeDegMax(125);
    seedlot.setLongitudeMinMin(0);
    seedlot.setLongitudeMinMax(0);
    seedlot.setLongitudeSecMin(0);
    seedlot.setLongitudeSecMax(0);

    SeedlotMeanGeoCalculator.applyMeanAreaOfUse(seedlot);

    Assertions.assertEquals(124, seedlot.getLongitudeDegrees());
    Assertions.assertEquals(15, seedlot.getLongitudeMinutes());
    Assertions.assertEquals(0, seedlot.getLongitudeSeconds());
  }

  @Test
  void longitudeAllDmsComponentsNullFallsBackToCollectionTest() {
    Seedlot seedlot = baseSeedlot();

    SeedlotMeanGeoCalculator.applyMeanAreaOfUse(seedlot);

    Assertions.assertEquals(124, seedlot.getLongitudeDegrees());
    Assertions.assertEquals(15, seedlot.getLongitudeMinutes());
    Assertions.assertEquals(0, seedlot.getLongitudeSeconds());
  }
}
