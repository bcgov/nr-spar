package ca.bc.gov.backendstartapi.util;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
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
    assertTrue(CollectionAreaLimits.maxExtentMeters(small) < CollectionAreaLimits.MAX_EXTENT_METERS);
    assertDoesNotThrow(() -> CollectionAreaLimits.assertAcceptable(small, GeometryUtil.toGeoJson(small)));
  }

  @Test
  @DisplayName("rejects a degree-scale polygon that exceeds 8 km radius")
  void hugePolygonIsRejected() {
    Polygon huge = polygon(-123.0, 49.0, -122.0, 50.0);
    assertTrue(CollectionAreaLimits.maxExtentMeters(huge) > CollectionAreaLimits.MAX_EXTENT_METERS);
    assertThrows(
        ResponseStatusException.class,
        () -> CollectionAreaLimits.assertAcceptable(huge, GeometryUtil.toGeoJson(huge)));
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
}
