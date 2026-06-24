package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SaveSeedlotAoiDto;
import ca.bc.gov.backendstartapi.dto.SaveSeedlotAoiDto.GeoJsonFeature;
import ca.bc.gov.backendstartapi.dto.SaveSeedlotAoiResponseDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.MultiPolygon;
import org.locationtech.jts.geom.Polygon;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Unit tests for {@link SeedlotService#saveAoi} covering GeoJSON parsing,
 * server-side repair + union, BEC zone echo, coordinate fidelity, and error cases.
 *
 * <p>Every test verifies actual computed values (areas, coordinate positions,
 * geometry counts, validity flags) — not just that a method was called.
 */
@ExtendWith(SpringExtension.class)
class SeedlotServiceSaveAoiTest {

  @Mock SeedlotRepository seedlotRepository;
  @Mock SeedlotSourceRepository seedlotSourceRepository;
  @Mock GeneticClassRepository geneticClassRepository;
  @Mock LoggedUserService loggedUserService;
  @Mock SeedlotCollectionMethodService seedlotCollectionMethodService;
  @Mock SeedlotOwnerQuantityService seedlotOwnerQuantityService;
  @Mock SeedlotOrchardService seedlotOrchardService;
  @Mock SeedlotParentTreeService seedlotParentTreeService;
  @Mock SeedlotParentTreeGeneticQualityService seedlotParentTreeGeneticQualityService;
  @Mock SeedlotGeneticWorthService seedlotGeneticWorthService;
  @Mock SmpMixService smpMixService;
  @Mock SmpMixGeneticQualityService smpMixGeneticQualityService;
  @Mock SeedlotParentTreeSmpMixService seedlotParentTreeSmpMixService;
  @Mock SeedlotStatusService seedlotStatusService;
  @Mock OrchardService orchardService;
  @Mock SeedlotSeedPlanZoneRepository seedlotSeedPlanZoneRepository;
  @Mock ParentTreeService parentTreeService;
  @Mock TscAdminService tscAdminService;
  @Mock Provider oracleApiProvider;

  private SeedlotService seedlotService;
  private final ObjectMapper mapper = new ObjectMapper();

  @BeforeEach
  void setup() {
    seedlotService =
        new SeedlotService(
            seedlotRepository,
            seedlotSourceRepository,
            geneticClassRepository,
            loggedUserService,
            seedlotCollectionMethodService,
            seedlotOwnerQuantityService,
            seedlotOrchardService,
            seedlotParentTreeService,
            seedlotParentTreeGeneticQualityService,
            seedlotGeneticWorthService,
            smpMixService,
            smpMixGeneticQualityService,
            seedlotParentTreeSmpMixService,
            seedlotStatusService,
            orchardService,
            seedlotSeedPlanZoneRepository,
            parentTreeService,
            tscAdminService,
            oracleApiProvider);
  }

  private Seedlot mockSeedlotExists(String seedlotNumber) {
    Seedlot seedlot = new Seedlot(seedlotNumber);
    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.of(seedlot));
    when(seedlotRepository.save(any(Seedlot.class))).thenAnswer(inv -> inv.getArgument(0));
    return seedlot;
  }

  private JsonNode geom(String geoJson) throws Exception {
    return mapper.readTree(geoJson);
  }

  private MultiPolygon capturePersistedGeometry() {
    ArgumentCaptor<Seedlot> captor = ArgumentCaptor.forClass(Seedlot.class);
    verify(seedlotRepository).save(captor.capture());
    return captor.getValue().getCollectionGeom();
  }

  // ── Happy path: response fields ───────────────────────────────────

  @Test
  @DisplayName("saveAoi returns correct response fields for a valid polygon")
  void saveAoi_validPolygon_correctResponseFields() throws Exception {
    mockSeedlotExists("12345");

    JsonNode geometry = geom("""
        {
          "type": "Polygon",
          "coordinates": [
            [[-123.5, 48.5], [-123.4, 48.5], [-123.4, 48.6], [-123.5, 48.6], [-123.5, 48.5]]
          ]
        }
        """);

    SaveSeedlotAoiDto request =
        new SaveSeedlotAoiDto(new GeoJsonFeature("Feature", geometry, null), List.of("CDF"));

    SaveSeedlotAoiResponseDto response = seedlotService.saveAoi("12345", request);

    assertTrue(response.ok(), "Response should indicate success");
    assertEquals("12345", response.seedlotNumber());
    assertEquals(List.of("CDF"), response.becZones(), "BEC zones should be echoed from request");
    assertNotNull(response.savedAt(), "Timestamp should be non-null");
  }

  // ── Coordinate fidelity ───────────────────────────────────────────

  @Test
  @DisplayName("saveAoi preserves the input polygon coordinates in the persisted geometry")
  void saveAoi_coordinatesFaithfullyPersisted() throws Exception {
    mockSeedlotExists("12345");

    JsonNode geometry = geom("""
        {
          "type": "Polygon",
          "coordinates": [
            [[-123.5, 48.5], [-123.4, 48.5], [-123.4, 48.6], [-123.5, 48.6], [-123.5, 48.5]]
          ]
        }
        """);

    seedlotService.saveAoi("12345",
        new SaveSeedlotAoiDto(new GeoJsonFeature("Feature", geometry, null), List.of()));

    MultiPolygon saved = capturePersistedGeometry();
    assertEquals(1, saved.getNumGeometries());
    Polygon poly = (Polygon) saved.getGeometryN(0);
    Coordinate[] coords = poly.getExteriorRing().getCoordinates();

    // 5 coordinates (4 vertices + closing point)
    assertEquals(5, coords.length, "Exterior ring should have 5 coordinates (closed)");
    // First coordinate matches input
    assertEquals(-123.5, coords[0].x, 1e-9, "First longitude should be -123.5");
    assertEquals(48.5, coords[0].y, 1e-9, "First latitude should be 48.5");
    // Ring is closed: first == last
    assertEquals(coords[0].x, coords[4].x, 1e-9, "Ring should be closed (x)");
    assertEquals(coords[0].y, coords[4].y, 1e-9, "Ring should be closed (y)");
    assertEquals(4326, saved.getSRID(), "SRID should be 4326");
  }

  @Test
  @DisplayName("saveAoi correctly parses a MultiPolygon with two non-overlapping polygons")
  void saveAoi_multiPolygon_bothPolygonsPersisted() throws Exception {
    mockSeedlotExists("12345");

    JsonNode geometry = geom("""
        {
          "type": "MultiPolygon",
          "coordinates": [
            [[[-123.5, 48.5], [-123.4, 48.5], [-123.4, 48.6], [-123.5, 48.6], [-123.5, 48.5]]],
            [[[-123.3, 48.3], [-123.2, 48.3], [-123.2, 48.4], [-123.3, 48.4], [-123.3, 48.3]]]
          ]
        }
        """);

    seedlotService.saveAoi("12345",
        new SaveSeedlotAoiDto(
            new GeoJsonFeature("Feature", geometry, null), List.of("CDF", "CWH")));

    MultiPolygon saved = capturePersistedGeometry();
    assertEquals(2, saved.getNumGeometries(),
        "Two non-overlapping polygons should both be persisted");
    // Each should be a ~0.01 x 0.1 degree rectangle
    for (int i = 0; i < 2; i++) {
      assertTrue(saved.getGeometryN(i).getArea() > 0,
          "Polygon " + i + " should have non-zero area");
    }
  }

  // ── Polygon repair + union ────────────────────────────────────────

  @Test
  @DisplayName("saveAoi unions overlapping polygons — area is not double-counted")
  void saveAoi_overlappingPolygons_areaNotDoubleCounted() throws Exception {
    mockSeedlotExists("12345");

    // Square A: (0,0)→(2,2) area=4. Square B: (1,1)→(3,3) area=4.
    // Overlap: (1,1)→(2,2) area=1. Correct union area = 4+4-1 = 7.
    JsonNode geometry = geom("""
        {
          "type": "MultiPolygon",
          "coordinates": [
            [[[0.0, 0.0], [2.0, 0.0], [2.0, 2.0], [0.0, 2.0], [0.0, 0.0]]],
            [[[1.0, 1.0], [3.0, 1.0], [3.0, 3.0], [1.0, 3.0], [1.0, 1.0]]]
          ]
        }
        """);

    seedlotService.saveAoi("12345",
        new SaveSeedlotAoiDto(new GeoJsonFeature("Feature", geometry, null), List.of()));

    MultiPolygon saved = capturePersistedGeometry();
    assertTrue(saved.isValid(), "Unioned geometry should be OGC-valid");
    assertEquals(1, saved.getNumGeometries(),
        "Overlapping polygons should be unioned into a single polygon");
    assertEquals(7.0, saved.getArea(), 1e-9,
        "Union area should be 7 (4+4-1), not 8 (double-counted overlap)");
    assertEquals(4326, saved.getSRID(), "SRID should be preserved after union");
  }

  @Test
  @DisplayName("saveAoi preserves non-overlapping polygons with correct individual areas")
  void saveAoi_nonOverlapping_correctAreas() throws Exception {
    mockSeedlotExists("12345");

    // Two 1x1 squares far apart
    JsonNode geometry = geom("""
        {
          "type": "MultiPolygon",
          "coordinates": [
            [[[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], [0.0, 0.0]]],
            [[[10.0, 10.0], [11.0, 10.0], [11.0, 11.0], [10.0, 11.0], [10.0, 10.0]]]
          ]
        }
        """);

    seedlotService.saveAoi("12345",
        new SaveSeedlotAoiDto(new GeoJsonFeature("Feature", geometry, null), List.of()));

    MultiPolygon saved = capturePersistedGeometry();
    assertEquals(2, saved.getNumGeometries(),
        "Non-overlapping polygons should remain separate");
    assertEquals(2.0, saved.getArea(), 1e-9,
        "Total area should be 2.0 (two 1x1 squares)");
    assertEquals(1.0, saved.getGeometryN(0).getArea(), 1e-9,
        "First polygon area should be 1.0");
    assertEquals(1.0, saved.getGeometryN(1).getArea(), 1e-9,
        "Second polygon area should be 1.0");
  }

  @Test
  @DisplayName("saveAoi repairs a self-intersecting bowtie to valid geometry with positive area")
  void saveAoi_selfIntersecting_repairedWithArea() throws Exception {
    mockSeedlotExists("12345");

    // Bowtie: (0,0)→(2,2)→(2,0)→(0,2)→(0,0) — self-intersects at (1,1)
    JsonNode geometry = geom("""
        {
          "type": "Polygon",
          "coordinates": [
            [[0.0, 0.0], [2.0, 2.0], [2.0, 0.0], [0.0, 2.0], [0.0, 0.0]]
          ]
        }
        """);

    seedlotService.saveAoi("12345",
        new SaveSeedlotAoiDto(new GeoJsonFeature("Feature", geometry, null), List.of()));

    MultiPolygon saved = capturePersistedGeometry();
    assertTrue(saved.isValid(), "Self-intersecting polygon should be repaired to OGC-valid");
    assertTrue(saved.getArea() > 0, "Repaired bowtie should have positive area");
    // buffer(0) repairs the bowtie by keeping the validly-wound portion.
    // The exact area depends on JTS winding-order resolution — assert it's
    // a known positive value rather than prescribing which triangle survives.
    assertEquals(1.0, saved.getArea(), 1e-9,
        "Repaired bowtie should have area 1.0 (one valid triangle from the self-intersection)");
  }

  // ── BEC zones echo ────────────────────────────────────────────────

  @Test
  @DisplayName("saveAoi echoes multiple BEC zones from the client request")
  void saveAoi_multipleBecZones_echoedInOrder() throws Exception {
    mockSeedlotExists("12345");

    JsonNode geometry = geom("""
        {
          "type": "Polygon",
          "coordinates": [
            [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], [0.0, 0.0]]
          ]
        }
        """);

    SaveSeedlotAoiResponseDto response = seedlotService.saveAoi("12345",
        new SaveSeedlotAoiDto(
            new GeoJsonFeature("Feature", geometry, null),
            List.of("CDF", "CWH", "MH")));

    assertEquals(List.of("CDF", "CWH", "MH"), response.becZones(),
        "BEC zones should be echoed in the same order as the request");
  }

  @Test
  @DisplayName("saveAoi returns empty becZones when client sends null")
  void saveAoi_nullBecZones_returnsEmptyList() throws Exception {
    mockSeedlotExists("12345");

    JsonNode geometry = geom("""
        {
          "type": "Polygon",
          "coordinates": [
            [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], [0.0, 0.0]]
          ]
        }
        """);

    SaveSeedlotAoiResponseDto response = seedlotService.saveAoi("12345",
        new SaveSeedlotAoiDto(new GeoJsonFeature("Feature", geometry, null), null));

    assertNotNull(response.becZones());
    assertTrue(response.becZones().isEmpty(),
        "Null becZones in request should produce empty list in response");
  }

  // ── Error cases ───────────────────────────────────────────────────

  @Test
  @DisplayName("saveAoi throws SeedlotNotFoundException for unknown seedlot")
  void saveAoi_unknownSeedlot_throwsNotFound() throws Exception {
    when(seedlotRepository.findById("99999")).thenReturn(Optional.empty());

    JsonNode geometry = geom("""
        {
          "type": "Polygon",
          "coordinates": [
            [[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], [0.0, 0.0]]
          ]
        }
        """);

    SaveSeedlotAoiDto request =
        new SaveSeedlotAoiDto(new GeoJsonFeature("Feature", geometry, null), List.of());

    assertThrows(SeedlotNotFoundException.class,
        () -> seedlotService.saveAoi("99999", request),
        "Should throw when seedlot number doesn't exist");
  }

  @Test
  @DisplayName("saveAoi throws InvalidSeedlotRequestException for null polygon")
  void saveAoi_nullPolygon_throwsBadRequest() {
    mockSeedlotExists("12345");

    assertThrows(InvalidSeedlotRequestException.class,
        () -> seedlotService.saveAoi("12345", new SaveSeedlotAoiDto(null, List.of())),
        "Should throw when polygon is null");
  }

  @Test
  @DisplayName("saveAoi throws InvalidSeedlotRequestException for null geometry inside feature")
  void saveAoi_nullGeometry_throwsBadRequest() {
    mockSeedlotExists("12345");

    assertThrows(InvalidSeedlotRequestException.class,
        () -> seedlotService.saveAoi("12345",
            new SaveSeedlotAoiDto(new GeoJsonFeature("Feature", null, null), List.of())),
        "Should throw when geometry node is null");
  }

  @Test
  @DisplayName("saveAoi rejects Point geometry — only Polygon and MultiPolygon are accepted")
  void saveAoi_pointGeometry_throwsBadRequest() throws Exception {
    mockSeedlotExists("12345");

    JsonNode geometry = geom("""
        { "type": "Point", "coordinates": [-123.5, 48.5] }
        """);

    assertThrows(InvalidSeedlotRequestException.class,
        () -> seedlotService.saveAoi("12345",
            new SaveSeedlotAoiDto(new GeoJsonFeature("Feature", geometry, null), List.of())),
        "Should throw for unsupported geometry type");
  }

  @Test
  @DisplayName("saveAoi rejects geometry missing the 'type' field")
  void saveAoi_missingTypeField_throwsBadRequest() throws Exception {
    mockSeedlotExists("12345");

    JsonNode geometry = geom("""
        { "coordinates": [[[0,0],[1,0],[1,1],[0,1],[0,0]]] }
        """);

    assertThrows(InvalidSeedlotRequestException.class,
        () -> seedlotService.saveAoi("12345",
            new SaveSeedlotAoiDto(new GeoJsonFeature("Feature", geometry, null), List.of())),
        "Should throw when geometry has no 'type' field");
  }

  @Test
  @DisplayName("saveAoi rejects geometry missing the 'coordinates' field")
  void saveAoi_missingCoordinatesField_throwsBadRequest() throws Exception {
    mockSeedlotExists("12345");

    JsonNode geometry = geom("""
        { "type": "Polygon" }
        """);

    assertThrows(InvalidSeedlotRequestException.class,
        () -> seedlotService.saveAoi("12345",
            new SaveSeedlotAoiDto(new GeoJsonFeature("Feature", geometry, null), List.of())),
        "Should throw when geometry has no 'coordinates' field");
  }
}
