package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.oracle.SpzDto;
import ca.bc.gov.backendstartapi.dto.oracle.TransferLimitDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.OracleApiProviderException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BclassAreaOfUseServiceTest {

  @Mock private SeedlotSeedPlanZoneRepository seedlotSeedPlanZoneRepository;

  @Mock private SeedlotGeneticWorthService seedlotGeneticWorthService;

  @Mock private GeneticClassRepository geneticClassRepository;

  @Mock private LoggedUserService loggedUserService;

  @Mock private Provider oracleApiProvider;

  private BclassAreaOfUseService service;

  @BeforeEach
  void setup() {
    service =
        new BclassAreaOfUseService(
            seedlotSeedPlanZoneRepository,
            seedlotGeneticWorthService,
            geneticClassRepository,
            loggedUserService,
            oracleApiProvider);
  }

  private Seedlot seedlot() {
    Seedlot seedlot = new Seedlot("63001");
    GeneticClassEntity classB = mock(GeneticClassEntity.class);
    lenient().when(classB.getGeneticClassCode()).thenReturn("B");
    seedlot.setGeneticClass(classB);
    seedlot.setVegetationCode("FDC");
    seedlot.setSourceInBc(true);
    seedlot.setSeedPlanZoneCode("M");
    seedlot.setCollectionElevation(450);
    seedlot.setCollectionLatitudeDeg(52);
    seedlot.setCollectionLatitudeMin(20);
    seedlot.setCollectionLatitudeSec(15);
    seedlot.setCollectionLongitudeDeg(124);
    seedlot.setCollectionLongitudeMin(15);
    seedlot.setCollectionLongitudeSec(0);
    return seedlot;
  }

  private TransferLimitDto limit(
      long skey, String veg, Boolean superior, String coastInterior, String spz, int up) {
    return new TransferLimitDto(
        skey, veg, "B", superior, coastInterior, spz, 48, 60,
        3, 0, 2, 0, 2, 0, 3, 0, up, 350);
  }

  private void stubSpzSave() {
    when(geneticClassRepository.findById("B"))
        .thenReturn(Optional.of(mock(GeneticClassEntity.class)));
    when(oracleApiProvider.getSpzListByVegCode("FDC", "B"))
        .thenReturn(List.of(new SpzDto("M", "Maritime", false)));
  }

  @Test
  @DisplayName("From PND: replaces zones, clears GW and derives geography from the first match")
  void pendingStandardLot() {
    Seedlot seedlot = seedlot();
    seedlot.setElevationMax(9999);
    SeedlotSeedPlanZoneEntity oldSpz = mock(SeedlotSeedPlanZoneEntity.class);
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id("63001")).thenReturn(List.of(oldSpz));
    stubSpzSave();
    when(oracleApiProvider.getSpzCoastInteriorCode("M")).thenReturn(Optional.of("C"));
    when(oracleApiProvider.searchTransferLimits("FDC", "B", false, "C", "M", 52))
        .thenReturn(
            List.of(
                // null superior flag: matched by includeNullMatches, but not by legacy
                limit(9L, "FDC", null, "C", "M", 100),
                limit(2L, "FDC", false, "C", "M", 350),
                limit(1L, null, false, "C", null, 200)));

    service.deriveAreaOfUse(seedlot, "PND");

    verify(seedlotSeedPlanZoneRepository).deleteAll(List.of(oldSpz));
    verify(seedlotGeneticWorthService).deleteAllBySeedlot(seedlot);
    ArgumentCaptor<SeedlotSeedPlanZoneEntity> spz =
        ArgumentCaptor.forClass(SeedlotSeedPlanZoneEntity.class);
    verify(seedlotSeedPlanZoneRepository).save(spz.capture());
    assertEquals("M", spz.getValue().getSpzCode());
    assertEquals("Maritime", spz.getValue().getSpzDescription());
    assertFalse(spz.getValue().getIsPrimary());
    // limit 2: up 350
    assertEquals(100, seedlot.getElevationMin());
    assertEquals(800, seedlot.getElevationMax());
    assertEquals(50, seedlot.getLatitudeDegMin());
    assertEquals(55, seedlot.getLatitudeDegMax());
  }

  @Test
  @DisplayName("No transfer limit: GW and zone still set, geography left blank, no error")
  void noTransferLimit() {
    Seedlot seedlot = seedlot();
    seedlot.setElevationMin(10);
    seedlot.setLatitudeDegMax(59);
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id("63001")).thenReturn(List.of());
    stubSpzSave();
    when(oracleApiProvider.getSpzCoastInteriorCode("M")).thenReturn(Optional.of("C"));
    when(oracleApiProvider.searchTransferLimits(any(), any(), any(), any(), any(), any()))
        .thenReturn(List.of(limit(4L, "FDC", false, "I", "M", 350)));

    service.deriveAreaOfUse(seedlot, "INC");

    verify(seedlotGeneticWorthService).deleteAllBySeedlot(seedlot);
    verify(seedlotSeedPlanZoneRepository).save(any());
    assertNull(seedlot.getElevationMin());
    assertNull(seedlot.getLatitudeDegMax());
  }

  @Test
  @DisplayName("From SUB: existing zones are kept and only empty geography is filled")
  void submittedLotFillsOnlyEmpty() {
    Seedlot seedlot = seedlot();
    seedlot.setElevationMin(300);
    seedlot.setElevationMax(600);
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id("63001"))
        .thenReturn(List.of(mock(SeedlotSeedPlanZoneEntity.class)));
    when(oracleApiProvider.getSpzCoastInteriorCode("M")).thenReturn(Optional.of("C"));
    when(oracleApiProvider.searchTransferLimits(any(), any(), any(), any(), any(), any()))
        .thenReturn(List.of(limit(2L, "FDC", false, "C", "M", 350)));

    service.deriveAreaOfUse(seedlot, "SUB");

    verify(seedlotSeedPlanZoneRepository, never()).deleteAll(any());
    verify(seedlotSeedPlanZoneRepository, never()).save(any());
    assertEquals(300, seedlot.getElevationMin());
    assertEquals(600, seedlot.getElevationMax());
    assertEquals(50, seedlot.getLatitudeDegMin());
  }

  @Test
  @DisplayName("Not BC source: blanks from PND but derives nothing")
  void notBcSource() {
    Seedlot seedlot = seedlot();
    seedlot.setSourceInBc(false);
    seedlot.setElevationMin(300);
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id("63001")).thenReturn(List.of());

    service.deriveAreaOfUse(seedlot, "PND");

    assertNull(seedlot.getElevationMin());
    verifyNoInteractions(seedlotGeneticWorthService, oracleApiProvider);
  }

  @Test
  @DisplayName("Migrated B+ lot (has a provenance id) from PND: everything left untouched")
  void superiorProvenance() {
    Seedlot seedlot = seedlot();
    seedlot.setProvenanceId(7);
    seedlot.setElevationMin(300);
    seedlot.setLatitudeDegMax(57);

    service.deriveAreaOfUse(seedlot, "PND");

    assertEquals(300, seedlot.getElevationMin());
    assertEquals(57, seedlot.getLatitudeDegMax());
    verifyNoInteractions(
        seedlotSeedPlanZoneRepository, seedlotGeneticWorthService, oracleApiProvider);
  }

  @Test
  @DisplayName("Missing collection latitude finds no limit without calling oracle-api")
  void missingCollectionLatitude() {
    Seedlot seedlot = seedlot();
    seedlot.setCollectionLatitudeDeg(null);
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id("63001")).thenReturn(List.of());
    stubSpzSave();

    service.deriveAreaOfUse(seedlot, "PND");

    verify(oracleApiProvider, never())
        .searchTransferLimits(any(), any(), any(), any(), any(), any());
    assertNull(seedlot.getLatitudeDegMin());
  }

  @Test
  @DisplayName("Missing collection SPZ: interior, no zone saved, only all-zone rows match")
  void missingCollectionSpz() {
    Seedlot seedlot = seedlot();
    seedlot.setSeedPlanZoneCode(null);
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id("63001")).thenReturn(List.of());
    when(oracleApiProvider.searchTransferLimits(
            eq("FDC"), eq("B"), eq(false), eq("I"), isNull(), eq(52)))
        .thenReturn(
            List.of(
                limit(7L, "FDC", false, "I", "EK", 100),
                limit(8L, null, false, "I", null, 200)));

    service.deriveAreaOfUse(seedlot, "PND");

    verify(oracleApiProvider, never()).getSpzCoastInteriorCode(anyString());
    verify(seedlotSeedPlanZoneRepository, never()).save(any());
    // limit 8: up 200
    assertEquals(650, seedlot.getElevationMax());
  }

  @Test
  @DisplayName("Rejects a seedlot that is not class B")
  void notClassB() {
    Seedlot seedlot = seedlot();
    GeneticClassEntity classA = mock(GeneticClassEntity.class);
    when(classA.getGeneticClassCode()).thenReturn("A");
    seedlot.setGeneticClass(classA);

    assertThrows(IllegalArgumentException.class, () -> service.deriveAreaOfUse(seedlot, "PND"));
    verifyNoInteractions(seedlotSeedPlanZoneRepository, oracleApiProvider);
  }

  @Test
  @DisplayName("No coast/interior answer from oracle-api fails instead of guessing")
  void missingCoastInteriorAnswer() {
    Seedlot seedlot = seedlot();
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id("63001")).thenReturn(List.of());
    stubSpzSave();
    when(oracleApiProvider.getSpzCoastInteriorCode("M")).thenReturn(Optional.empty());

    assertThrows(
        OracleApiProviderException.class, () -> service.deriveAreaOfUse(seedlot, "PND"));
    verify(oracleApiProvider, never())
        .searchTransferLimits(any(), any(), any(), any(), any(), any());
  }

  @Test
  @DisplayName("Expired zone keeps its stored description, then falls back to the code")
  void expiredZoneDescription() {
    Seedlot seedlot = seedlot();
    SeedlotSeedPlanZoneEntity oldSpz = mock(SeedlotSeedPlanZoneEntity.class);
    when(oldSpz.getSpzCode()).thenReturn("M");
    when(oldSpz.getSpzDescription()).thenReturn("Maritime (expired)");
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id("63001")).thenReturn(List.of(oldSpz));
    when(geneticClassRepository.findById("B"))
        .thenReturn(Optional.of(mock(GeneticClassEntity.class)));
    when(oracleApiProvider.getSpzListByVegCode("FDC", "B")).thenReturn(List.of());
    when(oracleApiProvider.getSpzCoastInteriorCode("M")).thenReturn(Optional.of("C"));

    service.deriveAreaOfUse(seedlot, "PND");

    ArgumentCaptor<SeedlotSeedPlanZoneEntity> spz =
        ArgumentCaptor.forClass(SeedlotSeedPlanZoneEntity.class);
    verify(seedlotSeedPlanZoneRepository).save(spz.capture());
    assertEquals("Maritime (expired)", spz.getValue().getSpzDescription());
  }

  @Test
  @DisplayName("Zone with no current or stored description uses the code")
  void zoneDescriptionFallsBackToCode() {
    Seedlot seedlot = seedlot();
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id("63001")).thenReturn(List.of());
    when(geneticClassRepository.findById("B"))
        .thenReturn(Optional.of(mock(GeneticClassEntity.class)));
    when(oracleApiProvider.getSpzListByVegCode("FDC", "B")).thenReturn(List.of());
    when(oracleApiProvider.getSpzCoastInteriorCode("M")).thenReturn(Optional.of("C"));

    service.deriveAreaOfUse(seedlot, "PND");

    ArgumentCaptor<SeedlotSeedPlanZoneEntity> spz =
        ArgumentCaptor.forClass(SeedlotSeedPlanZoneEntity.class);
    verify(seedlotSeedPlanZoneRepository).save(spz.capture());
    assertEquals("M", spz.getValue().getSpzDescription());
  }

  @Test
  @DisplayName("Expired zone with a null stored description uses the code")
  void expiredZoneNullStoredDescription() {
    Seedlot seedlot = seedlot();
    SeedlotSeedPlanZoneEntity oldSpz = mock(SeedlotSeedPlanZoneEntity.class);
    when(oldSpz.getSpzCode()).thenReturn("M");
    when(oldSpz.getSpzDescription()).thenReturn(null);
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id("63001")).thenReturn(List.of(oldSpz));
    when(geneticClassRepository.findById("B"))
        .thenReturn(Optional.of(mock(GeneticClassEntity.class)));
    when(oracleApiProvider.getSpzListByVegCode("FDC", "B")).thenReturn(List.of());
    when(oracleApiProvider.getSpzCoastInteriorCode("M")).thenReturn(Optional.of("C"));

    service.deriveAreaOfUse(seedlot, "PND");

    ArgumentCaptor<SeedlotSeedPlanZoneEntity> spz =
        ArgumentCaptor.forClass(SeedlotSeedPlanZoneEntity.class);
    verify(seedlotSeedPlanZoneRepository).save(spz.capture());
    assertEquals("M", spz.getValue().getSpzDescription());
  }
}
