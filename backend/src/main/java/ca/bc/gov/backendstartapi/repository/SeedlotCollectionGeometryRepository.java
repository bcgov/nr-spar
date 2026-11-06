package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionGeometry;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Repository for {@link SeedlotCollectionGeometry}. */
public interface SeedlotCollectionGeometryRepository
    extends JpaRepository<SeedlotCollectionGeometry, UUID> {

  /** Finds the single collection geometry row for a seedlot (unique per seedlot number). */
  Optional<SeedlotCollectionGeometry> findBySeedlotNumber(String seedlotNumber);

  /**
   * Geodesic area / perimeter of a WGS-84 geometry, computed by PostGIS.
   *
   * <p>The geometry is stored in SRID 4326 (WGS-84) so planar JTS {@code getArea()} /
   * {@code getLength()} would return meaningless degree-based numbers. Casting to {@code
   * geography} makes PostGIS measure on the spheroid, yielding true metres (perimeter) and square
   * metres (area) without needing a Java reprojection library. {@code ST_GeomFromGeoJSON} expects
   * a bare geometry, so callers must pass geometry-only GeoJSON (not a {@code Feature}).
   */
  @Query(
      value =
          "select st_area(g::geography) as area, st_perimeter(g::geography) as perimeter "
              + "from (select st_setsrid(st_geomfromgeojson(:geoJson), 4326) as g) as sub",
      nativeQuery = true)
  GeometryMeasurement measureGeography(@Param("geoJson") String geoJson);

  /** Projection for {@link #measureGeography(String)}: geodesic area (m²) and perimeter (m). */
  interface GeometryMeasurement {
    Double getArea();

    Double getPerimeter();
  }
}
