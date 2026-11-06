package ca.bc.gov.backendstartapi.util;

import java.util.ArrayList;
import java.util.List;
import org.locationtech.jts.geom.Coordinate;
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

  /**
   * Same 8 km rule in metres, plus 100 m of slack. The frontend measures and
   * rounds the radius to 0.1 km before submitting, so without slack a polygon
   * the map accepted could be refused here on a rounding difference.
   */
  public static final double MAX_RADIUS_METERS = (MAX_RADIUS_KM * 1_000) + 100;

  /**
   * Sanity bound on polygon complexity. Not a transport limit — spatial queries
   * are POSTed to OpenMaps, so a large filter is carried fine. This exists so a
   * single collection area cannot cost OpenMaps or PostGIS an unbounded amount
   * of work. The frontend mirrors it in {@code collectionAreaLimits.ts}, and
   * {@code OpenmapsProxyService.MAX_CQL_LENGTH} is derived from it so a polygon
   * we accept for storage can always be BEC-validated.
   */
  public static final int MAX_VERTICES = 2000;

  /**
   * Cheap payload-size guard on the raw GeoJSON. The frontend rounds coordinates to 6
   * decimals before submitting, which keeps a polygon at {@link #MAX_VERTICES} well under this.
   */
  public static final int MAX_GEOJSON_CHARS = 64_000;

  private static final double EARTH_RADIUS_METERS = 6_371_000;

  private CollectionAreaLimits() {}

  /**
   * Every collection-area limit the geometry breaks, as user-facing messages.
   *
   * <p>Callers on the form-submission path wrap these in {@code
   * SeedlotValidationError} against the geometry field, so the frontend can
   * show them the same way it shows every other field error.
   *
   * @param geometry parsed WGS-84 geometry
   * @param geoJson original request body, used for a cheap length check
   * @return messages in the order checked; empty when the geometry is acceptable
   */
  public static List<String> violations(@NonNull Geometry geometry, @Nullable String geoJson) {
    List<String> messages = new ArrayList<>();
    if (geoJson != null && geoJson.length() > MAX_GEOJSON_CHARS) {
      messages.add("Collection area GeoJSON is too large");
    }
    if (geometry.getNumPoints() > MAX_VERTICES) {
      messages.add("Collection area has too many vertices (maximum is " + MAX_VERTICES + ")");
    }
    if (radiusMeters(geometry) > MAX_RADIUS_METERS) {
      messages.add(
          "Collection area cannot span more than "
              + (int) MAX_RADIUS_KM
              + " km radius. Shrink the polygon and try again.");
    }
    return messages;
  }

  /**
   * Throwing guard for callers off the form-submission path, such as the
   * standalone geometry save. Keeps a bad geometry out of the table even when
   * nothing collected structured errors first.
   *
   * @param geometry parsed WGS-84 geometry
   * @param geoJson original request body, used for a cheap length check
   */
  public static void assertAcceptable(@NonNull Geometry geometry, @Nullable String geoJson) {
    List<String> messages = violations(geometry, geoJson);
    if (!messages.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, messages.get(0));
    }
  }

  /**
   * Radius of the collection area in metres: half the longest straight-line
   * distance between any two of its points — an edge, a diagonal, or the span
   * between two separate polygons, whichever is greatest. This is the business
   * definition the registration form's radius field records, and it matches
   * {@code collectionRadiusKm} in {@code AoiToolbar/aoiValidation.ts}.
   *
   * <p>Only the convex hull can hold the farthest pair, so the scan runs over
   * hull vertices. The winning pair is picked with a planar approximation
   * (longitude scaled by cos(latitude)) and then measured geodesically; over an
   * area this size the planar error is far below the 0.1 km the radius field
   * records, so it cannot select a meaningfully wrong pair.
   */
  public static double radiusMeters(@NonNull Geometry geometry) {
    Coordinate[] hull = geometry.convexHull().getCoordinates();
    if (hull.length < 2) {
      return 0;
    }

    double meanLat = 0;
    for (Coordinate c : hull) {
      meanLat += c.y;
    }
    double lonScale = Math.cos(Math.toRadians(meanLat / hull.length));

    Coordinate from = hull[0];
    Coordinate to = hull[1];
    double bestSquared = -1;
    for (int i = 0; i < hull.length; i++) {
      for (int j = i + 1; j < hull.length; j++) {
        double dx = (hull[i].x - hull[j].x) * lonScale;
        double dy = hull[i].y - hull[j].y;
        double squared = (dx * dx) + (dy * dy);
        if (squared > bestSquared) {
          bestSquared = squared;
          from = hull[i];
          to = hull[j];
        }
      }
    }
    return haversineMeters(from.y, from.x, to.y, to.x) / 2;
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
