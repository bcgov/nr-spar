package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SeedPlanZoneDto;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotOrchardNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
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
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SeedlotServiceTest {

  @Mock SeedlotRepository seedlotRepository;

  @Mock SeedlotSourceRepository seedlotSourceRepository;

  @Mock SeedlotStatusRepository seedlotStatusRepository;

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

  @Mock Provider oracleApiProvider;

  private SeedlotService seedlotService;

  private static final String BAD_REQUEST_STR = "400 BAD_REQUEST \"Invalid Seedlot request\"";

  private static final String SEEDLOT_NOT_FOUND_STR = "404 NOT_FOUND \"Seedlot doesn't exist\"";

  private static final EffectiveDateRange DATE_RANGE =
      new EffectiveDateRange(LocalDate.now(), LocalDate.now());

  private SeedlotCreateDto createSeedlotDto() {
    return new SeedlotCreateDto(
        "00012797", "01", "user.lastname@domain.com", "FDI", "TPT", true, true, 'A');
  }

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
            oracleApiProvider);
  }

  @Test
  @DisplayName("createSeedlotSuccessTest")
  void createSeedlotTest_happyPath_shouldSucceed() {
    when(seedlotRepository.findNextSeedlotNumber(anyInt(), anyInt())).thenReturn(63000);

    SeedlotStatusEntity statusEntity = new SeedlotStatusEntity("PND", "Pending", DATE_RANGE);
    when(seedlotStatusRepository.findById("PND")).thenReturn(Optional.of(statusEntity));

    SeedlotSourceEntity sourceEntity =
        new SeedlotSourceEntity("TPT", "Tested Parent Trees", DATE_RANGE, null);
    when(seedlotSourceRepository.findById("TPT")).thenReturn(Optional.of(sourceEntity));

    Seedlot seedlot = new Seedlot("63000");
    when(seedlotRepository.save(seedlot)).thenReturn(seedlot);

    when(loggedUserService.getLoggedUserId()).thenReturn("imaveryhappyuserid@idir");

    GeneticClassEntity classEntity = new GeneticClassEntity("A", "A class seedlot", DATE_RANGE);
    when(geneticClassRepository.findById("A")).thenReturn(Optional.of(classEntity));

    SeedlotCreateResponseDto response = seedlotService.createSeedlot(createSeedlotDto());

    Assertions.assertNotNull(response);
  }

  @Test
  @DisplayName("testCreateSeedlotBClassNotImplementedYet")
  void createSeedlotTest_bClassSeedlot_shouldThrowException() {
    // B class - not implemented yet
    SeedlotCreateDto createDtoB =
        new SeedlotCreateDto(
            "00012797", "01", "user.lastname@domain.com", "FDI", "TPT", true, true, 'B');

    Exception excBclass =
        Assertions.assertThrows(
            InvalidSeedlotRequestException.class,
            () -> {
              seedlotService.createSeedlot(createDtoB);
            });

    Assertions.assertEquals(BAD_REQUEST_STR, excBclass.getMessage());
  }

  @Test
  @DisplayName("createSeedlotAClassWithoutStatusEntity")
  void createSeedlotTest_noSeedlotStatus_shouldThrowException() {
    when(seedlotRepository.findNextSeedlotNumber(anyInt(), anyInt())).thenReturn(63000);

    when(seedlotStatusRepository.findById("PND")).thenReturn(Optional.empty());

    Exception exc =
        Assertions.assertThrows(
            InvalidSeedlotRequestException.class,
            () -> {
              seedlotService.createSeedlot(createSeedlotDto());
            });

    Assertions.assertEquals(BAD_REQUEST_STR, exc.getMessage());
  }

  @Test
  @DisplayName("createSeedlotAClassWithoutGeneticClassEntity")
  void createSeedlotTest_noGeneticClass_shouldThrowException() {
    SeedlotStatusEntity statusEntity = new SeedlotStatusEntity("PND", "Pending", DATE_RANGE);
    when(seedlotStatusRepository.findById("PND")).thenReturn(Optional.of(statusEntity));

    when(geneticClassRepository.findById("A")).thenReturn(Optional.empty());

    Exception exc =
        Assertions.assertThrows(
            InvalidSeedlotRequestException.class,
            () -> {
              seedlotService.createSeedlot(createSeedlotDto());
            });

    Assertions.assertEquals(BAD_REQUEST_STR, exc.getMessage());
  }

  @Test
  @DisplayName("createSeedlotAClassWithoutSeedlotSourceEntity")
  void createSeedlotTest_noSeedlotSource_shouldThrowException() {
    when(seedlotRepository.findNextSeedlotNumber(anyInt(), anyInt())).thenReturn(63000);

    SeedlotStatusEntity statusEntity = new SeedlotStatusEntity("PND", "Pending", DATE_RANGE);
    when(seedlotStatusRepository.findById("PND")).thenReturn(Optional.of(statusEntity));

    GeneticClassEntity classEntity = new GeneticClassEntity("A", "A class seedlot", DATE_RANGE);
    when(geneticClassRepository.findById("A")).thenReturn(Optional.of(classEntity));

    when(seedlotSourceRepository.findById("TPT")).thenReturn(Optional.empty());

    Exception exc =
        Assertions.assertThrows(
            InvalidSeedlotRequestException.class,
            () -> {
              seedlotService.createSeedlot(createSeedlotDto());
            });

    Assertions.assertEquals(BAD_REQUEST_STR, exc.getMessage());
  }

  @Test
  @DisplayName("findSeedlotsByUserWithTwoSeedlots")
  void getUserSeedlots_findsTwoSeedlots_shouldSucceed() {
    String userId = "123456abcde@idir";

    List<Seedlot> testList = List.of(new Seedlot("63001"), new Seedlot("63002"));

    Page<Seedlot> pagedResult = new PageImpl<>(testList);

    when(seedlotRepository.findAllByAuditInformation_EntryUserId(anyString(), any()))
        .thenReturn(pagedResult);

    List<Seedlot> responseFromService =
        seedlotService.getUserSeedlots(userId, 0, 10).get().getContent();

    Assertions.assertNotNull(responseFromService);
    Assertions.assertEquals(2, responseFromService.size());
    Assertions.assertEquals("63001", responseFromService.get(0).getId());
    Assertions.assertEquals("63002", responseFromService.get(1).getId());
  }

  @Test
  @DisplayName("findSeedlotsByUserNoSeedlots")
  void getUserSeedlots_noSeedlots_shouldSucceed() {
    String userId = "userId";

    Page<Seedlot> pagedResult = new PageImpl<>(List.of());
    when(seedlotRepository.findAllByAuditInformation_EntryUserId(anyString(), any()))
        .thenReturn(pagedResult);

    List<Seedlot> responseFromService =
        seedlotService.getUserSeedlots(userId, 0, 10).get().getContent();

    Assertions.assertNotNull(responseFromService);
    Assertions.assertTrue(responseFromService.isEmpty());
  }

  @Test
  @DisplayName("findSeedlotsByUserNoPageSize")
  void getUserSeedlots_noPageSize_shouldSucceed() {
    String userId = "userId";

    Page<Seedlot> pagedResult = new PageImpl<>(List.of());
    when(seedlotRepository.findAllByAuditInformation_EntryUserId(anyString(), any()))
        .thenReturn(pagedResult);

    List<Seedlot> responseFromService =
        seedlotService.getUserSeedlots(userId, 0, 0).get().getContent();

    Assertions.assertNotNull(responseFromService);
    Assertions.assertTrue(responseFromService.isEmpty());
  }

  @DisplayName("findSingleSeedlotSuccessTest")
  void findSingleSeedlotSuccessTest() {
    Seedlot seedlotEntity = new Seedlot("0000000");

    when(seedlotRepository.findById("0000000")).thenReturn(Optional.of(seedlotEntity));

    Seedlot responseFromService = seedlotService.getSingleSeedlotInfo("0000000");

    Assertions.assertNotNull(responseFromService);
    Assertions.assertEquals(Optional.of(seedlotEntity), responseFromService);
  }

  @Test
  @DisplayName("findSingleSeedlotFailTest")
  void findSingleSeedlotFailTest() {
    String seedlotNumber = "123456";

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.empty());

    Exception exc =
        Assertions.assertThrows(
            SeedlotNotFoundException.class,
            () -> {
              seedlotService.getSingleSeedlotInfo(seedlotNumber);
            });

    Assertions.assertEquals(SEEDLOT_NOT_FOUND_STR, exc.getMessage());
  }

  @Test
  @DisplayName("patchSeedlotFailByIdTest")
  void patchSeedlotFailByIdTest() {
    String seedlotNumber = "123456";

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.empty());

    SeedlotApplicationPatchDto testDto =
        new SeedlotApplicationPatchDto("groot@wood.com", "CUS", false, false);

    Assertions.assertThrows(
        SeedlotNotFoundException.class,
        () -> {
          seedlotService.patchApplicantionInfo(seedlotNumber, testDto);
        });
  }

  @Test
  @DisplayName("patchSeedlotFailBySourceTest")
  void patchSeedlotFailBySourceTest() {
    String seedlotNumber = "123456";

    SeedlotApplicationPatchDto testDto =
        new SeedlotApplicationPatchDto("groot@wood.com", "PlanetX", false, false);

    when(seedlotRepository.findById(seedlotNumber))
        .thenReturn(Optional.of(new Seedlot(seedlotNumber)));

    when(seedlotSourceRepository.findById(testDto.seedlotSourceCode()))
        .thenReturn(Optional.empty());

    Assertions.assertThrows(
        SeedlotSourceNotFoundException.class,
        () -> {
          seedlotService.patchApplicantionInfo(seedlotNumber, testDto);
        });
  }

  @Test
  @DisplayName("patchSeedlotSuccessTest")
  void patchSeedlotSuccessTest() {
    String seedlotNumber = "123456";

    SeedlotApplicationPatchDto testDto =
        new SeedlotApplicationPatchDto("groot@wood.com", "CUS", true, false);

    Seedlot testSeedlot = new Seedlot(seedlotNumber);

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.of(testSeedlot));

    when(seedlotSourceRepository.findById(testDto.seedlotSourceCode()))
        .thenReturn(Optional.of(new SeedlotSourceEntity("CUS", "custom", DATE_RANGE, false)));

    // Returns the seedlot that's about to be saved os we can compare the object.
    when(seedlotRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

    Seedlot patchedSeedlot = seedlotService.patchApplicantionInfo(seedlotNumber, testDto);

    assertEquals(testDto.applicantEmailAddress(), patchedSeedlot.getApplicantEmailAddress());
    assertEquals(
        testDto.seedlotSourceCode(), patchedSeedlot.getSeedlotSource().getSeedlotSourceCode());
    assertEquals(testDto.toBeRegistrdInd(), patchedSeedlot.getIntendedForCrownLand());
    assertEquals(testDto.bcSourceInd(), patchedSeedlot.getSourceInBc());
  }

  @Test
  @DisplayName("Get seed plan zone data happy path should success")
  void getSeedPlanZoneData_success_shouldSucceed() {
    String seedlotNumber = "63022";
    Seedlot seedlot = new Seedlot(seedlotNumber);
    seedlot.setVegetationCode("FDC");
    seedlot.setElevationMax(700);
    seedlot.setElevationMin(1);

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.of(seedlot));

    String orchardId = "405";
    SeedlotOrchard seedlotOrchard = new SeedlotOrchard(seedlot, orchardId);
    when(seedlotOrchardService.getAllSeedlotOrchardBySeedlotNumber(seedlotNumber))
        .thenReturn(List.of(seedlotOrchard));

    GeneticClassEntity classEntity = new GeneticClassEntity();
    classEntity.setGeneticClassCode("A");
    SeedlotSeedPlanZoneEntity sspzEntity =
        new SeedlotSeedPlanZoneEntity(seedlot, "M", 40, classEntity);
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id(seedlotNumber))
        .thenReturn(List.of(sspzEntity));

    ActiveOrchardSpuEntity activeSpu = new ActiveOrchardSpuEntity(orchardId, 7, true, false, false);
    when(orchardService.findSpuIdByOrchardWithActive(orchardId, true))
        .thenReturn(Optional.of(activeSpu));

    List<SeedPlanZoneDto> seedPlanZoneDto = seedlotService.getSeedPlanZoneData(seedlotNumber);

    Assertions.assertFalse(seedPlanZoneDto.isEmpty());
    Assertions.assertEquals(
        activeSpu.getSeedPlanningUnitId(), seedPlanZoneDto.get(0).getSeedPlanUnitId());
    Assertions.assertEquals(
        sspzEntity.getSeedPlanZoneId(), seedPlanZoneDto.get(0).getSeedPlanZoneId());
    Assertions.assertEquals(
        classEntity.getGeneticClassCode().charAt(0), seedPlanZoneDto.get(0).getGeneticClassCode());
    Assertions.assertEquals(
        sspzEntity.getSeedPlanZoneCode(), seedPlanZoneDto.get(0).getSeedPlanZoneCode());
    Assertions.assertEquals(
        seedlot.getVegetationCode(), seedPlanZoneDto.get(0).getVegetationCode());
    Assertions.assertEquals(seedlot.getElevationMin(), seedPlanZoneDto.get(0).getElevationMin());
    Assertions.assertEquals(seedlot.getElevationMax(), seedPlanZoneDto.get(0).getElevationMax());
  }

  @Test
  @DisplayName("Get seed plan zone data seedlot not found should fail")
  void getSeedPlanZoneData_seedlotNotFound_shouldFail() {
    String seedlotNumber = "63022";

    when(seedlotRepository.findById(seedlotNumber)).thenThrow(new SeedlotNotFoundException());

    Assertions.assertThrows(
        SeedlotNotFoundException.class,
        () -> {
          seedlotService.getSeedPlanZoneData(seedlotNumber);
        });
  }

  @Test
  @DisplayName("Get seed plan zone data seedlot x orchard not found should fail")
  void getSeedPlanZoneData_seedlotOrchardNotFound_shouldFail() {
    String seedlotNumber = "63022";
    Seedlot seedlot = new Seedlot(seedlotNumber);
    seedlot.setVegetationCode("FDC");
    seedlot.setElevationMax(700);
    seedlot.setElevationMin(1);

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.of(seedlot));

    when(seedlotOrchardService.getAllSeedlotOrchardBySeedlotNumber(seedlotNumber))
        .thenThrow(new SeedlotOrchardNotFoundException());

    Assertions.assertThrows(
        SeedlotOrchardNotFoundException.class,
        () -> {
          seedlotService.getSeedPlanZoneData(seedlotNumber);
        });
  }
}
