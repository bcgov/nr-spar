package ca.bc.gov.backendstartapi.util;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Polygon;
import org.springframework.web.server.ResponseStatusException;

class CollectionAreaLimitsTest {

  private static final GeometryFactory FACTORY = new GeometryFactory();

  private static Polygon polygon(double minLon, double minLat, double maxLon, double maxLat) {
    return FACTORY.createPolygon(
        new Coordinate[] {
          new Coordinate(minLon, minLat),
          new Coordinate(maxLon, minLat),
          new Coordinate(maxLon, maxLat),
          new Coordinate(minLon, maxLat),
          new Coordinate(minLon, minLat)
        });
  }

  @Test
  @DisplayName("accepts a small collection polygon")
  void smallPolygonIsOk() {
    Polygon small = polygon(-123.02, 49.00, -123.00, 49.01);
    assertTrue(CollectionAreaLimits.radiusMeters(small) < CollectionAreaLimits.MAX_RADIUS_METERS);
    assertDoesNotThrow(
        () -> CollectionAreaLimits.assertAcceptable(small, GeometryUtil.toGeoJson(small)));
  }

  @Test
  @DisplayName("rejects a degree-scale polygon that exceeds 8 km radius")
  void hugePolygonIsRejected() {
    Polygon huge = polygon(-123.0, 49.0, -122.0, 50.0);
    String hugeGeoJson = GeometryUtil.toGeoJson(huge);
    assertTrue(CollectionAreaLimits.radiusMeters(huge) > CollectionAreaLimits.MAX_RADIUS_METERS);
    assertThrows(
        ResponseStatusException.class,
        () -> CollectionAreaLimits.assertAcceptable(huge, hugeGeoJson));
  }

  @Test
  @DisplayName("radius is half the longest diagonal, not half the longest side")
  void radiusIsHalfTheLongestDiagonal() {
    // 0.02 deg lon at 49N is ~1460 m and 0.01 deg lat ~1112 m, so the longest
    // side is 1460 m but the corner-to-corner diagonal is ~1836 m.
    Polygon box = polygon(-123.02, 49.00, -123.00, 49.01);
    assertEquals(918, CollectionAreaLimits.radiusMeters(box), 15);
  }

  @Test
  @DisplayName("radius spans separate polygons of a MultiPolygon")
  void radiusSpansSeparateParts() {
    Polygon west = polygon(-123.02, 49.00, -123.00, 49.01);
    Polygon east = polygon(-122.52, 49.00, -122.50, 49.01);
    Geometry pair = FACTORY.createMultiPolygon(new Polygon[] {west, east});
    assertTrue(
        CollectionAreaLimits.radiusMeters(pair) > CollectionAreaLimits.radiusMeters(west) * 10);
  }

  @Test
  @DisplayName("rejects a long thin sliver whose area is tiny but reach is not")
  void slenderPolygonIsRejected() {
    // ~29 km long and 55 m wide: an equal-area circle would call this under 1 km.
    Polygon sliver = polygon(-123.0, 49.0, -122.6, 49.0005);
    assertTrue(CollectionAreaLimits.radiusMeters(sliver) > CollectionAreaLimits.MAX_RADIUS_METERS);
    assertFalse(CollectionAreaLimits.violations(sliver, "{}").isEmpty());
  }

  @Test
  @DisplayName("violations reports every broken limit at once")
  void violationsCollectsAllBreaches() {
    Polygon huge = polygon(-123.0, 49.0, -122.0, 50.0);
    String padding = " ".repeat(CollectionAreaLimits.MAX_GEOJSON_CHARS + 1);
    assertEquals(2, CollectionAreaLimits.violations(huge, padding).size());
  }

  @Test
  @DisplayName("violations is empty for an acceptable polygon")
  void violationsEmptyWhenAcceptable() {
    Polygon small = polygon(-123.02, 49.00, -123.00, 49.01);
    assertTrue(CollectionAreaLimits.violations(small, GeometryUtil.toGeoJson(small)).isEmpty());
  }

  @Test
  @DisplayName("rejects a polygon with too many vertices")
  void tooManyVerticesIsRejected() {
    Coordinate[] coords = new Coordinate[CollectionAreaLimits.MAX_VERTICES + 2];
    for (int i = 0; i < coords.length - 1; i++) {
      coords[i] = new Coordinate(-123.02 + (i * 0.000001), 49.00);
    }
    coords[coords.length - 1] = coords[0];
    Polygon dense = FACTORY.createPolygon(coords);
    assertThrows(
        ResponseStatusException.class, () -> CollectionAreaLimits.assertAcceptable(dense, "{}"));
  }

  @Test
  @DisplayName("rejects GeoJSON longer than the payload cap")
  void overlongGeoJsonIsRejected() {
    Polygon small = polygon(-123.02, 49.00, -123.00, 49.01);
    String padding = " ".repeat(CollectionAreaLimits.MAX_GEOJSON_CHARS + 1);
    assertThrows(
        ResponseStatusException.class,
        () -> CollectionAreaLimits.assertAcceptable(small, padding));
  }

  @Test
  @DisplayName("accepts a polygon with exactly the vertex cap and rejects one more")
  void vertexCapIsInclusive() {
    Polygon atCap = densePolygon(CollectionAreaLimits.MAX_VERTICES);
    assertDoesNotThrow(() -> CollectionAreaLimits.assertAcceptable(atCap, "{}"));

    Polygon overCap = densePolygon(CollectionAreaLimits.MAX_VERTICES + 1);
    assertThrows(
        ResponseStatusException.class,
        () -> CollectionAreaLimits.assertAcceptable(overCap, "{}"));
  }

  @Test
  @DisplayName("accepts GeoJSON of exactly the character cap and rejects one more")
  void geoJsonCharCapIsInclusive() {
    Polygon small = polygon(-123.02, 49.00, -123.00, 49.01);
    String geoJson = GeometryUtil.toGeoJson(small);
    String atCap = geoJson + " ".repeat(CollectionAreaLimits.MAX_GEOJSON_CHARS - geoJson.length());
    assertDoesNotThrow(() -> CollectionAreaLimits.assertAcceptable(small, atCap));

    String overCap = atCap + " ";
    assertThrows(
        ResponseStatusException.class, () -> CollectionAreaLimits.assertAcceptable(small, overCap));
  }

  @Test
  @DisplayName("accepts a polygon at exactly the radius cap and rejects just over")
  void radiusCapIsInclusive() {
    double minLon = -123.0;
    double minLat = 49.0;
    double latDelta = 0.001;
    double lo = minLon;
    double hi = minLon + 0.5;
    Polygon atCap = null;
    Polygon overCap = null;
    for (int i = 0; i < 50; i++) {
      double mid = (lo + hi) / 2;
      Polygon candidate = polygon(minLon, minLat, mid, minLat + latDelta);
      if (CollectionAreaLimits.radiusMeters(candidate) <= CollectionAreaLimits.MAX_RADIUS_METERS) {
        atCap = candidate;
        lo = mid;
      } else {
        overCap = candidate;
        hi = mid;
      }
    }
    assertNotNull(atCap);
    assertNotNull(overCap);
    final Polygon accepted = atCap;
    final Polygon rejected = overCap;
    assertDoesNotThrow(
        () -> CollectionAreaLimits.assertAcceptable(accepted, GeometryUtil.toGeoJson(accepted)));
    assertThrows(
        ResponseStatusException.class,
        () -> CollectionAreaLimits.assertAcceptable(rejected, GeometryUtil.toGeoJson(rejected)));
  }

  private static Polygon densePolygon(int numPoints) {
    Coordinate[] coords = new Coordinate[numPoints];
    for (int i = 0; i < numPoints - 1; i++) {
      coords[i] = new Coordinate(-123.02 + (i * 0.000001), 49.00);
    }
    coords[numPoints - 1] = coords[0];
    return FACTORY.createPolygon(coords);
  }
}
