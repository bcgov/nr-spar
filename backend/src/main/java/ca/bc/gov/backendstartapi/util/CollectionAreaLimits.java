package ca.bc.gov.backendstartapi.util;

import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.Geometry;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.web.server.ResponseStatusException;

/**
 * Caps collection-area polygons to the product 8 km radius rule so a hostile
 * GeoJSON payload cannot DoS SPAR or OpenMaps with province-scale WKT.
 */
public final class CollectionAreaLimits {

  /** Legacy / form helper: collection radius cannot exceed 8 km. */
  public static final double MAX_RADIUS_KM = 8.0;

  /** Diameter of an 8 km-radius circle, plus 100 m of geodesic slack. */
  public static final double MAX_EXTENT_METERS = 16_100;

  /** Matches the map import vertex cap. */
  public static final int MAX_VERTICES = 2000;

  /** Well under Tomcat's 8 KiB header; plenty for an 8 km polygon. */
  public static final int MAX_GEOJSON_CHARS = 64_000;

  private static final double EARTH_RADIUS_METERS = 6_371_000;

  private CollectionAreaLimits() {}

  /**
   * Rejects GeoJSON / JTS geometry that is too large to be a collection area.
   *
   * @param geometry parsed WGS-84 geometry
   * @param geoJson original request body, used for a cheap length check
   */
  public static void assertAcceptable(@NonNull Geometry geometry, @Nullable String geoJson) {
    if (geoJson != null && geoJson.length() > MAX_GEOJSON_CHARS) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Collection area GeoJSON is too large");
    }
    if (geometry.getNumPoints() > MAX_VERTICES) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Collection area has too many vertices (maximum is " + MAX_VERTICES + ")");
    }
    if (maxExtentMeters(geometry) > MAX_EXTENT_METERS) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Collection area cannot span more than "
              + (int) MAX_RADIUS_KM
              + " km radius. Shrink the polygon and try again.");
    }
  }

  /** Longest geodesic side of the WGS-84 envelope, in metres. */
  public static double maxExtentMeters(@NonNull Geometry geometry) {
    Envelope env = geometry.getEnvelopeInternal();
    if (env.isNull()) {
      return 0;
    }
    double minLon = env.getMinX();
    double maxLon = env.getMaxX();
    double minLat = env.getMinY();
    double maxLat = env.getMaxY();
    double south = haversineMeters(minLat, minLon, minLat, maxLon);
    double north = haversineMeters(maxLat, minLon, maxLat, maxLon);
    double height = haversineMeters(minLat, minLon, maxLat, minLon);
    return Math.max(height, Math.max(south, north));
  }

  private static double haversineMeters(double lat1, double lon1, double lat2, double lon2) {
    double phi1 = Math.toRadians(lat1);
    double phi2 = Math.toRadians(lat2);
    double deltaPhi = Math.toRadians(lat2 - lat1);
    double deltaLambda = Math.toRadians(lon2 - lon1);
    double a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2)
            + Math.cos(phi1)
                * Math.cos(phi2)
                * Math.sin(deltaLambda / 2)
                * Math.sin(deltaLambda / 2);
    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)));
  }
}
