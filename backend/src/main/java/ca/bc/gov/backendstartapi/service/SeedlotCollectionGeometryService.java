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

    Seedlot seedlot = seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);
    loggedUserService.verifySeedlotAccessPrivilege(seedlot.getApplicantClientNumber());

    SeedlotCollectionGeometry geometry =
        seedlotCollectionGeometryRepository
            .findById(seedlotNumber)
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
   * <p>If no geometry was provided (null GeoJSON) this is a no-op so callers do not need to guard.
   *
   * @param seedlot the owning seedlot entity
   * @param geoJson GeoJSON string (SRID 3005) for the polygon; null means no-op
   * @param userId audit user ID
   */
  @Transactional
  public void saveOrUpdate(@NonNull Seedlot seedlot, String geoJson, @NonNull String userId) {
    Geometry geometry = GeometryUtil.fromGeoJson(geoJson);
    if (geometry == null) {
      SparLog.info("No collection geometry provided for seedlot {}; skipping.", seedlot.getId());
      return;
    }

    SparLog.info("Saving collection geometry for seedlot {}", seedlot.getId());

    SeedlotCollectionGeometry entity =
        seedlotCollectionGeometryRepository
            .findById(seedlot.getId())
            .orElseGet(() -> {
              SeedlotCollectionGeometry fresh = new SeedlotCollectionGeometry(seedlot.getId());
              fresh.setSeedlot(seedlot);
              return fresh;
            });

    entity.setGeometry(geometry);
    entity.setFeatureClassSkey(Constants.FEATURE_CLASS_SKEY_COLL_AREA);
    entity.setFeatureArea(BigDecimal.valueOf(geometry.getArea()).setScale(2, RoundingMode.HALF_UP));
    entity.setFeaturePerimeter(
        BigDecimal.valueOf(geometry.getLength()).setScale(2, RoundingMode.HALF_UP));
    entity.setObservationDate(LocalDateTime.now());
    entity.setAuditInformation(new AuditInformation(userId));
    seedlotCollectionGeometryRepository.save(entity);
    SparLog.info("Collection geometry saved for seedlot {}", seedlot.getId());
  }
}
