package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.SeedlotReviewElevationLatLongDto;
import ca.bc.gov.backendstartapi.dto.SeedlotReviewGeoInformationDto;
import ca.bc.gov.backendstartapi.dto.SeedlotReviewSeedPlanZoneDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class TscAdminServiceTest {

  @Mock SeedlotRepository seedlotRepository;

  @Mock SeedlotStatusService seedlotStatusService;

  @Mock SeedlotSeedPlanZoneRepository seedlotSeedPlanZoneRepository;

  @Mock GeneticClassRepository geneticClassRepository;

  @Mock SeedlotGeneticWorthService seedlotGeneticWorthService;

  private TscAdminService tscAdminService;

  private SeedlotStatusEntity createValidStatus(String status) {
    SeedlotStatusEntity seedlotStatus = new SeedlotStatusEntity();
    seedlotStatus.setSeedlotStatusCode(status);

    LocalDate yesterday = LocalDate.now().minusDays(1L);
    LocalDate tomorrow = yesterday.plusWeeks(1L);
    seedlotStatus.setEffectiveDateRange(new EffectiveDateRange(yesterday, tomorrow));

    return seedlotStatus;
  }

  @BeforeEach
  void setup() {
    tscAdminService =
        new TscAdminService(
            seedlotRepository,
            seedlotStatusService,
            seedlotSeedPlanZoneRepository,
            geneticClassRepository,
            seedlotGeneticWorthService);
  }

  @Test
  @DisplayName("get Seedlots for the TSC_Admin role")
  void getTscAdminSeedlots_happyPath_shouldSucceed() {
    Integer page = 0;
    Integer size = 10;

    Pageable sortedPageable =
        PageRequest.of(page, size, Sort.by(Direction.DESC, "AuditInformation_UpdateTimestamp"));

    Seedlot seedlot = new Seedlot("63712");
    seedlot.setApplicantClientNumber("00012345");

    Page<Seedlot> seedlotPage = new PageImpl<>(List.of(seedlot));
    when(seedlotRepository.findAll(sortedPageable)).thenReturn(seedlotPage);

    Page<Seedlot> pageResult = tscAdminService.getTscAdminSeedlots(page, size);

    Assertions.assertNotNull(pageResult);
    Assertions.assertEquals("63712", pageResult.getContent().get(0).getId());
    Assertions.assertEquals("00012345", pageResult.getContent().get(0).getApplicantClientNumber());
  }

  @Test
  @DisplayName("Approves a seedlot number")
  void approveOrDisapproveSeedlot_approve_shouldSucceed() {
    SeedlotStatusEntity seedlotStatus = createValidStatus("APP");

    String seedlotNumber = "63123";
    Seedlot seedlot = new Seedlot(seedlotNumber);
    seedlot.setSeedlotStatus(seedlotStatus);

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.of(seedlot));
    when(seedlotStatusService.getValidSeedlotStatus("APP")).thenReturn(Optional.of(seedlotStatus));
    when(seedlotRepository.saveAndFlush(any())).thenReturn(seedlot);

    Seedlot seedlotSaved = tscAdminService.approveOrDisapproveSeedlot(seedlotNumber, Boolean.TRUE);

    Assertions.assertNotNull(seedlotSaved);
    Assertions.assertEquals(seedlotNumber, seedlotSaved.getId());
    Assertions.assertEquals("APP", seedlotSaved.getSeedlotStatus().getSeedlotStatusCode());
  }

  @Test
  @DisplayName("Disapproves a seedlot number")
  void approveOrDisapproveSeedlot_disapprove_shouldSucceed() {
    SeedlotStatusEntity seedlotStatus = createValidStatus("PND");

    String seedlotNumber = "63124";

    Seedlot seedlot = new Seedlot(seedlotNumber);
    seedlot.setSeedlotStatus(seedlotStatus);

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.of(seedlot));
    when(seedlotStatusService.getValidSeedlotStatus("PND")).thenReturn(Optional.of(seedlotStatus));
    when(seedlotRepository.saveAndFlush(any())).thenReturn(seedlot);

    Seedlot seedlotSaved = tscAdminService.approveOrDisapproveSeedlot(seedlotNumber, Boolean.FALSE);

    Assertions.assertNotNull(seedlotSaved);
    Assertions.assertEquals(seedlotNumber, seedlotSaved.getId());
    Assertions.assertEquals("PND", seedlotSaved.getSeedlotStatus().getSeedlotStatusCode());
  }

  @Test
  @DisplayName("Seedlot approval attempt seedlot not found should fail")
  void approveOrDisapproveSeedlot_seedlotNotFound_shouldFail() {
    String seedlotNumber = "63125";

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.empty());

    Assertions.assertThrows(
        SeedlotNotFoundException.class,
        () -> {
          tscAdminService.approveOrDisapproveSeedlot(seedlotNumber, Boolean.FALSE);
        });
  }

  @Test
  @DisplayName("Seedlot approval attempt seedlot status not found should fail")
  void approveOrDisapproveSeedlot_statusNotFound_shouldFail() {
    String seedlotNumber = "63126";
    SeedlotStatusEntity seedlotStatus = createValidStatus("PND");
    Seedlot seedlot = new Seedlot(seedlotNumber);
    seedlot.setSeedlotStatus(seedlotStatus);

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.of(seedlot));
    when(seedlotStatusService.getValidSeedlotStatus("APP")).thenReturn(Optional.empty());

    Assertions.assertThrows(
        SeedlotStatusNotFoundException.class,
        () -> {
          tscAdminService.approveOrDisapproveSeedlot(seedlotNumber, Boolean.FALSE);
        });
  }

  @Test
  @DisplayName("Update Seed Plan Zones happy path should succeed")
  void updateSeedPlanZones_happyPath_shouldSucceed() {
    String seedlotNumber = "63126";

    SeedlotSeedPlanZoneEntity seedPlanZoneEntity = mock(SeedlotSeedPlanZoneEntity.class);
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id(seedlotNumber))
        .thenReturn(List.of(seedPlanZoneEntity));
    doNothing().when(seedlotSeedPlanZoneRepository).deleteAll(List.of(seedPlanZoneEntity));
    doNothing().when(seedlotSeedPlanZoneRepository).flush();

    GeneticClassEntity genClassEntity = mock(GeneticClassEntity.class);
    when(geneticClassRepository.findById("A")).thenReturn(Optional.of(genClassEntity));

    when(seedlotSeedPlanZoneRepository.saveAllAndFlush(any())).thenReturn(List.of());

    Seedlot seedlot = new Seedlot(seedlotNumber);
    SeedlotReviewSeedPlanZoneDto seedPlanZonePgDto =
        new SeedlotReviewSeedPlanZoneDto("PG", "Prince George", true);
    SeedlotReviewSeedPlanZoneDto seedPlanZoneGlDto =
        new SeedlotReviewSeedPlanZoneDto("GL", "Georgia lowlands", false);

    tscAdminService.updateSeedPlanZones(seedlot, List.of(seedPlanZonePgDto, seedPlanZoneGlDto));

    verify(seedlotSeedPlanZoneRepository, times(1)).deleteAll(any());
    verify(seedlotSeedPlanZoneRepository, times(1)).flush();
    verify(seedlotSeedPlanZoneRepository, times(1)).saveAllAndFlush(any());
  }

  @Test
  @DisplayName("Update Seed plan Zones empty list should succeed")
  void updateSeedPlanZones_emptyList_shouldSucceed() {
    String seedlotNumber = "63126";
    SeedlotSeedPlanZoneEntity seedPlanZoneEntity = mock(SeedlotSeedPlanZoneEntity.class);

    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id(seedlotNumber))
        .thenReturn(List.of(seedPlanZoneEntity));
    doNothing().when(seedlotSeedPlanZoneRepository).deleteAll(List.of(seedPlanZoneEntity));
    doNothing().when(seedlotSeedPlanZoneRepository).flush();

    GeneticClassEntity genClassEntity = mock(GeneticClassEntity.class);
    when(geneticClassRepository.findById("A")).thenReturn(Optional.of(genClassEntity));

    when(seedlotSeedPlanZoneRepository.saveAllAndFlush(any())).thenReturn(List.of());
    Seedlot seedlot = new Seedlot(seedlotNumber);

    tscAdminService.updateSeedPlanZones(seedlot, List.of());

    verify(seedlotSeedPlanZoneRepository, times(1)).deleteAll(any());
    verify(seedlotSeedPlanZoneRepository, times(1)).flush();
    verify(seedlotSeedPlanZoneRepository, times(0)).saveAllAndFlush(any());
  }

  @Test
  @DisplayName("Update Elevation Lat Long happy path should succeed")
  void updateElevationLatLong_happyPath_shouldSucceed() {
    String seedlotNumber = "63126";
    Seedlot seedlot = new Seedlot(seedlotNumber);

    SeedlotReviewElevationLatLongDto elevationLatLongDto =
        mock(SeedlotReviewElevationLatLongDto.class);

    tscAdminService.updateElevationLatLong(seedlot, elevationLatLongDto);

    // Elevation
    Assertions.assertNotNull(seedlot.getElevationMax());
    Assertions.assertNotNull(seedlot.getElevationMin());

    // Latitude Degree, use collection mean if value is null
    Assertions.assertNotNull(seedlot.getLatitudeDegMax());
    Assertions.assertNotNull(seedlot.getLatitudeDegMin());

    // Latitude Minute, use collection mean if value is null
    Assertions.assertNotNull(seedlot.getLatitudeMinMax());
    Assertions.assertNotNull(seedlot.getLatitudeMinMin());

    // Latitude second = 0, legacy spar does not provide a min max for seconds, collection
    // lat/long second is not calculated and is defaulted to 0 since it's not accurate to use.
    Assertions.assertNotNull(seedlot.getLatitudeSecMax());
    Assertions.assertNotNull(seedlot.getLatitudeSecMin());

    // Longitude data is not provided in A-Class tested parent tree area of use, default to
    // collection data
    Assertions.assertNotNull(seedlot.getLongitudeDegMax());
    Assertions.assertNotNull(seedlot.getLongitudeDegMin());

    Assertions.assertNotNull(seedlot.getLongitudeMinMax());
    Assertions.assertNotNull(seedlot.getLongitudeMinMin());
    // Seconds default to 0
    Assertions.assertNotNull(seedlot.getLongitudeSecMax());
    Assertions.assertNotNull(seedlot.getLongitudeSecMin());
  }

  @Test
  @DisplayName("Update Seedlot Genetic Worth happy path should succeed")
  void updateSeedlotGeneticWorth_happyPath_shouldSucceed() {
    String seedlotNumber = "63129";
    Seedlot seedlot = new Seedlot(seedlotNumber);

    GeneticWorthTraitsDto genWorthTraits = mock(GeneticWorthTraitsDto.class);

    tscAdminService.updateSeedlotGeneticWorth(seedlot, List.of(genWorthTraits));

    doNothing().when(seedlotGeneticWorthService).deleteAllForSeedlot(seedlotNumber);
    doNothing().when(seedlotGeneticWorthService).saveGenWorthListToSeedlot(any(), any());

    verify(seedlotGeneticWorthService, times(1)).deleteAllForSeedlot(seedlotNumber);
    verify(seedlotGeneticWorthService, times(1)).saveGenWorthListToSeedlot(any(), any());
  }

  @Test
  @DisplayName("Update Seedlot Geo Information happy path should succeed")
  void updateSeedlotGeoInformation_happyPath_shouldSucceed() {
    String seedlotNumber = "63126";
    Seedlot seedlot = new Seedlot(seedlotNumber);

    SeedlotReviewGeoInformationDto geoInformationDto = mock(SeedlotReviewGeoInformationDto.class);

    tscAdminService.updateSeedlotGeoInformation(seedlot, geoInformationDto);

    // Elevation
    Assertions.assertNotNull(seedlot.getCollectionElevation());

    // Latitude DMS
    Assertions.assertNotNull(seedlot.getCollectionLatitudeDeg());
    Assertions.assertNotNull(seedlot.getCollectionLatitudeMin());
    Assertions.assertNotNull(seedlot.getCollectionLatitudeSec());

    // Longitude DMS
    Assertions.assertNotNull(seedlot.getCollectionLongitudeDeg());
    Assertions.assertNotNull(seedlot.getCollectionLongitudeMin());
    Assertions.assertNotNull(seedlot.getCollectionLongitudeSec());
  }
}
