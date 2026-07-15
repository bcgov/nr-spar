package ca.bc.gov.backendstartapi.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.geolatte.geom.jts.JTS;
import org.geolatte.geom.json.GeolatteGeomModule;
import org.locationtech.jts.geom.Geometry;
import org.springframework.lang.Nullable;

/** Converts JTS geometries for API responses. */
public final class GeometryUtil {

  private static final ObjectMapper GEO_JSON_MAPPER =
      new ObjectMapper().registerModule(new GeolatteGeomModule());

  private GeometryUtil() {}

  /** Serializes a JTS geometry as GeoJSON. */
  public static String toGeoJson(Geometry geometry) {
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
   * Parses a GeoJSON string into a JTS {@link Geometry}.
   *
   * @param geoJson GeoJSON string; may be {@code null}.
   * @return the parsed JTS geometry, or {@code null} when the input is null or blank.
   * @throws IllegalArgumentException if the GeoJSON is malformed.
   */
  @Nullable
  public static Geometry fromGeoJson(@Nullable String geoJson) {
    if (geoJson == null || geoJson.isBlank()) {
      return null;
    }
    try {
      org.geolatte.geom.Geometry<?> geolatte =
          GEO_JSON_MAPPER.readValue(geoJson, org.geolatte.geom.Geometry.class);
      return JTS.to(geolatte);
    } catch (JsonProcessingException e) {
      throw new IllegalArgumentException("Invalid GeoJSON: " + e.getMessage(), e);
    }
  }
}
