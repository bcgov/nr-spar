package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotAclassFormDto;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOwnerQuantity;
import ca.bc.gov.backendstartapi.exception.ClientIdForbiddenException;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotOwnerQuantityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.security.UserInfo;
import java.math.BigDecimal;
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

  private SeedlotService seedlotService;

  private static final String BAD_REQUEST_STR = "400 BAD_REQUEST \"Invalid Seedlot request\"";

  private static final String SEEDLOT_NOT_FOUND_STR = "404 NOT_FOUND \"Seedlot doesn't exist\"";

  private static final EffectiveDateRange DATE_RANGE =
      new EffectiveDateRange(LocalDate.now(), LocalDate.now());

  private SeedlotCreateDto createSeedlotDto() {
    return new SeedlotCreateDto(
        "00012797", "01", "user.lastname@domain.com", "FDI", "TPT", true, true, 'A');
  }

  private ParentTreeGeneticQualityDto createParentTreeGenQuaDto() {
    return new ParentTreeGeneticQualityDto("BV", "GVO", new BigDecimal("18"));
  }

  private SeedlotFormParentTreeSmpDto createParentTreeDto(Integer parentTreeId) {
    ParentTreeGeneticQualityDto ptgqDto = createParentTreeGenQuaDto();
    return new SeedlotFormParentTreeSmpDto(
        "85",
        parentTreeId,
        "87",
        new BigDecimal("1"),
        new BigDecimal("5"),
        6,
        2,
        50,
        new BigDecimal("100"),
        List.of(ptgqDto));
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

    SeedlotStatusResponseDto response = seedlotService.createSeedlot(createSeedlotDto());

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
  @DisplayName("findSeedlotsByClientIdWithTwoSeedlots")
  void getClientSeedlots_findsTwoSeedlots_shouldSucceed() {
    String clientId = "00011223";

    List<Seedlot> testList = List.of(new Seedlot("63001"), new Seedlot("63002"));

    Page<Seedlot> pagedResult = new PageImpl<>(testList);

    when(seedlotRepository.findAllByApplicantClientNumber(anyString(), any()))
        .thenReturn(pagedResult);

    when(loggedUserService.getLoggedUserInfo()).thenReturn(Optional.of(UserInfo.createDevUser()));

    List<Seedlot> responseFromService =
        seedlotService.getSeedlotByClientId(clientId, 0, 10).get().getContent();

    Assertions.assertNotNull(responseFromService);
    Assertions.assertEquals(2, responseFromService.size());
    Assertions.assertEquals("63001", responseFromService.get(0).getId());
    Assertions.assertEquals("63002", responseFromService.get(1).getId());
  }

  @Test
  @DisplayName("findSeedlotsByClientIdNoSeedlots")
  void getUserSeedlots_noSeedlots_shouldSucceed() {
    String clientId = "00011223";

    Page<Seedlot> pagedResult = new PageImpl<>(List.of());
    when(seedlotRepository.findAllByApplicantClientNumber(anyString(), any()))
        .thenReturn(pagedResult);

    when(loggedUserService.getLoggedUserInfo()).thenReturn(Optional.of(UserInfo.createDevUser()));

    List<Seedlot> responseFromService =
        seedlotService.getSeedlotByClientId(clientId, 0, 10).get().getContent();

    Assertions.assertNotNull(responseFromService);
    Assertions.assertTrue(responseFromService.isEmpty());
  }

  @Test
  @DisplayName("findSeedlotsByClientIdNoPageSize")
  void getUserSeedlots_noPageSize_shouldSucceed() {
    String clientId = "00011223";

    Page<Seedlot> pagedResult = new PageImpl<>(List.of());
    when(seedlotRepository.findAllByApplicantClientNumber(anyString(), any()))
        .thenReturn(pagedResult);

    when(loggedUserService.getLoggedUserInfo()).thenReturn(Optional.of(UserInfo.createDevUser()));

    List<Seedlot> responseFromService =
        seedlotService.getSeedlotByClientId(clientId, 0, 0).get().getContent();

    Assertions.assertNotNull(responseFromService);
    Assertions.assertTrue(responseFromService.isEmpty());
  }

  @Test
  @DisplayName("findSeedlotsByUserClientIdForbidden")
  void getUserSeedlots_forbidden_shouldFail() {
    when(loggedUserService.getLoggedUserInfo()).thenReturn(Optional.of(UserInfo.createDevUser()));

    Assertions.assertThrows(
        ClientIdForbiddenException.class,
        () -> {
          seedlotService.getSeedlotByClientId("1234", 0, 0);
        });
  }

  @Test
  @DisplayName("findSingleSeedlotSuccessTest")
  void findSingleSeedlotSuccessTest() {
    String seedlotId = "0000000";
    Seedlot seedlotEntity = new Seedlot(seedlotId);

    when(seedlotRepository.findById(seedlotId)).thenReturn(Optional.of(seedlotEntity));
    when(seedlotSeedPlanZoneRepository.findAllBySeedlot_id(seedlotId)).thenReturn(List.of());

    SeedlotDto responseFromService = seedlotService.getSingleSeedlotInfo(seedlotId);

    Assertions.assertNotNull(responseFromService);
    Assertions.assertEquals(seedlotEntity, responseFromService.getSeedlot());
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
  @DisplayName("findSingleSeedlotFullDataSuccessTest")
  void findSingleSeedlotFullDataSuccessTest() {
    String seedlotNumber = "0000000";
    String orchardId = "100";
    String onwerNumber = "1234";
    String ownerLoc = "01";
    String methodOfPayment = "TEST";
    Seedlot seedlotEntity = new Seedlot(seedlotNumber);
    Integer parentTreeId = 4023;

    AuditInformation audit = new AuditInformation("userId");
    when(loggedUserService.createAuditCurrentUser()).thenReturn(audit);

    SeedlotFormParentTreeSmpDto parentTreeDto = createParentTreeDto(parentTreeId);

    SeedlotParentTree spt =
        new SeedlotParentTree(
            seedlotEntity,
            parentTreeDto.parentTreeId(),
            parentTreeDto.parentTreeNumber(),
            parentTreeDto.coneCount(),
            parentTreeDto.pollenCount(),
            audit);

    List<SeedlotParentTree> parentTreeData = List.of(spt);

    ParentTreeGeneticQualityDto sptgqDto = createParentTreeGenQuaDto();

    SeedlotParentTreeGeneticQuality sptgq =
        new SeedlotParentTreeGeneticQuality(
            spt,
            sptgqDto.geneticTypeCode(),
            new GeneticWorthEntity(sptgqDto.geneticWorthCode(), "", null),
            sptgqDto.geneticQualityValue(),
            audit);

    final List<SeedlotParentTreeGeneticQuality> genQualityData = List.of(sptgq);

    SmpMix smpMix =
        new SmpMix(
            seedlotEntity,
            parentTreeId,
            parentTreeDto.parentTreeNumber(),
            parentTreeDto.amountOfMaterial(),
            parentTreeDto.proportion(),
            audit,
            0);

    final List<SmpMix> smpMixsData = List.of(smpMix);

    SeedlotParentTreeSmpMix sptSmpMix =
        new SeedlotParentTreeSmpMix(
            spt,
            sptgqDto.geneticTypeCode(),
            new GeneticWorthEntity(sptgqDto.geneticWorthCode(), "", null),
            sptgqDto.geneticQualityValue(),
            audit);

    final List<SeedlotParentTreeSmpMix> parentTreeSmpMixData = List.of(sptSmpMix);

    SeedlotGeneticWorth seedlotGenWor =
        new SeedlotGeneticWorth(
            seedlotEntity, new GeneticWorthEntity(sptgqDto.geneticWorthCode(), "", null), audit);

    final List<SeedlotGeneticWorth> genWorthData = List.of(seedlotGenWor);

    final List<SeedlotCollectionMethod> collectionMethods =
        List.of(new SeedlotCollectionMethod(seedlotEntity, new ConeCollectionMethodEntity()));

    SeedlotOwnerQuantity seedlotOwners =
        new SeedlotOwnerQuantity(seedlotEntity, onwerNumber, ownerLoc);
    seedlotOwners.setMethodOfPayment(new MethodOfPaymentEntity(methodOfPayment, "", null));

    List<SeedlotOrchard> seedlotOrchards =
        List.of(new SeedlotOrchard(seedlotEntity, true, orchardId));

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.of(seedlotEntity));
    when(seedlotParentTreeService.getAllSeedlotParentTree(seedlotNumber))
        .thenReturn(parentTreeData);
    when(seedlotParentTreeGeneticQualityService.getAllBySeedlotNumber(seedlotNumber))
        .thenReturn(genQualityData);
    when(smpMixService.getAllBySeedlotNumber(seedlotNumber)).thenReturn(smpMixsData);
    when(seedlotParentTreeSmpMixService.getAllBySeedlotNumber(seedlotNumber))
        .thenReturn(parentTreeSmpMixData);
    when(seedlotGeneticWorthService.getAllBySeedlotNumber(seedlotNumber)).thenReturn(genWorthData);
    when(seedlotCollectionMethodRepository.findAllBySeedlot_id(seedlotNumber))
        .thenReturn(collectionMethods);
    when(seedlotOwnerQuantityRepository.findAllBySeedlot_id(seedlotNumber))
        .thenReturn(List.of(seedlotOwners));
    when(seedlotOrchardService.getAllSeedlotOrchardBySeedlotNumber(seedlotNumber))
        .thenReturn(seedlotOrchards);

    SeedlotAclassFormDto responseFromService =
        seedlotService.getAclassSeedlotFormInfo(seedlotNumber);

    List<SeedlotFormParentTreeSmpDto> sptDto =
        List.of(
            new SeedlotFormParentTreeSmpDto(
                seedlotNumber,
                parentTreeId,
                parentTreeDto.parentTreeNumber(),
                parentTreeDto.coneCount(),
                parentTreeDto.pollenCount(),
                null,
                null,
                null,
                null,
                List.of(sptgqDto)));
    List<SeedlotFormParentTreeSmpDto> sptSmpMixDto =
        List.of(
            new SeedlotFormParentTreeSmpDto(
                seedlotNumber,
                parentTreeId,
                parentTreeDto.parentTreeNumber(),
                null,
                null,
                null,
                null,
                parentTreeDto.amountOfMaterial(),
                parentTreeDto.proportion(),
                List.of(sptgqDto)));

    SeedlotFormSubmissionDto seedlotFormFields =
        new SeedlotFormSubmissionDto(
            new SeedlotFormCollectionDto(
                null, null, null, null, null, null, null, null, List.of(0)),
            List.of(
                new SeedlotFormOwnershipDto(
                    onwerNumber, ownerLoc, null, null, null, methodOfPayment, null)),
            new SeedlotFormInterimDto(null, null, null, null, null, null),
            new SeedlotFormOrchardDto(
                orchardId, null, null, null, null, null, null, null, null, null),
            sptDto,
            sptSmpMixDto,
            new SeedlotFormExtractionDto(null, null, null, null, null, null, null, null),
            List.of(),
            null,
            List.of(),
            null);

    Assertions.assertNotNull(responseFromService);
    Assertions.assertEquals(responseFromService.seedlotData(), seedlotFormFields);
    Assertions.assertEquals(
        responseFromService.calculatedValues(),
        List.of(
            new GeneticWorthTraitsDto(
                seedlotGenWor.getGeneticWorthCode(),
                null,
                seedlotGenWor.getGeneticQualityValue(),
                seedlotGenWor.getTestedParentTreeContributionPercentage())));
  }

  @Test
  @DisplayName("findSingleSeedlotFullDataFailTest")
  void findSingleSeedlotFullDataFailTest() {
    String seedlotNumber = "123456";

    when(seedlotRepository.findById(seedlotNumber)).thenReturn(Optional.empty());

    Exception exc =
        Assertions.assertThrows(
            SeedlotNotFoundException.class,
            () -> {
              seedlotService.getAclassSeedlotFormInfo(seedlotNumber);
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
}
