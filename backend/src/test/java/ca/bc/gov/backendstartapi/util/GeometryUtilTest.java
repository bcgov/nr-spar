package ca.bc.gov.backendstartapi.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Polygon;

class GeometryUtilTest {

  @Test
  @DisplayName("fromGeoJson returns null for null or blank input")
  void fromGeoJson_nullOrBlank_returnsNull() {
    assertNull(GeometryUtil.fromGeoJson(null));
    assertNull(GeometryUtil.fromGeoJson("  "));
  }

  @Test
  @DisplayName("toGeoJson returns null for null geometry")
  void toGeoJson_null_returnsNull() {
    assertNull(GeometryUtil.toGeoJson(null));
  }

  @Test
  @DisplayName("round-trip polygon serialize and parse")
  void roundTrip_polygon() {
    GeometryFactory factory = new GeometryFactory();
    Polygon polygon =
        factory.createPolygon(
            new Coordinate[] {
              new Coordinate(0, 0),
              new Coordinate(1, 0),
              new Coordinate(1, 1),
              new Coordinate(0, 1),
              new Coordinate(0, 0)
            });

    String geoJson = GeometryUtil.toGeoJson(polygon);
    assertNotNull(geoJson);
    assertTrue(geoJson.contains("Polygon"));

    Geometry parsed = GeometryUtil.fromGeoJson(geoJson);
    assertNotNull(parsed);
    assertEquals("Polygon", parsed.getGeometryType());
  }

  @Test
  @DisplayName("fromGeoJson rejects malformed payload")
  void fromGeoJson_invalid_throws() {
    assertThrows(IllegalArgumentException.class, () -> GeometryUtil.fromGeoJson("{not-json"));
  }
}
