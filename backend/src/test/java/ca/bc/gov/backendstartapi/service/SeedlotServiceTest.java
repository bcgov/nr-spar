package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.ConeCollectionMethodNotFoundException;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.MethodOfPaymentNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotParentTreeNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.exception.SmpMixNotFoundException;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

  private SeedlotService seedlotService;

  private static final String BAD_REQUEST_STR = "400 BAD_REQUEST \"Invalid Seedlot request\"";

  private static final String SEEDLOT_NOT_FOUND_STR = "404 NOT_FOUND \"Seedlot doesn't exist\"";

  private static final EffectiveDateRange DATE_RANGE =
      new EffectiveDateRange(LocalDate.now(), LocalDate.now());

  private SeedlotCreateDto createSeedlotDto() {
    return new SeedlotCreateDto(
        "00012797", "01", "user.lastname@domain.com", "FDI", "TPT", true, true, 'A');
  }

  private SeedlotFormSubmissionDto mockSeedlotFormDto() {
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
            "00012797", "02", LocalDateTime.now(), LocalDateTime.now(), "Some location", "OCV");

    // step 4
    SeedlotFormOrchardDto orchardDto =
        new SeedlotFormOrchardDto(
            List.of("405"), "F3", "M3", false, true, false, 22, new BigDecimal("45.6"), "true");

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
        extractionDto);
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
            seedlotStatusService);
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
  @DisplayName("Seedlot form submit - Seedlot not found")
  void submitSeedlotForm_seedlotNotFound_shouldFail() {
    when(seedlotRepository.findById("5432")).thenThrow(new SeedlotNotFoundException());

    Assertions.assertThrows(
        SeedlotNotFoundException.class,
        () -> {
          seedlotService.submitSeedlotForm("5432", mockSeedlotFormDto());
        });
  }

  @Test
  @DisplayName("Seedlot form submit - Cone Collection Method not found")
  void submitSeedlotForm_coneCollectionMethodNotFound_shouldFail() {
    Seedlot seedlot = new Seedlot("5432");
    when(seedlotRepository.findById("5432")).thenReturn(Optional.of(seedlot));

    doThrow(new ConeCollectionMethodNotFoundException())
        .when(seedlotCollectionMethodService)
        .saveSeedlotFormStep1(any(), any());

    Assertions.assertThrows(
        ConeCollectionMethodNotFoundException.class,
        () -> {
          seedlotService.submitSeedlotForm("5432", mockSeedlotFormDto());
        });
  }

  @Test
  @DisplayName("Seedlot form submit - Method of Payment not found")
  void submitSeedlotForm_methodOfPaymentNotFound_shouldFail() {
    Seedlot seedlot = new Seedlot("5432");
    when(seedlotRepository.findById("5432")).thenReturn(Optional.of(seedlot));

    doNothing().when(seedlotCollectionMethodService).saveSeedlotFormStep1(any(), any());

    doThrow(new MethodOfPaymentNotFoundException())
        .when(seedlotOwnerQuantityService)
        .saveSeedlotFormStep2(any(), any());

    Assertions.assertThrows(
        MethodOfPaymentNotFoundException.class,
        () -> {
          seedlotService.submitSeedlotForm("5432", mockSeedlotFormDto());
        });
  }

  @Test
  @DisplayName("Seedlot form submit - Seedlot Parent Tree not found")
  void submitSeedlotForm_seedlotParentTreeNotFound_shouldFail() {
    Seedlot seedlot = new Seedlot("5432");
    when(seedlotRepository.findById("5432")).thenReturn(Optional.of(seedlot));

    doNothing().when(seedlotCollectionMethodService).saveSeedlotFormStep1(any(), any());
    doNothing().when(seedlotOwnerQuantityService).saveSeedlotFormStep2(any(), any());
    doNothing().when(seedlotOrchardService).saveSeedlotFormStep4(any(), any());
    doNothing().when(seedlotParentTreeService).saveSeedlotFormStep5(any(), any());

    doThrow(new SeedlotParentTreeNotFoundException())
        .when(seedlotParentTreeGeneticQualityService)
        .saveSeedlotFormStep5(any(), any());

    Assertions.assertThrows(
        SeedlotParentTreeNotFoundException.class,
        () -> {
          seedlotService.submitSeedlotForm("5432", mockSeedlotFormDto());
        });
  }

  @Test
  @DisplayName("Seedlot form submit - Smp Mix not found")
  void submitSeedlotForm_smpMixNotFound_shouldFail() {
    Seedlot seedlot = new Seedlot("5432");
    when(seedlotRepository.findById("5432")).thenReturn(Optional.of(seedlot));

    doNothing().when(seedlotCollectionMethodService).saveSeedlotFormStep1(any(), any());
    doNothing().when(seedlotOwnerQuantityService).saveSeedlotFormStep2(any(), any());
    doNothing().when(seedlotOrchardService).saveSeedlotFormStep4(any(), any());
    doNothing().when(seedlotParentTreeService).saveSeedlotFormStep5(any(), any());
    doNothing().when(seedlotParentTreeGeneticQualityService).saveSeedlotFormStep5(any(), any());
    doNothing().when(seedlotGeneticWorthService).saveSeedlotFormStep5(any(), any());
    doNothing().when(smpMixService).saveSeedlotFormStep5(any(), any());

    doThrow(new SmpMixNotFoundException())
        .when(smpMixGeneticQualityService)
        .saveSeedlotFormStep5(any(), any());

    Assertions.assertThrows(
        SmpMixNotFoundException.class,
        () -> {
          seedlotService.submitSeedlotForm("5432", mockSeedlotFormDto());
        });
  }

  @Test
  @DisplayName("Seedlot form submit - Success")
  void submitSeedlotForm_happyPath_shouldSucceed() {
    Seedlot seedlot = new Seedlot("5432");
    when(seedlotRepository.findById("5432")).thenReturn(Optional.of(seedlot));

    doNothing().when(seedlotCollectionMethodService).saveSeedlotFormStep1(any(), any());
    doNothing().when(seedlotOwnerQuantityService).saveSeedlotFormStep2(any(), any());
    doNothing().when(seedlotOrchardService).saveSeedlotFormStep4(any(), any());
    doNothing().when(seedlotParentTreeService).saveSeedlotFormStep5(any(), any());
    doNothing().when(seedlotParentTreeGeneticQualityService).saveSeedlotFormStep5(any(), any());
    doNothing().when(seedlotGeneticWorthService).saveSeedlotFormStep5(any(), any());
    doNothing().when(smpMixService).saveSeedlotFormStep5(any(), any());
    doNothing().when(smpMixGeneticQualityService).saveSeedlotFormStep5(any(), any());
    doNothing().when(seedlotParentTreeSmpMixService).saveSeedlotFormStep5(any(), any());

    SeedlotStatusEntity ssEntity = new SeedlotStatusEntity();
    ssEntity.setSeedlotStatusCode("SUB");
    when(seedlotStatusService.getValidSeedlotStatus(any())).thenReturn(Optional.of(ssEntity));

    SeedlotFormSubmissionDto mockedForm = mockSeedlotFormDto();
    SeedlotCreateResponseDto scDto = seedlotService.submitSeedlotForm("5432", mockedForm);

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
        mockedForm.seedlotFormInterimDto().intermStrgEndDate(),
        seedlot.getInterimStorageEndDate());
    Assertions.assertEquals(
        mockedForm.seedlotFormInterimDto().intermStrgLocn(),
        seedlot.getInterimStorageLocationDescription());
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
        mockedForm.seedlotFormExtractionDto().extractionStDate(),
        seedlot.getExtractionStartDate());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().extractionEndDate(),
        seedlot.getExtractionEndDate());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().storageClientNumber(),
        seedlot.getStorageClientNumber());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().storageLocnCode(),
        seedlot.getStorageLocationCode());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().temporaryStrgStartDate(),
        seedlot.getTemporaryStorageStartDate());
    Assertions.assertEquals(
        mockedForm.seedlotFormExtractionDto().temporaryStrgEndDate(),
        seedlot.getTemporaryStorageEndDate());
  }
}
