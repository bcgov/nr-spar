package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CaculatedParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.dto.oracle.AreaOfUseDto;
import ca.bc.gov.backendstartapi.dto.oracle.AreaOfUseSpuGeoDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpzDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.ConeCollectionMethodNotFoundException;
import ca.bc.gov.backendstartapi.exception.MethodOfPaymentNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotFormValidationException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotParentTreeNotFoundException;
import ca.bc.gov.backendstartapi.exception.SmpMixNotFoundException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotOwnerQuantityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SeedlotFormPutTest {

  @Mock SeedlotRepository seedlotRepository;

  @Mock SeedlotSourceRepository seedlotSourceRepository;

  @Mock SeedlotStatusRepository seedlotStatusRepository;

  @Mock GeneticClassRepository geneticClassRepository;

  @Mock LoggedUserService loggedUserService;

  @Mock SeedlotCollectionMethodService seedlotCollectionMethodService;

  @Mock SeedlotCollectionMethodRepository seedlotCollectionMethodRepository;

  @Mock SeedlotOwnerQuantityService seedlotOwnerQuantityService;

  @Mock SeedlotOwnerQuantityRepository seedlotOwnerQuantityRepository;

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

  @BeforeEach
  void setup() {
    seedlotService =
        new SeedlotService(
            seedlotRepository,
            seedlotSourceRepository,
            seedlotStatusRepository,
            geneticClassRepository,
            loggedUserService,
            seedlotCollectionMethodService,
            seedlotCollectionMethodRepository,
            seedlotOwnerQuantityService,
            seedlotOwnerQuantityRepository,
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

  private SeedlotService seedlotService;

  private SeedlotFormSubmissionDto mockSeedlotFormDto(
      String itermFacilityDesc, String intermFacilityCode) {

    String optionalFacilityCode = intermFacilityCode == null ? "OCV" : intermFacilityCode;

    // step 1
    SeedlotFormCollectionDto collectionDto =
        new SeedlotFormCollectionDto(
            "00012797",
            "02",
            LocalDateTime.now(),
            LocalDateTime.now(),
            new BigDecimal("2"),
            new BigDecimal("4"),
            new BigDecimal("8"),
            "seedlot comment",
            List.of(1, 2));

    // step 2
    SeedlotFormOwnershipDto ownerDto =
        new SeedlotFormOwnershipDto(
            "00012797",
            "02",
            new BigDecimal("100"),
            new BigDecimal("100"),
            new BigDecimal("5"),
            "CLA",
            "ITC");

    // step 3
    SeedlotFormInterimDto interimDto =
        new SeedlotFormInterimDto(
            "00012797",
            "02",
            LocalDateTime.now(),
            LocalDateTime.now(),
            itermFacilityDesc,
            optionalFacilityCode);

    // step 4
    SeedlotFormOrchardDto orchardDto =
        new SeedlotFormOrchardDto(
            "405", null, "F3", "M3", false, true, false, 22, new BigDecimal("45.6"), "true");

    // step 5
    ParentTreeGeneticQualityDto ptgqDto =
        new ParentTreeGeneticQualityDto("BV", "GVO", new BigDecimal("18"));
    SeedlotFormParentTreeSmpDto parentTreeDto =
        new SeedlotFormParentTreeSmpDto(
            "87",
            4023,
            "87",
            new BigDecimal("1"),
            new BigDecimal("5"),
            6,
            2,
            50,
            new BigDecimal("100"),
            List.of(ptgqDto));

    // step 6
    SeedlotFormExtractionDto extractionDto =
        new SeedlotFormExtractionDto(
            "00012797",
            "02",
            LocalDateTime.now(),
            LocalDateTime.now(),
            "00012797",
            "02",
            LocalDateTime.now(),
            LocalDateTime.now());

    return new SeedlotFormSubmissionDto(
        collectionDto,
        List.of(ownerDto),
        interimDto,
        orchardDto,
        List.of(parentTreeDto),
        List.of(parentTreeDto),
        extractionDto,
        List.of(),
        null,
        List.of(),
        null);
  }

  @Test
  @DisplayName("Seedlot form submit - Seedlot not found")
  void submitSeedlotForm_seedlotNotFound_shouldFail() {
    when(seedlotRepository.findById("5432")).thenThrow(new SeedlotNotFoundException());

    Assertions.assertThrows(
        SeedlotNotFoundException.class,
        () -> {
          seedlotService.updateSeedlotWithForm(
              "5432", mockSeedlotFormDto(null, null), false, "SUB");
        });
  }

  @Test
  @DisplayName("Seedlot form submit - Cone Collection Method not found")
  void submitSeedlotForm_coneCollectionMethodNotFound_shouldFail() {
    Seedlot seedlot = new Seedlot("5432");
    SeedlotStatusEntity seedlotStatus = new SeedlotStatusEntity();
    seedlotStatus.setSeedlotStatusCode("PND");
    seedlot.setSeedlotStatus(seedlotStatus);

    when(seedlotRepository.findById("5432")).thenReturn(Optional.of(seedlot));

    doThrow(new ConeCollectionMethodNotFoundException())
        .when(seedlotCollectionMethodService)
        .saveSeedlotFormStep1(any(), any(), anyBoolean());

    Assertions.assertThrows(
        ConeCollectionMethodNotFoundException.class,
        () -> {
          seedlotService.updateSeedlotWithForm(
              "5432", mockSeedlotFormDto(null, null), false, "SUB");
        });
  }

  @Test
  @DisplayName("Seedlot form submit - Method of Payment not found")
  void submitSeedlotForm_methodOfPaymentNotFound_shouldFail() {
    Seedlot seedlot = new Seedlot("5432");
    SeedlotStatusEntity seedlotStatus = new SeedlotStatusEntity();
    seedlotStatus.setSeedlotStatusCode("PND");
    seedlot.setSeedlotStatus(seedlotStatus);
    when(seedlotRepository.findById("5432")).thenReturn(Optional.of(seedlot));

    doNothing()
        .when(seedlotCollectionMethodService)
        .saveSeedlotFormStep1(any(), any(), anyBoolean());

    doThrow(new MethodOfPaymentNotFoundException())
        .when(seedlotOwnerQuantityService)
        .saveSeedlotFormStep2(any(), any(), anyBoolean());

    Assertions.assertThrows(
        MethodOfPaymentNotFoundException.class,
        () -> {
          seedlotService.updateSeedlotWithForm(
              "5432", mockSeedlotFormDto(null, null), false, "SUB");
        });
  }

  @Test
  @DisplayName("Seedlot form submit - Seedlot Parent Tree not found")
  void submitSeedlotForm_seedlotParentTreeNotFound_shouldFail() {
    Seedlot seedlot = new Seedlot("5432");
    SeedlotStatusEntity seedlotStatus = new SeedlotStatusEntity();
    seedlotStatus.setSeedlotStatusCode("PND");
    seedlot.setSeedlotStatus(seedlotStatus);
    when(seedlotRepository.findById("5432")).thenReturn(Optional.of(seedlot));

    doNothing()
        .when(seedlotCollectionMethodService)
        .saveSeedlotFormStep1(any(), any(), anyBoolean());
    when(seedlotOwnerQuantityService.saveSeedlotFormStep2(any(), any(), anyBoolean()))
        .thenReturn(List.of());
    doNothing().when(seedlotOrchardService).saveSeedlotFormStep4(any(), any(), anyBoolean());
    when(seedlotParentTreeService.saveSeedlotFormStep5(any(), any(), anyBoolean()))
        .thenReturn(List.of());

    doThrow(new SeedlotParentTreeNotFoundException())
        .when(seedlotParentTreeGeneticQualityService)
        .saveSeedlotFormStep5(any(), any());

    Assertions.assertThrows(
        SeedlotParentTreeNotFoundException.class,
        () -> {
          seedlotService.updateSeedlotWithForm(
              "5432", mockSeedlotFormDto(null, null), false, "SUB");
        });
  }

  @Test
  @DisplayName("Seedlot form submit - Smp Mix not found")
  void submitSeedlotForm_smpMixNotFound_shouldFail() {
    Seedlot seedlot = new Seedlot("5432");
    SeedlotStatusEntity seedlotStatus = new SeedlotStatusEntity();
    seedlotStatus.setSeedlotStatusCode("PND");
    seedlot.setSeedlotStatus(seedlotStatus);
    when(seedlotRepository.findById("5432")).thenReturn(Optional.of(seedlot));

    doNothing()
        .when(seedlotCollectionMethodService)
        .saveSeedlotFormStep1(any(), any(), anyBoolean());
    when(seedlotOwnerQuantityService.saveSeedlotFormStep2(any(), any(), anyBoolean()))
        .thenReturn(List.of());
    doNothing().when(seedlotOrchardService).saveSeedlotFormStep4(any(), any(), anyBoolean());
    when(seedlotParentTreeService.saveSeedlotFormStep5(any(), any(), anyBoolean()))
        .thenReturn(List.of());
    doNothing().when(seedlotParentTreeGeneticQualityService).saveSeedlotFormStep5(any(), any());
    when(seedlotGeneticWorthService.saveSeedlotFormStep5(any(), any(), anyBoolean()))
        .thenReturn(List.of());
    when(smpMixService.saveSeedlotFormStep5(any(), any())).thenReturn(List.of());

    doThrow(new SmpMixNotFoundException())
        .when(smpMixGeneticQualityService)
        .saveSeedlotFormStep5(any(), any());

    Assertions.assertThrows(
        SmpMixNotFoundException.class,
        () -> {
          seedlotService.updateSeedlotWithForm(
              "5432", mockSeedlotFormDto(null, null), false, "SUB");
        });
  }

  @Test
  @DisplayName("Seedlot form submit - Facility type description not found")
  void submitSeedlotForm_facilityDescNotFound_shouldFail() {
    Seedlot seedlot = new Seedlot("5432");
    SeedlotStatusEntity seedlotStatus = new SeedlotStatusEntity();
    seedlotStatus.setSeedlotStatusCode("PND");
    seedlot.setSeedlotStatus(seedlotStatus);
    when(seedlotRepository.findById("5432")).thenReturn(Optional.of(seedlot));

    doNothing()
        .when(seedlotCollectionMethodService)
        .saveSeedlotFormStep1(any(), any(), anyBoolean());
    when(seedlotOwnerQuantityService.saveSeedlotFormStep2(any(), any(), anyBoolean()))
        .thenReturn(List.of());
    doNothing().when(seedlotOrchardService).saveSeedlotFormStep4(any(), any(), anyBoolean());
    when(seedlotParentTreeService.saveSeedlotFormStep5(any(), any(), anyBoolean()))
        .thenReturn(List.of());
    doNothing().when(seedlotParentTreeGeneticQualityService).saveSeedlotFormStep5(any(), any());
    when(seedlotGeneticWorthService.saveSeedlotFormStep5(any(), any(), anyBoolean()))
        .thenReturn(List.of());
    when(smpMixService.saveSeedlotFormStep5(any(), any())).thenReturn(List.of());
    doNothing().when(smpMixGeneticQualityService).saveSeedlotFormStep5(any(), any());
    doNothing()
        .when(seedlotParentTreeSmpMixService)
        .saveSeedlotFormStep5(any(), any(), anyBoolean());

    SeedlotStatusEntity ssEntity = new SeedlotStatusEntity();
    ssEntity.setSeedlotStatusCode("SUB");
    when(seedlotStatusService.getValidSeedlotStatus(any())).thenReturn(Optional.of(ssEntity));

    Assertions.assertThrows(
        SeedlotFormValidationException.class,
        () -> {
          seedlotService.updateSeedlotWithForm(
              "5432", mockSeedlotFormDto(null, "OTH"), false, "SUB");
        });

    Assertions.assertThrows(
        SeedlotFormValidationException.class,
        () -> {
          seedlotService.updateSeedlotWithForm("5432", mockSeedlotFormDto("", "OTH"), false, "SUB");
        });
  }

  @Test
  @DisplayName("Seedlot form submit - Success")
  void submitSeedlotForm_happyPath_shouldSucceed() {
    Seedlot seedlot = new Seedlot("5432");
    SeedlotStatusEntity seedlotStatus = new SeedlotStatusEntity();
    seedlotStatus.setSeedlotStatusCode("PND");
    seedlot.setSeedlotStatus(seedlotStatus);

    SeedlotSourceEntity seedSource = new SeedlotSourceEntity();
    seedSource.setSeedlotSourceCode("UNT");
    seedlot.setSeedlotSource(seedSource);
    when(seedlotRepository.findById("5432")).thenReturn(Optional.of(seedlot));

    doNothing()
        .when(seedlotCollectionMethodService)
        .saveSeedlotFormStep1(any(), any(), anyBoolean());
    when(seedlotOwnerQuantityService.saveSeedlotFormStep2(any(), any(), anyBoolean()))
        .thenReturn(List.of());
    doNothing().when(seedlotOrchardService).saveSeedlotFormStep4(any(), any(), anyBoolean());
    when(seedlotParentTreeService.saveSeedlotFormStep5(any(), any(), anyBoolean()))
        .thenReturn(List.of());
    doNothing().when(seedlotParentTreeGeneticQualityService).saveSeedlotFormStep5(any(), any());
    when(seedlotGeneticWorthService.saveSeedlotFormStep5(any(), any(), anyBoolean()))
        .thenReturn(List.of());
    when(smpMixService.saveSeedlotFormStep5(any(), any())).thenReturn(List.of());
    doNothing().when(smpMixGeneticQualityService).saveSeedlotFormStep5(any(), any());
    doNothing()
        .when(seedlotParentTreeSmpMixService)
        .saveSeedlotFormStep5(any(), any(), anyBoolean());

    SeedlotStatusEntity ssEntity = new SeedlotStatusEntity();
    ssEntity.setSeedlotStatusCode("SUB");
    when(seedlotStatusService.getValidSeedlotStatus(any())).thenReturn(Optional.of(ssEntity));

    // Parent tree contribution mock
    CaculatedParentTreeValsDto caculatedParentTreeValsDto = new CaculatedParentTreeValsDto();
    caculatedParentTreeValsDto.setNeValue(BigDecimal.valueOf(0));
    GeospatialRespondDto geospatialRespondDto =
        new GeospatialRespondDto(
            120, 12, 0, 23, 4, 0, BigDecimal.valueOf(120.22), BigDecimal.valueOf(23.44), 750);
    caculatedParentTreeValsDto.setGeospatialData(geospatialRespondDto);
    PtCalculationResDto ptCalculationResDto =
        new PtCalculationResDto(List.of(), caculatedParentTreeValsDto, geospatialRespondDto);
    when(parentTreeService.calculatePtVals(any())).thenReturn(ptCalculationResDto);

    SeedlotFormSubmissionDto mockedForm = mockSeedlotFormDto(null, null);

    // Set area of use mocks
    int activeSpuId = 3;
    String primaryOrchardId = mockedForm.seedlotFormOrchardDto().primaryOrchardId();
    Optional<ActiveOrchardSpuEntity> activeSpuOptional =
        Optional.of(new ActiveOrchardSpuEntity(primaryOrchardId, activeSpuId, true, false, false));
    when(orchardService.findSpuIdByOrchardWithActive(primaryOrchardId, true))
        .thenReturn(activeSpuOptional);
    when(orchardService.findSpuIdByOrchard(primaryOrchardId)).thenReturn(activeSpuOptional);

    AreaOfUseDto areaOfUseDto = new AreaOfUseDto();
    AreaOfUseSpuGeoDto areaOfUseSpuGeoDto = new AreaOfUseSpuGeoDto(1, 100, null, null, 3, 5);
    areaOfUseDto.setAreaOfUseSpuGeoDto(areaOfUseSpuGeoDto);

    SpzDto spzDto1 = new SpzDto("GL", "Georgia Lowlands", false);
    SpzDto spzDto2 = new SpzDto("M", "Maritime", true);
    List<SpzDto> spzList = List.of(spzDto1, spzDto2);
    areaOfUseDto.setSpzList(spzList);

    OrchardDto oracleOrchardRet =
        new OrchardDto(
            primaryOrchardId,
            "Primary Orchard",
            seedlot.getVegetationCode(),
            'S',
            "Seed Lot",
            "PRD",
            "SBS",
            "Sub-Boreal Spruce",
            "mk",
            '1',
            5);
    when(oracleApiProvider.findOrchardById(primaryOrchardId))
        .thenReturn(Optional.of(oracleOrchardRet));

    when(oracleApiProvider.getAreaOfUseData(activeSpuId)).thenReturn(Optional.of(areaOfUseDto));

    Optional<GeneticClassEntity> genClassOptional = Optional.of(new GeneticClassEntity());
    when(geneticClassRepository.findById("A")).thenReturn(genClassOptional);

    when(loggedUserService.getLoggedUserId()).thenReturn("meatball@Pasta");

    when(seedlotSeedPlanZoneRepository.saveAll(any())).thenReturn(List.of());

    SeedlotStatusResponseDto scDto =
        seedlotService.updateSeedlotWithForm("5432", mockedForm, false, "SUB");

    Assertions.assertNotNull(scDto);
    Assertions.assertEquals("5432", scDto.seedlotNumber());
    Assertions.assertEquals("SUB", scDto.seedlotStatusCode());

    Assertions.assertEquals(
        mockedForm.seedlotFormInterimDto().intermStrgClientNumber(),
        seedlot.getInterimStorageClientNumber());
    Assertions.assertEquals(
        mockedForm.seedlotFormInterimDto().intermStrgLocnCode(),
        seedlot.getInterimStorageLocationCode());
    Assertions.assertEquals(
        mockedForm.seedlotFormInterimDto().intermStrgStDate(),
        seedlot.getInterimStorageStartDate());
    Assertions.assertEquals(
        mockedForm.seedlotFormInterimDto().intermStrgEndDate(), seedlot.getInterimStorageEndDate());
    Assertions.assertEquals(
        mockedForm.seedlotFormInterimDto().intermOtherFacilityDesc(),
        seedlot.getInterimStorageOtherFacilityDesc());
    Assertions.assertEquals(
        mockedForm.seedlotFormInterimDto().intermFacilityCode(),
        seedlot.getInterimStorageFacilityCode());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().extractoryClientNumber(),
        seedlot.getExtractionClientNumber());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().extractoryLocnCode(),
        seedlot.getExtractionLocationCode());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().extractionStDate(), seedlot.getExtractionStartDate());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().extractionEndDate(), seedlot.getExtractionEndDate());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().storageClientNumber(),
        seedlot.getStorageClientNumber());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().storageLocnCode(), seedlot.getStorageLocationCode());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().temporaryStrgStartDate(),
        seedlot.getTemporaryStorageStartDate());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().temporaryStrgEndDate(),
        seedlot.getTemporaryStorageEndDate());
    // Area of use test
    assertEquals(areaOfUseSpuGeoDto.getElevationMax(), seedlot.getElevationMax());
    assertEquals(areaOfUseSpuGeoDto.getElevationMin(), seedlot.getElevationMin());
    assertEquals(geospatialRespondDto.getMeanLatitudeDegree(), seedlot.getLatitudeDegMax());
    assertEquals(geospatialRespondDto.getMeanLatitudeDegree(), seedlot.getLatitudeDegMin());
    assertEquals(areaOfUseSpuGeoDto.getLatitudeMinutesMax(), seedlot.getLatitudeMinMax());
    assertEquals(areaOfUseSpuGeoDto.getLatitudeMinutesMin(), seedlot.getLatitudeMinMin());
    assertEquals(0, seedlot.getLatitudeSecMax());
    assertEquals(0, seedlot.getLatitudeSecMin());
    assertEquals(geospatialRespondDto.getMeanLongitudeDegree(), seedlot.getLongitudeDegMax());
    assertEquals(geospatialRespondDto.getMeanLongitudeDegree(), seedlot.getLongitudeDegMin());
    assertEquals(geospatialRespondDto.getMeanLongitudeMinute(), seedlot.getLongitudeMinMax());
    assertEquals(geospatialRespondDto.getMeanLongitudeMinute(), seedlot.getLongitudeMinMin());
    assertEquals(0, seedlot.getLongitudeSecMax());
    assertEquals(0, seedlot.getLongitudeSecMin());
    // BEC values
    assertEquals(oracleOrchardRet.becZoneCode(), seedlot.getBgcZoneCode());
    assertEquals(oracleOrchardRet.becZoneDescription(), seedlot.getBgcZoneDescription());
    assertEquals(oracleOrchardRet.becSubzoneCode(), seedlot.getBgcSubzoneCode());
    assertEquals(oracleOrchardRet.variant(), seedlot.getVariant());
    assertEquals(oracleOrchardRet.becVersionId(), seedlot.getBecVersionId());
    // Declared Seedlot Value
    assertEquals(
        loggedUserService.getLoggedUserId(), seedlot.getDeclarationOfTrueInformationUserId());
    assertTrue(
        LocalDateTime.now()
            .minusSeconds(15L)
            .isBefore(seedlot.getDeclarationOfTrueInformationTimestamp()));
  }
}
