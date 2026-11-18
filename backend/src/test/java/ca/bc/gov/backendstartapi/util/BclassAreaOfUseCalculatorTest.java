package ca.bc.gov.backendstartapi.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import ca.bc.gov.backendstartapi.dto.oracle.TransferLimitDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Expected values follow the legacy PL/SQL apply_no_superior_prov_limits, quirks included. */
class BclassAreaOfUseCalculatorTest {

  private Seedlot seedlot() {
    Seedlot seedlot = new Seedlot("63001");
    seedlot.setCollectionElevation(450);
    seedlot.setCollectionLatitudeDeg(52);
    seedlot.setCollectionLatitudeMin(20);
    seedlot.setCollectionLatitudeSec(15);
    seedlot.setCollectionLongitudeDeg(124);
    seedlot.setCollectionLongitudeMin(15);
    seedlot.setCollectionLongitudeSec(0);
    return seedlot;
  }

  private TransferLimitDto limit(
      Integer northDeg, Integer northMin, Integer southDeg, Integer southMin,
      Integer eastDeg, Integer eastMin, Integer westDeg, Integer westMin,
      Integer up, Integer down) {
    return new TransferLimitDto(
        1L, "FDC", "B", false, "I", null, 48, 60,
        northDeg, northMin, southDeg, southMin, eastDeg, eastMin, westDeg, westMin, up, down);
  }

  private TransferLimitDto standardLimit() {
    return limit(3, 0, 2, 0, 2, 0, 3, 0, 350, 350);
  }

  private void assertLatMin(Seedlot s, Integer deg, Integer min, Integer sec) {
    assertEquals(deg, s.getLatitudeDegMin(), "lat deg min");
    assertEquals(min, s.getLatitudeMinMin(), "lat min min");
    assertEquals(sec, s.getLatitudeSecMin(), "lat sec min");
  }

  private void assertLatMax(Seedlot s, Integer deg, Integer min, Integer sec) {
    assertEquals(deg, s.getLatitudeDegMax(), "lat deg max");
    assertEquals(min, s.getLatitudeMinMax(), "lat min max");
    assertEquals(sec, s.getLatitudeSecMax(), "lat sec max");
  }

  private void assertLongMin(Seedlot s, Integer deg, Integer min, Integer sec) {
    assertEquals(deg, s.getLongitudeDegMin(), "long deg min");
    assertEquals(min, s.getLongitudeMinMin(), "long min min");
    assertEquals(sec, s.getLongitudeSecMin(), "long sec min");
  }

  private void assertLongMax(Seedlot s, Integer deg, Integer min, Integer sec) {
    assertEquals(deg, s.getLongitudeDegMax(), "long deg max");
    assertEquals(min, s.getLongitudeMinMax(), "long min max");
    assertEquals(sec, s.getLongitudeSecMax(), "long sec max");
  }

  @Test
  @DisplayName("Applies the limits as offsets from the collection geography")
  void standardLimits() {
    Seedlot s = seedlot();

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(s, standardLimit(), true);

    assertEquals(100, s.getElevationMin());
    assertEquals(800, s.getElevationMax());
    assertLatMin(s, 50, 20, 15);
    assertLatMax(s, 55, 20, 15);
    assertLongMin(s, 122, 15, 0);
    assertLongMax(s, 127, 15, 0);
  }

  @Test
  @DisplayName("Null limits are treated as no offset")
  void nullLimits() {
    Seedlot s = seedlot();

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(
        s, limit(null, null, null, null, null, null, null, null, null, null), true);

    assertEquals(450, s.getElevationMin());
    assertEquals(450, s.getElevationMax());
    assertLatMin(s, 52, 20, 15);
    assertLatMax(s, 52, 20, 15);
    assertLongMin(s, 124, 15, 0);
    assertLongMax(s, 124, 15, 0);
  }

  @Test
  @DisplayName("Negative minutes borrow a degree")
  void minuteBorrow() {
    Seedlot s = seedlot();

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(
        s, limit(0, 0, 0, 30, 0, 30, 0, 0, 0, 0), true);

    assertLatMin(s, 51, 50, 15);
    assertLongMin(s, 123, 45, 0);
  }

  @Test
  @DisplayName("Minutes over 60 carry a degree")
  void minuteCarry() {
    Seedlot s = seedlot();

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(
        s, limit(0, 45, 0, 0, 0, 0, 0, 50, 0, 0), true);

    assertLatMax(s, 53, 5, 15);
    assertLongMax(s, 125, 5, 0);
  }

  @Test
  @DisplayName("Legacy quirk: exactly 60 minutes is not carried")
  void exactlySixtyMinutesNotCarried() {
    Seedlot s = seedlot();

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(
        s, limit(0, 40, 0, 0, 0, 0, 0, 45, 0, 0), true);

    assertLatMax(s, 52, 60, 15);
    assertLongMax(s, 124, 60, 0);
  }

  @Test
  @DisplayName("Min latitude below 48 degrees is clamped to 48 00 00")
  void latitudeMinClamp() {
    Seedlot s = seedlot();
    s.setCollectionLatitudeDeg(49);

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(s, standardLimit(), true);

    assertLatMin(s, 48, 0, 0);
  }

  @Test
  @DisplayName("Max latitude above 60 degrees is clamped to 60 00 00")
  void latitudeMaxClamp() {
    Seedlot s = seedlot();
    s.setCollectionLatitudeDeg(59);

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(s, standardLimit(), true);

    assertLatMax(s, 60, 0, 0);
  }

  @Test
  @DisplayName("Legacy quirk: max latitude of 60 degrees plus minutes is not clamped")
  void latitudeMaxMinutesNotClamped() {
    Seedlot s = seedlot();
    s.setCollectionLatitudeDeg(59);

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(
        s, limit(1, 10, 0, 0, 0, 0, 0, 0, 0, 0), true);

    assertLatMax(s, 60, 30, 15);
  }

  @Test
  @DisplayName("Longitude is clamped to 114 00 00 and 140 00 00")
  void longitudeClamps() {
    Seedlot s = seedlot();
    s.setCollectionLongitudeDeg(115);
    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(s, standardLimit(), true);
    assertLongMin(s, 114, 0, 0);

    s = seedlot();
    s.setCollectionLongitudeDeg(139);
    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(s, standardLimit(), true);
    assertLongMax(s, 140, 0, 0);
  }

  @Test
  @DisplayName("Legacy quirk: max longitude of 140 degrees plus minutes is not clamped")
  void longitudeMaxMinutesNotClamped() {
    Seedlot s = seedlot();
    s.setCollectionLongitudeDeg(139);
    s.setCollectionLongitudeMin(50);

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(
        s, limit(0, 0, 0, 0, 0, 0, 0, 20, 0, 0), true);

    assertLongMax(s, 140, 10, 0);
  }

  @Test
  @DisplayName("Min elevation is at least 1 m")
  void elevationFloor() {
    Seedlot s = seedlot();
    s.setCollectionElevation(200);

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(s, standardLimit(), true);

    assertEquals(1, s.getElevationMin());
    assertEquals(550, s.getElevationMax());
  }

  @Test
  @DisplayName("Missing collection elevation leaves elevation empty (Oracle NULL arithmetic)")
  void missingCollectionElevation() {
    Seedlot s = seedlot();
    s.setCollectionElevation(null);

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(s, standardLimit(), true);

    assertNull(s.getElevationMin());
    assertNull(s.getElevationMax());
  }

  @Test
  @DisplayName("Legacy quirk: missing collection latitude gives min 48 00 00 and empty max")
  void missingCollectionLatitude() {
    Seedlot s = seedlot();
    s.setCollectionLatitudeDeg(null);
    s.setCollectionLatitudeMin(null);
    s.setCollectionLatitudeSec(null);

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(s, standardLimit(), true);

    assertLatMin(s, 48, 0, 0);
    assertLatMax(s, null, null, null);
  }

  @Test
  @DisplayName("Without replaceAll, only empty parts are filled; the 1 m floor still applies")
  void fillOnlyEmptyParts() {
    Seedlot s = seedlot();
    s.setElevationMin(0);
    s.setElevationMax(999);
    s.setLatitudeDegMin(50);
    s.setLatitudeMinMin(0);
    s.setLatitudeSecMin(0);
    s.setLongitudeDegMax(130);

    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(s, standardLimit(), false);

    assertEquals(1, s.getElevationMin());
    assertEquals(999, s.getElevationMax());
    assertLatMin(s, 50, 0, 0);
    assertLatMax(s, 55, 20, 15);
    assertLongMin(s, 122, 15, 0);
    assertLongMax(s, 130, null, null);
  }

  @Test
  @DisplayName("blankAreaOfUseGeography clears every min/max field")
  void blankAreaOfUseGeography() {
    Seedlot s = seedlot();
    BclassAreaOfUseCalculator.applyNoSuperiorProvLimits(s, standardLimit(), true);

    BclassAreaOfUseCalculator.blankAreaOfUseGeography(s);

    assertNull(s.getElevationMin());
    assertNull(s.getElevationMax());
    assertLatMin(s, null, null, null);
    assertLatMax(s, null, null, null);
    assertLongMin(s, null, null, null);
    assertLongMax(s, null, null, null);
  }
}
