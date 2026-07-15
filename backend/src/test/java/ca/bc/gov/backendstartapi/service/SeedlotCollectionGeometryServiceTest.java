package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionGeometry;
import ca.bc.gov.backendstartapi.exception.SeedlotCollectionGeometryNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionGeometryRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.security.UserInfo;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Polygon;
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
    when(seedlotCollectionGeometryRepository.findById(any())).thenReturn(Optional.empty());

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
    when(seedlotCollectionGeometryRepository.findById(any())).thenReturn(Optional.of(geometry));

    var dto = seedlotCollectionGeometryService.getBySeedlotNumber(SEEDLOT_NUMBER);

    assertEquals(SEEDLOT_NUMBER, dto.seedlotNumber());
    assertEquals(42, dto.featureClassSkey());
    assertEquals("Polygon", dto.geometryGeoJson().substring(9, 16));
  }
}