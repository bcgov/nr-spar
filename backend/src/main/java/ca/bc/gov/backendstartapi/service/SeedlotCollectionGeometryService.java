package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotCollectionGeometryDto;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionGeometry;
import ca.bc.gov.backendstartapi.exception.SeedlotCollectionGeometryNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionGeometryRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.util.GeometryUtil;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Geometry;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

/** Read-only access to Class B collection area geometry. */
@Service
@RequiredArgsConstructor
public class SeedlotCollectionGeometryService {

  private final SeedlotCollectionGeometryRepository seedlotCollectionGeometryRepository;
  private final SeedlotRepository seedlotRepository;
  private final LoggedUserService loggedUserService;

  /** Returns collection geometry metadata for a seedlot. */
  public SeedlotCollectionGeometryDto getBySeedlotNumber(@NonNull String seedlotNumber) {
    SparLog.info("Fetching collection geometry for seedlot {}", seedlotNumber);

    Seedlot seedlot =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);
    loggedUserService.verifySeedlotAccessPrivilege(seedlot.getApplicantClientNumber());

    SeedlotCollectionGeometry geometry =
        seedlotCollectionGeometryRepository
            .findBySeedlotNumber(seedlotNumber)
            .orElseThrow(SeedlotCollectionGeometryNotFoundException::new);

    SparLog.info("Collection geometry found for seedlot {}", seedlotNumber);

    return new SeedlotCollectionGeometryDto(
        geometry.getSeedlotNumber(),
        GeometryUtil.toGeoJson(geometry.getGeometry()),
        geometry.getFeatureClassSkey(),
        geometry.getFeatureArea(),
        geometry.getFeaturePerimeter(),
        geometry.getObservationDate(),
        geometry.getRevisionCount());
  }

  /**
   * Persists or updates the collection polygon for a B-class seedlot.
   *
   * <p>If no geometry was provided (null or blank GeoJSON, or GeoJSON with no geometry), any
   * existing {@code seedlot_collection_geometry} row for the seedlot is deleted. Callers such as
   * {@code submitSeedlotFormClassB} invoke this inside the same transaction that deletes the
   * wizard draft, so clearing the polygon and removing the draft stay atomic.
   *
   * <p>Accepts WGS-84 (SRID 4326) GeoJSON as produced by the Leaflet map — a bare geometry, a
   * {@code Feature}, or a {@code FeatureCollection} (see {@link GeometryUtil#fromGeoJson}). Area
   * and perimeter are measured on the spheroid via PostGIS {@code geography} (true m² / m) rather
   * than planar JTS, which would be meaningless in degrees.
   *
   * @param seedlot the owning seedlot entity
   * @param geoJson WGS-84 (SRID 4326) GeoJSON for the polygon; null/blank clears any stored
   *     geometry
   * @param userId audit user ID
   */
  @Transactional
  public void saveOrUpdate(@NonNull Seedlot seedlot, String geoJson, @NonNull String userId) {
    Geometry geometry = GeometryUtil.fromGeoJson(geoJson);
    if (geometry == null) {
      seedlotCollectionGeometryRepository
          .findBySeedlotNumber(seedlot.getId())
          .ifPresent(
              existing -> {
                seedlotCollectionGeometryRepository.delete(existing);
                SparLog.info(
                    "Collection geometry deleted for seedlot {} (no GeoJSON provided).",
                    seedlot.getId());
              });
      return;
    }

    SparLog.info("Saving collection geometry for seedlot {}", seedlot.getId());

    SeedlotCollectionGeometry entity =
        seedlotCollectionGeometryRepository
            .findBySeedlotNumber(seedlot.getId())
            .orElseGet(() -> new SeedlotCollectionGeometry(seedlot.getId()));

    entity.setGeometry(geometry);
    entity.setFeatureClassSkey(Constants.FEATURE_CLASS_SKEY_COLL_AREA);

    String bareGeoJson = GeometryUtil.toGeoJson(geometry);
    if (bareGeoJson == null) {
      throw new IllegalStateException("Failed to serialize collection geometry for measurement");
    }
    SeedlotCollectionGeometryRepository.GeometryMeasurement measurement =
        seedlotCollectionGeometryRepository.measureGeography(bareGeoJson);
    entity.setFeatureArea(toScaledDecimal(measurement == null ? null : measurement.getArea()));
    entity.setFeaturePerimeter(
        toScaledDecimal(measurement == null ? null : measurement.getPerimeter()));

    entity.setObservationDate(LocalDateTime.now());
    entity.setAuditInformation(new AuditInformation(userId));
    seedlotCollectionGeometryRepository.save(entity);
    SparLog.info("Collection geometry saved for seedlot {}", seedlot.getId());
  }

  private static BigDecimal toScaledDecimal(Double value) {
    if (value == null) {
      return null;
    }
    return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
  }
}
