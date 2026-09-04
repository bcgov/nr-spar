package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionGeometry;
import ca.bc.gov.backendstartapi.exception.SeedlotCollectionGeometryNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionGeometryRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.security.UserInfo;
import ca.bc.gov.backendstartapi.util.GeometryUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Polygon;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(SpringExtension.class)
class SeedlotCollectionGeometryServiceTest {

  @Mock private SeedlotCollectionGeometryRepository seedlotCollectionGeometryRepository;
  @Mock private SeedlotRepository seedlotRepository;
  @Mock private LoggedUserService loggedUserService;

  private SeedlotCollectionGeometryService seedlotCollectionGeometryService;

  private static final String SEEDLOT_NUMBER = "53001";

  @BeforeEach
  void setup() {
    seedlotCollectionGeometryService =
        new SeedlotCollectionGeometryService(
            seedlotCollectionGeometryRepository, seedlotRepository, loggedUserService);
  }

  @Test
  @DisplayName("getBySeedlotNumber fails when seedlot missing")
  void getBySeedlotNumber_seedlotMissing_shouldFail() {
    when(seedlotRepository.findById(any())).thenReturn(Optional.empty());

    ResponseStatusException exception =
        assertThrows(
            ResponseStatusException.class,
            () -> seedlotCollectionGeometryService.getBySeedlotNumber(SEEDLOT_NUMBER));

    assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
  }

  @Test
  @DisplayName("getBySeedlotNumber fails when geometry missing")
  void getBySeedlotNumber_geometryMissing_shouldFail() {
    Seedlot seedlot = new Seedlot(SEEDLOT_NUMBER);
    seedlot.setApplicantClientNumber(UserInfo.getDevClientNumber());

    when(seedlotRepository.findById(any())).thenReturn(Optional.of(seedlot));
    when(seedlotCollectionGeometryRepository.findBySeedlotNumber(any()))
        .thenReturn(Optional.empty());

    assertThrows(
        SeedlotCollectionGeometryNotFoundException.class,
        () -> seedlotCollectionGeometryService.getBySeedlotNumber(SEEDLOT_NUMBER));
  }

  @Test
  @DisplayName("getBySeedlotNumber returns GeoJSON")
  void getBySeedlotNumber_shouldSucceed() {
    Seedlot seedlot = new Seedlot(SEEDLOT_NUMBER);
    seedlot.setApplicantClientNumber(UserInfo.getDevClientNumber());

    GeometryFactory geometryFactory = new GeometryFactory();
    Coordinate[] coordinates =
        new Coordinate[] {
          new Coordinate(0, 0),
          new Coordinate(1, 0),
          new Coordinate(1, 1),
          new Coordinate(0, 1),
          new Coordinate(0, 0)
        };
    Polygon polygon = geometryFactory.createPolygon(coordinates);

    SeedlotCollectionGeometry geometry = new SeedlotCollectionGeometry(SEEDLOT_NUMBER);
    geometry.setGeometry(polygon);
    geometry.setFeatureClassSkey(42);

    when(seedlotRepository.findById(any())).thenReturn(Optional.of(seedlot));
    when(seedlotCollectionGeometryRepository.findBySeedlotNumber(any()))
        .thenReturn(Optional.of(geometry));

    var dto = seedlotCollectionGeometryService.getBySeedlotNumber(SEEDLOT_NUMBER);

    assertEquals(SEEDLOT_NUMBER, dto.seedlotNumber());
    assertEquals(42, dto.featureClassSkey());

    JsonNode geoJson = assertDoesNotThrow(() -> new ObjectMapper().readTree(dto.geometryGeoJson()));
    assertEquals("Polygon", geoJson.get("type").asText());
  }

  @Test
  @DisplayName("saveOrUpdate with null GeoJSON deletes existing row")
  void saveOrUpdate_nullGeoJson_shouldDeleteExisting() {
    Seedlot seedlot = new Seedlot(SEEDLOT_NUMBER);
    SeedlotCollectionGeometry existing = new SeedlotCollectionGeometry(SEEDLOT_NUMBER);

    when(seedlotCollectionGeometryRepository.findBySeedlotNumber(SEEDLOT_NUMBER))
        .thenReturn(Optional.of(existing));

    seedlotCollectionGeometryService.saveOrUpdate(seedlot, null, "user@idir");

    verify(seedlotCollectionGeometryRepository).delete(existing);
    verify(seedlotCollectionGeometryRepository, never()).save(any());
  }

  @Test
  @DisplayName("saveOrUpdate with blank GeoJSON deletes existing row")
  void saveOrUpdate_blankGeoJson_shouldDeleteExisting() {
    Seedlot seedlot = new Seedlot(SEEDLOT_NUMBER);
    SeedlotCollectionGeometry existing = new SeedlotCollectionGeometry(SEEDLOT_NUMBER);

    when(seedlotCollectionGeometryRepository.findBySeedlotNumber(SEEDLOT_NUMBER))
        .thenReturn(Optional.of(existing));

    seedlotCollectionGeometryService.saveOrUpdate(seedlot, "   ", "user@idir");

    verify(seedlotCollectionGeometryRepository).delete(existing);
    verify(seedlotCollectionGeometryRepository, never()).save(any());
  }

  @Test
  @DisplayName("saveOrUpdate with null GeoJSON is a no-op when no row exists")
  void saveOrUpdate_nullGeoJson_noExisting_shouldNoOp() {
    Seedlot seedlot = new Seedlot(SEEDLOT_NUMBER);

    when(seedlotCollectionGeometryRepository.findBySeedlotNumber(SEEDLOT_NUMBER))
        .thenReturn(Optional.empty());

    seedlotCollectionGeometryService.saveOrUpdate(seedlot, null, "user@idir");

    verify(seedlotCollectionGeometryRepository, never()).delete(any());
    verify(seedlotCollectionGeometryRepository, never()).save(any());
  }

  @Test
  @DisplayName("saveOrUpdate creates geometry row when none exists")
  void saveOrUpdate_createsNewGeometry() {
    Seedlot seedlot = new Seedlot(SEEDLOT_NUMBER);
    GeometryFactory geometryFactory = new GeometryFactory();
    Polygon polygon =
        geometryFactory.createPolygon(
            new Coordinate[] {
              new Coordinate(0, 0),
              new Coordinate(1, 0),
              new Coordinate(1, 1),
              new Coordinate(0, 1),
              new Coordinate(0, 0)
            });
    String geoJson = GeometryUtil.toGeoJson(polygon);

    when(seedlotCollectionGeometryRepository.findBySeedlotNumber(SEEDLOT_NUMBER))
        .thenReturn(Optional.empty());
    when(seedlotCollectionGeometryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    seedlotCollectionGeometryService.saveOrUpdate(seedlot, geoJson, "user@idir");

    ArgumentCaptor<SeedlotCollectionGeometry> captor =
        ArgumentCaptor.forClass(SeedlotCollectionGeometry.class);
    verify(seedlotCollectionGeometryRepository).save(captor.capture());
    SeedlotCollectionGeometry saved = captor.getValue();
    assertEquals(SEEDLOT_NUMBER, saved.getSeedlotNumber());
    assertEquals(Constants.FEATURE_CLASS_SKEY_COLL_AREA, saved.getFeatureClassSkey());
    assertNotNull(saved.getGeometry());
    assertNotNull(saved.getObservationDate());
    assertEquals("user@idir", saved.getAuditInformation().getEntryUserId());
  }

  @Test
  @DisplayName("saveOrUpdate updates existing geometry row")
  void saveOrUpdate_updatesExistingGeometry() {
    Seedlot seedlot = new Seedlot(SEEDLOT_NUMBER);
    SeedlotCollectionGeometry existing = new SeedlotCollectionGeometry(SEEDLOT_NUMBER);
    GeometryFactory geometryFactory = new GeometryFactory();
    Polygon polygon =
        geometryFactory.createPolygon(
            new Coordinate[] {
              new Coordinate(0, 0),
              new Coordinate(2, 0),
              new Coordinate(2, 2),
              new Coordinate(0, 2),
              new Coordinate(0, 0)
            });
    String geoJson = GeometryUtil.toGeoJson(polygon);

    when(seedlotCollectionGeometryRepository.findBySeedlotNumber(SEEDLOT_NUMBER))
        .thenReturn(Optional.of(existing));
    when(seedlotCollectionGeometryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    seedlotCollectionGeometryService.saveOrUpdate(seedlot, geoJson, "updater@idir");

    ArgumentCaptor<SeedlotCollectionGeometry> captor =
        ArgumentCaptor.forClass(SeedlotCollectionGeometry.class);
    verify(seedlotCollectionGeometryRepository).save(captor.capture());
    assertEquals(existing, captor.getValue());
    assertEquals("updater@idir", captor.getValue().getAuditInformation().getUpdateUserId());
  }
}