package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotReviewElevationLatLongDto;
import ca.bc.gov.backendstartapi.dto.SeedlotReviewGeoInformationDto;
import ca.bc.gov.backendstartapi.dto.SeedlotReviewSeedPlanZoneDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.GeneticClassNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;

/** This class holds methods for handling data for the TSC_Admin role. */
@Service
@RequiredArgsConstructor
public class TscAdminService {

  private final SeedlotRepository seedlotRepository;

  private final SeedlotStatusService seedlotStatusService;

  private final SeedlotSeedPlanZoneRepository seedlotSeedPlanZoneRepository;

  private final GeneticClassRepository geneticClassRepository;

  private final LoggedUserService loggedUserService;

  /**
   * Retrieve a paginated list of seedlot for a given user.
   *
   * @param pageNumber the page number for the paginated search
   * @param pageSize the size of the page
   * @return a list of the user's seedlots
   */
  public Page<Seedlot> getTscAdminSeedlots(int pageNumber, int pageSize) {
    SparLog.info("Retrieving paginated list of seedlots for the TSC Admin role!");
    if (pageSize == 0) {
      SparLog.info("Invalid page size value, using default 10.");
      pageSize = 10;
    }

    SparLog.info("Pagination settings: pageNumber {}, pageSize {}", pageNumber, pageSize);
    Pageable sortedPageable =
        PageRequest.of(
            pageNumber, pageSize, Sort.by(Direction.DESC, "AuditInformation_UpdateTimestamp"));

    Page<Seedlot> seedlotPage = seedlotRepository.findAll(sortedPageable);
    SparLog.info("{} results and {} pages", seedlotPage.getNumber(), seedlotPage.getTotalPages());
    return seedlotPage;
  }

  /**
   * Method for approving or disapproving a {@link Seedlot} registration.
   *
   * @param seedlotNumber The {@link Seedlot} identification.
   * @param approved Boolean option defined if it was approved.
   */
  public Seedlot approveOrDisapproveSeedlot(String seedlotNumber, Boolean approved) {
    SparLog.info("Received Seedlot number {} for approval or disappoval", seedlotNumber);

    Optional<Seedlot> seedlot = seedlotRepository.findById(seedlotNumber);
    if (seedlot.isEmpty()) {
      SparLog.warn("Seedlot number not found!");
      throw new SeedlotNotFoundException();
    }

    Seedlot seedlotEntity = seedlot.get();
    String statucCode = null;

    if (Boolean.TRUE.equals(approved)) {
      SparLog.info("Seedlot number {} approved! Updating it to Approved", seedlotNumber);
      statucCode = "APP";
    } else {
      SparLog.info("Seedlot number {} disapproved! Sending it back to Pending", seedlotNumber);
      statucCode = "PND";
    }

    Optional<SeedlotStatusEntity> seedlotStatus =
        seedlotStatusService.getValidSeedlotStatus(statucCode);
    if (seedlotStatus.isEmpty()) {
      SparLog.warn("Seedlot status {} not found!", statucCode);
      throw new SeedlotStatusNotFoundException();
    }

    seedlotEntity.setSeedlotStatus(seedlotStatus.get());

    Seedlot seedlotSaved = seedlotRepository.saveAndFlush(seedlotEntity);
    SparLog.info("Seedlot number {} approval or disapproval request finished!", seedlotNumber);

    return seedlotSaved;
  }

  /**
   * Override or recreate all Seedlots Seed Plan Zone records.
   *
   * @param seedlot The {@link Seedlot} to be updated.
   * @param seedlotReviewSeedPlanZones The List of SPZ possibly modified by the TSC Admin.
   */
  public void overrideAreaOfUse(
      Seedlot seedlot, List<SeedlotReviewSeedPlanZoneDto> seedlotReviewSeedPlanZones) {
    SparLog.info("Update Seedlot Seed Plan Zones for Seedlot {}", seedlot.getId());
    List<SeedlotSeedPlanZoneEntity> seedlotSpzs =
        seedlotSeedPlanZoneRepository.findAllBySeedlot_id(seedlot.getId());

    if (seedlotSpzs.isEmpty()) {
      SparLog.info("No existing Seedlot Seed Plan Zones records found for Seedlot {}");
    } else {
      SparLog.info(
          "Deleting {} Seedlot Seed Plan Zones records for Seedlot {}",
          seedlotSpzs.size(),
          seedlot.getId());
      seedlotSeedPlanZoneRepository.deleteAll(seedlotSpzs);
    }

    GeneticClassEntity genAclass =
        geneticClassRepository.findById("A").orElseThrow(GeneticClassNotFoundException::new);

    List<SeedlotSeedPlanZoneEntity> sspzToSave = new ArrayList<>();
    for (SeedlotReviewSeedPlanZoneDto seedlotSpz : seedlotReviewSeedPlanZones) {
      SeedlotSeedPlanZoneEntity sspzEntity =
          new SeedlotSeedPlanZoneEntity(
              seedlot,
              seedlotSpz.code(),
              genAclass,
              seedlotSpz.isPrimary(),
              seedlotSpz.description());
      sspzEntity.setAuditInformation(new AuditInformation(loggedUserService.getLoggedUserId()));

      sspzToSave.add(sspzEntity);
    }

    if (!sspzToSave.isEmpty()) {
      seedlotSeedPlanZoneRepository.saveAllAndFlush(sspzToSave);
      SparLog.info(
          "{} Seedlot Seed Plan Zone records saved for Seedlot {}",
          sspzToSave.size(),
          seedlot.getId());
    } else {
      SparLog.info("No Seedlot Seed Plan Zone new records to save for Seedlot {}", seedlot.getId());
    }
  }

  /**
   * Override all the Elevation, Lat and Long seedlot data reviewed by the TSC Admin.
   *
   * @param seedlot The Seedlot instance.
   * @param seedlotReviewElevationLatLong The elevation, lat and long data reviewed.
   */
  public void overrideElevLatLongMinMax(
      Seedlot seedlot, SeedlotReviewElevationLatLongDto seedlotReviewElevationLatLong) {
    SparLog.info(
        "Update Seedlot elevation, latitude and longitude for Seedlot {}", seedlot.getId());
    // Elevation
    seedlot.setElevationMax(seedlotReviewElevationLatLong.maxElevation());
    seedlot.setElevationMin(seedlotReviewElevationLatLong.minElevation());

    // Latitude Degree, use collection mean if value is null
    seedlot.setLatitudeDegMax(seedlotReviewElevationLatLong.maxLatitudeDeg());
    seedlot.setLatitudeDegMin(seedlotReviewElevationLatLong.minLatitudeDeg());

    // Latitude Minute, use collection mean if value is null
    seedlot.setLatitudeMinMax(seedlotReviewElevationLatLong.maxLatitudeMin());
    seedlot.setLatitudeMinMin(seedlotReviewElevationLatLong.minLatitudeMin());

    // Latitude second = 0, legacy spar does not provide a min max for seconds, collection
    // lat/long second is not calculated and is defaulted to 0 since it's not accurate to use.
    seedlot.setLatitudeSecMax(seedlotReviewElevationLatLong.maxLatitudeSec());
    seedlot.setLatitudeSecMin(seedlotReviewElevationLatLong.minLatitudeSec());

    // Longitude data is not provided in A-Class tested parent tree area of use, default to
    // collection data
    seedlot.setLongitudeDegMax(seedlotReviewElevationLatLong.maxLongitudeDeg());
    seedlot.setLongitudeDegMin(seedlotReviewElevationLatLong.minLongitudeDeg());

    seedlot.setLongitudeMinMax(seedlotReviewElevationLatLong.maxLongitudeMin());
    seedlot.setLongitudeMinMin(seedlotReviewElevationLatLong.minLongitudeMin());
    // Seconds default to 0
    seedlot.setLongitudeSecMax(seedlotReviewElevationLatLong.maxLongitudeSec());
    seedlot.setLongitudeSecMin(seedlotReviewElevationLatLong.minLongitudeSec());
  }

  /**
   * Override the seedlot geographic information (collection elevation, latitude and longitude).
   *
   * @param seedlot The Seedlot instance.
   * @param seedlotReviewDto Seedlot Geo Information provided by TSC Admin.
   */
  public void overrideSeedlotCollElevLatLong(
      Seedlot seedlot, SeedlotReviewGeoInformationDto seedlotReviewDto) {
    // Ne value
    seedlot.setEffectivePopulationSize(seedlotReviewDto.effectivePopulationSize());

    // Elevation
    seedlot.setCollectionElevation(seedlotReviewDto.meanElevation());

    // Latitude DMS
    seedlot.setCollectionLatitudeDeg(seedlotReviewDto.meanLatitudeDegree());
    seedlot.setCollectionLatitudeMin(seedlotReviewDto.meanLatitudeMinute());
    seedlot.setCollectionLatitudeSec(seedlotReviewDto.meanLatitudeSecond());

    // Longitude DMS
    seedlot.setCollectionLongitudeDeg(seedlotReviewDto.meanLongitudeDegree());
    seedlot.setCollectionLongitudeMin(seedlotReviewDto.meanLongitudeMinute());
    seedlot.setCollectionLongitudeSec(seedlotReviewDto.meanLongitudeSecond());
  }
}
