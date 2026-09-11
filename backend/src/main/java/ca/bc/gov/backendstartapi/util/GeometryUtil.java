package ca.bc.gov.backendstartapi.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.geolatte.geom.json.GeolatteGeomModule;
import org.geolatte.geom.jts.JTS;
import org.locationtech.jts.geom.Geometry;
import org.springframework.lang.Nullable;

/** Converts JTS geometries for API responses. */
public final class GeometryUtil {

  /** Spatial reference for stored/exchanged geometry: WGS-84 lon/lat, matching the frontend. */
  public static final int WGS84_SRID = 4326;

  private static final ObjectMapper GEO_JSON_MAPPER =
      new ObjectMapper().registerModule(new GeolatteGeomModule());

  private GeometryUtil() {}

  /** Serializes a JTS geometry as GeoJSON. Returns {@code null} for a null geometry. */
  @Nullable
  public static String toGeoJson(@Nullable Geometry geometry) {
    if (geometry == null) {
      return null;
    }
    try {
      return GEO_JSON_MAPPER.writeValueAsString(JTS.from(geometry));
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to serialize geometry as GeoJSON", e);
    }
  }

  /**
   * Parses a GeoJSON string into a JTS {@link Geometry} in WGS-84 (SRID 4326).
   *
   * <p>Tolerant of the shapes the frontend/Leaflet map emits: a bare geometry ({@code Polygon},
   * {@code MultiPolygon}, ...), a {@code Feature} wrapping a geometry, or a {@code
   * FeatureCollection} (its first feature's geometry is used). This mirrors the map branch's
   * {@code JsonNode}-based parser, which accepted a {@code Feature} directly — geolatte's strict
   * deserializer only understands bare geometries, so we unwrap first.
   *
   * @param geoJson GeoJSON string; may be {@code null}.
   * @return the parsed JTS geometry with SRID 4326, or {@code null} when the input is null/blank
   *     or carries no geometry.
   * @throws IllegalArgumentException if the GeoJSON is malformed.
   */
  @Nullable
  public static Geometry fromGeoJson(@Nullable String geoJson) {
    if (geoJson == null || geoJson.isBlank()) {
      return null;
    }
    try {
      JsonNode geometryNode = extractGeometryNode(GEO_JSON_MAPPER.readTree(geoJson));
      if (geometryNode == null || geometryNode.isNull()) {
        return null;
      }
      org.geolatte.geom.Geometry<?> geolatte =
          GEO_JSON_MAPPER.treeToValue(geometryNode, org.geolatte.geom.Geometry.class);
      Geometry jts = JTS.to(geolatte);
      jts.setSRID(WGS84_SRID);
      return jts;
    } catch (JsonProcessingException e) {
      throw new IllegalArgumentException("Invalid GeoJSON: " + e.getMessage(), e);
    }
  }

  /**
   * Unwraps a GeoJSON node down to its bare geometry node. Returns the node unchanged when it is
   * already a geometry, drills into {@code Feature.geometry}, and follows the first feature of a
   * {@code FeatureCollection}.
   */
  @Nullable
  private static JsonNode extractGeometryNode(@Nullable JsonNode node) {
    if (node == null || !node.hasNonNull("type")) {
      return node;
    }
    String type = node.get("type").asText();
    if ("Feature".equalsIgnoreCase(type)) {
      return node.get("geometry");
    }
    if ("FeatureCollection".equalsIgnoreCase(type)) {
      JsonNode features = node.get("features");
      if (features != null && features.isArray() && !features.isEmpty()) {
        return extractGeometryNode(features.get(0));
      }
      return null;
    }
    return node;
  }
}
