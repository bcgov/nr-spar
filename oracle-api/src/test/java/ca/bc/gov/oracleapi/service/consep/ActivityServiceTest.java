package ca.bc.gov.oracleapi.service.consep;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.ActivityCreateDto;
import ca.bc.gov.oracleapi.dto.consep.ActivityFormDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.dto.consep.AddGermTestValidationResponseDto;
import ca.bc.gov.oracleapi.dto.consep.StandardActivityDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.StandardActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.SparRequestRepository;
import ca.bc.gov.oracleapi.repository.consep.StandardActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRegimeRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


/**
 * The test class for Moisture Content Service.
 */
@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

  @Mock
  private ActivityRepository activityRepository;

  @Mock
  private TestResultRepository testResultRepository;

  @Mock
  private StandardActivityRepository standardActivityRepository;

  @Mock
  private TestRegimeRepository testRegimeRepository;

  @Mock
  private SparRequestRepository sparRequestRepository;

  @Autowired
  @InjectMocks
  private ActivityService activityService;

  private BigDecimal riaKey;
  private String seedlingRequestTypeSt;
  private ActivityEntity activityEntity;
  private ActivityCreateDto validActivityCreateDto;
  private StandardActivityEntity standardActivity;

  @BeforeEach
  void setUp() {
    riaKey = new BigDecimal("123");

    activityEntity = new ActivityEntity();
    activityEntity.setTestCategoryCode("TEST");
    activityEntity.setActualBeginDateTime(LocalDateTime.now().minusDays(1));
    activityEntity.setActualEndDateTime(LocalDateTime.now().minusDays(2));
    activityEntity.setRiaComment("Test comment");

    seedlingRequestTypeSt = "SRQ";
    validActivityCreateDto = new ActivityCreateDto(
        "ST1",
        "AC1",
        "STD",
        LocalDate.of(2024, 1, 1),
        LocalDate.of(2024, 1, 2),
        null,
        null,
        1,
        "HR",
        0,
        -1,
        new BigDecimal("33874"),
        "CSP19970005",
        "A",
        "PLI",
        "00098",
        ""
    );

    standardActivity = new StandardActivityEntity();
    standardActivity.setStandardActivityId(validActivityCreateDto.standardActivityId());
    standardActivity.setActivityTypeCd(validActivityCreateDto.activityTypeCd());
    standardActivity.setTestCategoryCd(validActivityCreateDto.testCategoryCd());
  }

  @Test
  @DisplayName("Update activity should succeed")
  void updateActivity_shouldSucceed() {
    ActivityEntity existingEntity = new ActivityEntity();
    existingEntity.setRiaKey(riaKey);
    existingEntity.setActualBeginDateTime(LocalDateTime.parse("2013-10-01T00:00:00"));
    existingEntity.setActualEndDateTime(LocalDateTime.parse("2013-11-01T00:00:00"));
    existingEntity.setTestCategoryCode("OLD");
    existingEntity.setRiaComment("Old comment");

    when(activityRepository.findById(riaKey)).thenReturn(Optional.of(existingEntity));
    when(activityRepository.save(any(ActivityEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    ActivityFormDto activityDto = new ActivityFormDto(
        "STD",
        LocalDateTime.parse("2013-08-01T00:00:00"),
        LocalDateTime.parse("2013-09-01T00:00:00"),
        "Updated comment"
    );

    ActivityEntity result = activityService.updateActivityField(riaKey, activityDto);

    assertEquals(activityDto.actualBeginDateTime(), result.getActualBeginDateTime());
    assertEquals(activityDto.actualEndDateTime(), result.getActualEndDateTime());
    assertEquals(activityDto.testCategoryCode(), result.getTestCategoryCode());
    assertEquals(activityDto.riaComment(), result.getRiaComment());

    verify(activityRepository, times(1)).findById(riaKey);
    verify(activityRepository, times(1)).save(any(ActivityEntity.class));
  }

  @Test
  void validateActivityData_validData() {
    assertDoesNotThrow(() ->
        activityService.validateActivityData(activityEntity));
  }

  @Test
  void validateActivityData_missingTestCategory() {
    activityEntity.setTestCategoryCode(null);
    assertThrows(ResponseStatusException.class, () ->
        activityService.validateActivityData(activityEntity));
  }

  @Test
  void validateActivityData_pastBeginDate() {
    activityEntity.setActualBeginDateTime(LocalDateTime.now().plusDays(1));
    assertThrows(ResponseStatusException.class, () ->
        activityService.validateActivityData(activityEntity));
  }


  /* ------------------------ Create Activity -----------------------------------------------*/
  @Test
  void createActivity_shouldSucceed_whenValidData() {
    when(activityRepository.save(any(ActivityEntity.class)))
        .thenAnswer(invocation -> {
          ActivityEntity e = invocation.getArgument(0);
          e.setRiaKey(new BigDecimal("999999")); // simulate DB-generated PK
          return e;
        });
    when(testResultRepository.save(any(TestResultEntity.class))).thenAnswer(i -> i.getArgument(0));
    when(standardActivityRepository.findById(validActivityCreateDto.standardActivityId()))
        .thenReturn(Optional.of(standardActivity));
    when(sparRequestRepository.findRequestTypeStByRequestSkey(validActivityCreateDto.requestSkey()))
        .thenReturn(seedlingRequestTypeSt);

    ActivitySearchResponseDto createdActivity =
        activityService.createActivity(validActivityCreateDto);

    assertEquals(validActivityCreateDto.seedlotNumber(), createdActivity.seedlotDisplay());
    assertEquals(validActivityCreateDto.requestSkey().intValue(), createdActivity.requestSkey());
    assertEquals(validActivityCreateDto.itemId(), createdActivity.itemId());
    verify(activityRepository, times(1)).save(any(ActivityEntity.class));
    verify(activityRepository, times(1)).clearExistingProcessCommitment(
        eq(validActivityCreateDto.requestSkey()),
        eq(validActivityCreateDto.itemId()),
        eq(BigDecimal.valueOf(createdActivity.riaSkey()))
    );
    verify(testResultRepository, times(1)).save(any(TestResultEntity.class));
  }

  @Test
  void createActivity_shouldNotCallClearExistingProcessCommitment_whenProcessCommitUnchecked() {
    StandardActivityEntity nonTestActivity = new StandardActivityEntity();
    nonTestActivity.setStandardActivityId(validActivityCreateDto.standardActivityId()); // match DTO
    nonTestActivity.setActivityTypeCd(validActivityCreateDto.activityTypeCd());
    nonTestActivity.setTestCategoryCd(null); // Not a test activity

    ActivityCreateDto dto = new ActivityCreateDto(
        validActivityCreateDto.standardActivityId(),
        validActivityCreateDto.activityTypeCd(),
        null, // Not a test activity
        validActivityCreateDto.plannedStartDate(),
        validActivityCreateDto.plannedEndDate(),
        validActivityCreateDto.revisedStartDate(),
        validActivityCreateDto.revisedEndDate(),
        validActivityCreateDto.activityDuration(),
        validActivityCreateDto.activityTimeUnit(),
        validActivityCreateDto.significantStatusIndicator(),
        0,
        validActivityCreateDto.requestSkey(),
        validActivityCreateDto.requestId(),
        validActivityCreateDto.itemId(),
        validActivityCreateDto.vegetationState(),
        validActivityCreateDto.seedlotNumber(),
        validActivityCreateDto.familyLotNumber()
    );

    when(activityRepository.save(any(ActivityEntity.class)))
        .thenAnswer(invocation -> {
          ActivityEntity e = invocation.getArgument(0);
          e.setRiaKey(new BigDecimal("999999")); // simulate DB-generated PK
          return e;
        });
    when(standardActivityRepository.findById(validActivityCreateDto.standardActivityId()))
        .thenReturn(Optional.of(nonTestActivity));

    activityService.createActivity(dto);
    verify(activityRepository, never()).clearExistingProcessCommitment(any(), any(), any());
    verify(testResultRepository, never()).save(any(TestResultEntity.class));
  }

  @Test
  void createActivity_shouldFail_whenStartDateNotBeforeEndDate() {
    ActivityCreateDto invalidDto = new ActivityCreateDto(
        validActivityCreateDto.standardActivityId(),
        validActivityCreateDto.activityTypeCd(),
        validActivityCreateDto.testCategoryCd(),
        LocalDate.of(2024, 1, 10),
        LocalDate.of(2024, 1, 2),
        validActivityCreateDto.revisedStartDate(),
        validActivityCreateDto.revisedEndDate(),
        validActivityCreateDto.activityDuration(),
        validActivityCreateDto.activityTimeUnit(),
        validActivityCreateDto.significantStatusIndicator(),
        validActivityCreateDto.processCommitIndicator(),
        validActivityCreateDto.requestSkey(),
        validActivityCreateDto.requestId(),
        validActivityCreateDto.itemId(),
        validActivityCreateDto.vegetationState(),
        validActivityCreateDto.seedlotNumber(),
        validActivityCreateDto.familyLotNumber()
    );

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class, () -> activityService.createActivity(invalidDto)
    );
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("Planned start date must be before planned end date.", ex.getReason());
  }

  @Test
  void createActivity_shouldFail_whenNoSeedlotOrFamilyLot() {
    ActivityCreateDto invalidDto = new ActivityCreateDto(
        validActivityCreateDto.standardActivityId(),
        validActivityCreateDto.activityTypeCd(),
        validActivityCreateDto.testCategoryCd(),
        validActivityCreateDto.plannedStartDate(),
        validActivityCreateDto.plannedEndDate(),
        validActivityCreateDto.revisedStartDate(),
        validActivityCreateDto.revisedEndDate(),
        validActivityCreateDto.activityDuration(),
        validActivityCreateDto.activityTimeUnit(),
        validActivityCreateDto.significantStatusIndicator(),
        validActivityCreateDto.processCommitIndicator(),
        validActivityCreateDto.requestSkey(),
        validActivityCreateDto.requestId(),
        validActivityCreateDto.itemId(),
        validActivityCreateDto.vegetationState(),
        "",
        ""
    );

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class, () -> activityService.createActivity(invalidDto)
    );
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals(
        "Exactly one of seedlotNumber or familyLotNumber "
        + "must be provided (provide one, but not both or neither).",
        ex.getReason()
    );
  }

  @Test
  void createActivity_shouldFail_whenHaveBothSeedlotAndFamilyLot() {
    ActivityCreateDto invalidDto = new ActivityCreateDto(
        validActivityCreateDto.standardActivityId(),
        validActivityCreateDto.activityTypeCd(),
        validActivityCreateDto.testCategoryCd(),
        validActivityCreateDto.plannedStartDate(),
        validActivityCreateDto.plannedEndDate(),
        validActivityCreateDto.revisedStartDate(),
        validActivityCreateDto.revisedEndDate(),
        validActivityCreateDto.activityDuration(),
        validActivityCreateDto.activityTimeUnit(),
        validActivityCreateDto.significantStatusIndicator(),
        validActivityCreateDto.processCommitIndicator(),
        validActivityCreateDto.requestSkey(),
        validActivityCreateDto.requestId(),
        validActivityCreateDto.itemId(),
        validActivityCreateDto.vegetationState(),
        "00098",
        "F20082140146"
    );

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class, () -> activityService.createActivity(invalidDto)
    );
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals(
        "Exactly one of seedlotNumber or familyLotNumber "
        + "must be provided (provide one, but not both or neither).",
        ex.getReason()
    );
  }

  @Test
  void createActivity_shouldFail_whenSeedlingRequestIdAndTestCategoryCdNotStd() {
    ActivityCreateDto invalidDto = new ActivityCreateDto(
        validActivityCreateDto.standardActivityId(),
        validActivityCreateDto.activityTypeCd(),
        "NON", // <-- Not STD
        validActivityCreateDto.plannedStartDate(),
        validActivityCreateDto.plannedEndDate(),
        validActivityCreateDto.revisedStartDate(),
        validActivityCreateDto.revisedEndDate(),
        validActivityCreateDto.activityDuration(),
        validActivityCreateDto.activityTimeUnit(),
        validActivityCreateDto.significantStatusIndicator(),
        validActivityCreateDto.processCommitIndicator(),
        validActivityCreateDto.requestSkey(),
        validActivityCreateDto.requestId(),
        validActivityCreateDto.itemId(),
        validActivityCreateDto.vegetationState(),
        validActivityCreateDto.seedlotNumber(),
        validActivityCreateDto.familyLotNumber()
    );

    when(standardActivityRepository.findById(validActivityCreateDto.standardActivityId()))
        .thenReturn(Optional.of(standardActivity));
    when(sparRequestRepository.findRequestTypeStByRequestSkey(validActivityCreateDto.requestSkey()))
        .thenReturn(seedlingRequestTypeSt);

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class, () -> activityService.createActivity(invalidDto)
    );
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("TEST_CATEGORY_CD must be 'STD' because Request ID is a Seedling Request",
        ex.getReason());
  }

  @Test
  void createActivity_shouldFail_whenTestActivityWithoutTestCategoryCd() {
    when(standardActivityRepository.findById(validActivityCreateDto.standardActivityId()))
        .thenReturn(Optional.of(standardActivity));

    ActivityCreateDto dto = new ActivityCreateDto(
        validActivityCreateDto.standardActivityId(),
        validActivityCreateDto.activityTypeCd(),
        null, // missing testCategoryCd
        validActivityCreateDto.plannedStartDate(),
        validActivityCreateDto.plannedEndDate(),
        validActivityCreateDto.revisedStartDate(),
        validActivityCreateDto.revisedEndDate(),
        validActivityCreateDto.activityDuration(),
        validActivityCreateDto.activityTimeUnit(),
        validActivityCreateDto.significantStatusIndicator(),
        validActivityCreateDto.processCommitIndicator(),
        validActivityCreateDto.requestSkey(),
        validActivityCreateDto.requestId(),
        validActivityCreateDto.itemId(),
        validActivityCreateDto.vegetationState(),
        validActivityCreateDto.seedlotNumber(),
        validActivityCreateDto.familyLotNumber()
    );

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> activityService.createActivity(dto)
    );
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals(
        "Test category code is required for the selected test activity.",
        ex.getReason()
    );
  }

  @Test
  void createActivity_shouldFail_whenNonTestActivityWithTestCategoryCd() {
    StandardActivityEntity nonTestActivity = new StandardActivityEntity();
    nonTestActivity.setStandardActivityId("ST2");
    nonTestActivity.setActivityTypeCd("AC2");
    nonTestActivity.setTestCategoryCd(null); // Not a test activity

    when(standardActivityRepository.findById("ST2"))
        .thenReturn(Optional.of(nonTestActivity));

    ActivityCreateDto dto = new ActivityCreateDto(
        "ST2",
        "AC2",
        "TC1", // invalid testCategoryCd for non-test activity
        validActivityCreateDto.plannedStartDate(),
        validActivityCreateDto.plannedEndDate(),
        validActivityCreateDto.revisedStartDate(),
        validActivityCreateDto.revisedEndDate(),
        validActivityCreateDto.activityDuration(),
        validActivityCreateDto.activityTimeUnit(),
        validActivityCreateDto.significantStatusIndicator(),
        validActivityCreateDto.processCommitIndicator(),
        validActivityCreateDto.requestSkey(),
        validActivityCreateDto.requestId(),
        validActivityCreateDto.itemId(),
        validActivityCreateDto.vegetationState(),
        validActivityCreateDto.seedlotNumber(),
        validActivityCreateDto.familyLotNumber()
    );

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> activityService.createActivity(dto)
    );
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals(
        "The selected activity is not a test activity; test category code should be null.",
        ex.getReason()
    );
  }

  /* ------------------------ Get Activity Ids -----------------------------------------------*/
  @Test
  void getStandardActivityIds_shouldReturnExpectedDtos_forSeedlot() {
    StandardActivityEntity activity1 = new StandardActivityEntity();
    activity1.setStandardActivityId("AEX");
    activity1.setActivityTypeCd("SCR");
    activity1.setTestCategoryCd("T1");
    activity1.setActivityDesc("Abies extraction");

    StandardActivityEntity activity2 = new StandardActivityEntity();
    activity2.setStandardActivityId("SSP");
    activity2.setActivityTypeCd("SEP");
    activity2.setTestCategoryCd("T2");
    activity2.setActivityDesc("Seed separation");

    // Unordered input, expect sorting by description
    when(standardActivityRepository.findAll()).thenReturn(List.of(activity2, activity1));

    List<StandardActivityDto> result = activityService.getStandardActivityIds(false, true);

    assertThat(result)
        .hasSize(2)
        .extracting(StandardActivityDto::standardActivityId)
        .containsExactly(activity1.getStandardActivityId(), activity2.getStandardActivityId());

    assertThat(result)
        .extracting(StandardActivityDto::activityTypeCd)
        .containsExactly(activity1.getActivityTypeCd(), activity2.getActivityTypeCd());

    assertThat(result)
        .extracting(StandardActivityDto::testCategoryCd)
        .containsExactly(activity1.getTestCategoryCd(), activity2.getTestCategoryCd());

    assertThat(result)
        .extracting(StandardActivityDto::activityDescription)
        .containsExactly(activity1.getActivityDesc(), activity2.getActivityDesc());

    verify(standardActivityRepository, times(1)).findAll();
    verify(standardActivityRepository, never()).findAllFamilyLotActivities();
  }

  @Test
  void getStandardActivityIds_shouldReturnExpectedDtos_forFamilyLot() {
    StandardActivityEntity activity1 = new StandardActivityEntity();
    activity1.setStandardActivityId("FA1");
    activity1.setActivityTypeCd("FAM");
    activity1.setTestCategoryCd("T3");
    activity1.setActivityDesc("Beta Family");

    StandardActivityEntity activity2 = new StandardActivityEntity();
    activity2.setStandardActivityId("FA2");
    activity2.setActivityTypeCd("FAM");
    activity2.setTestCategoryCd("T4");
    activity2.setActivityDesc("Alpha Family");

    // Unordered input, expect sorting by description
    when(standardActivityRepository.findAllFamilyLotActivities()).thenReturn(List.of(activity1, activity2));

    List<StandardActivityDto> result = activityService.getStandardActivityIds(true, false);

    assertThat(result)
        .hasSize(2)
        .extracting(StandardActivityDto::standardActivityId)
        .containsExactly(activity2.getStandardActivityId(), activity1.getStandardActivityId());

    assertThat(result)
        .extracting(StandardActivityDto::activityTypeCd)
        .containsExactly(activity2.getActivityTypeCd(), activity1.getActivityTypeCd());

    assertThat(result)
        .extracting(StandardActivityDto::testCategoryCd)
        .containsExactly(activity2.getTestCategoryCd(), activity1.getTestCategoryCd());

    assertThat(result)
        .extracting(StandardActivityDto::activityDescription)
        .containsExactly(activity2.getActivityDesc(), activity1.getActivityDesc());

    verify(standardActivityRepository, times(1)).findAllFamilyLotActivities();
    verify(standardActivityRepository, never()).findAll();
  }

  @Test
  void getStandardActivityIds_shouldReturnExpectedDtos_forAll() {
    StandardActivityEntity activity1 = new StandardActivityEntity();
    activity1.setStandardActivityId("AEX");
    activity1.setActivityTypeCd("SCR");
    activity1.setTestCategoryCd("T1");
    activity1.setActivityDesc("Abies extraction");

    StandardActivityEntity activity2 = new StandardActivityEntity();
    activity2.setStandardActivityId("SSP");
    activity2.setActivityTypeCd("SEP");
    activity2.setTestCategoryCd("T2");
    activity2.setActivityDesc("Seed separation");

    StandardActivityEntity activity3 = new StandardActivityEntity();
    activity3.setStandardActivityId("FA1");
    activity3.setActivityTypeCd("FAM");
    activity3.setTestCategoryCd("T3");
    activity3.setActivityDesc("Beta Family");

    StandardActivityEntity activity4 = new StandardActivityEntity();
    activity4.setStandardActivityId("TUM");
    activity4.setActivityTypeCd("TUM");
    activity4.setTestCategoryCd("T4");
    activity4.setActivityDesc("Cone tumbling/seed extraction");

    when(standardActivityRepository.findAll()).thenReturn(List.of(activity2, activity1, activity4));
    when(standardActivityRepository.findAllFamilyLotActivities()).thenReturn(List.of(activity3));

    List<StandardActivityDto> result = activityService.getStandardActivityIds(true, true);

    assertThat(result)
        .hasSize(4)
        .extracting(StandardActivityDto::standardActivityId)
        .containsExactly(
            activity1.getStandardActivityId(), // Abies extraction
            activity3.getStandardActivityId(), // Beta Family
            activity4.getStandardActivityId(), // Cone tumbling/seed extraction
            activity2.getStandardActivityId()  // Seed separation
        );

    assertThat(result)
        .extracting(StandardActivityDto::testCategoryCd)
        .containsExactly(
            activity1.getTestCategoryCd(),
            activity3.getTestCategoryCd(),
            activity4.getTestCategoryCd(),
            activity2.getTestCategoryCd()
        );

    assertThat(result)
        .extracting(StandardActivityDto::activityDescription)
        .containsExactly(
            activity1.getActivityDesc(),
            activity3.getActivityDesc(),
            activity4.getActivityDesc(),
            activity2.getActivityDesc()
        );

    verify(standardActivityRepository, times(1)).findAllFamilyLotActivities();
    verify(standardActivityRepository, times(1)).findAll();
  }

  @Test
  void getStandardActivityIds_shouldReturnEmpty_whenBothFalse() {
    List<StandardActivityDto> result = activityService.getStandardActivityIds(false, false);
    assertThat(result).isEmpty();
    verify(standardActivityRepository, never()).findAll();
    verify(standardActivityRepository, never()).findAllFamilyLotActivities();
  }

  /* ------------------------ Validate Add Germ Test ----------------------------------------*/
  @Test
  @DisplayName("validateAddGermTest should throw BAD_REQUEST when"
      + " both seedlotNumber and familyLotNumber are missing")
  void validateAddGermTest_shouldThrowBadRequestWhenNoSeedlotOrFamilyLot() {
    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> activityService.validateAddGermTest("G11", null, null)
    );
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals(
        "Exactly one of seedlotNumber or familyLotNumber must be provided",
        ex.getReason()
    );
  }

  @Test
  @DisplayName("validateAddGermTest should return false germTest when"
      + " activity type is not a germ test")
  void validateAddGermTest_shouldReturnFalseWhenNotGermTest() {
    when(testRegimeRepository.findAllGermTestActivityTypeCodes()).thenReturn(List.of("G01", "G02"));

    AddGermTestValidationResponseDto result =
        activityService.validateAddGermTest("X99", "00098", null);

    assertFalse(result.germTest());
    assertTrue(result.matchesCurrentTypeCode());
    assertNull(result.currentTypeCode());
  }

  @Test
  @DisplayName("validateAddGermTest should return true and"
      + " matchesCurrentTypeCode true when no current A-rank exists")
  void validateAddGermTest_shouldReturnTrueWhenNoCurrentRankA() {
    when(testRegimeRepository.findAllGermTestActivityTypeCodes()).thenReturn(List.of("G11", "G12"));
    when(activityRepository.findTypeCodeForAcceptedGermTestRankA("00098", null)).thenReturn(List.of());

    AddGermTestValidationResponseDto result =
        activityService.validateAddGermTest("G11", "00098", null);

    assertTrue(result.germTest());
    assertTrue(result.matchesCurrentTypeCode());
    assertNull(result.currentTypeCode());
  }

  @Test
  @DisplayName("validateAddGermTest should return false matchesCurrentTypeCode"
      + " when current A-rank does not match")
  void validateAddGermTest_shouldReturnFalseWhenDoesNotMatchCurrentRankA() {
    when(testRegimeRepository.findAllGermTestActivityTypeCodes()).thenReturn(List.of("G11", "G12"));
    when(activityRepository.findTypeCodeForAcceptedGermTestRankA("00098", null))
        .thenReturn(List.of("G12"));

    AddGermTestValidationResponseDto result =
        activityService.validateAddGermTest("G11", "00098", null);

    assertTrue(result.germTest());
    assertFalse(result.matchesCurrentTypeCode());
    assertEquals("G12", result.currentTypeCode());
  }

  @Test
  @DisplayName("validateAddGermTest should return true matchesCurrentTypeCode"
      + " when current A-rank matches")
  void validateAddGermTest_shouldReturnTrueWhenMatchesCurrentRankA() {
    when(testRegimeRepository.findAllGermTestActivityTypeCodes()).thenReturn(List.of("G11", "G12"));
    when(activityRepository.findTypeCodeForAcceptedGermTestRankA("00098", null))
        .thenReturn(List.of("G11"));

    AddGermTestValidationResponseDto result =
        activityService.validateAddGermTest("G11", "00098", null);

    assertTrue(result.germTest());
    assertTrue(result.matchesCurrentTypeCode());
    assertEquals("G11", result.currentTypeCode());
  }

  @Test
  @DisplayName("validateAddGermTest should throw CONFLICT when multiple current A-rank codes exist")
  void validateAddGermTest_shouldThrowConflictWhenMultipleCurrentRankA() {
    when(testRegimeRepository.findAllGermTestActivityTypeCodes()).thenReturn(List.of("G11", "G12"));
    when(activityRepository.findTypeCodeForAcceptedGermTestRankA("00098", null))
        .thenReturn(List.of("G11", "G12"));

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> activityService.validateAddGermTest("G11", "00098", null)
    );

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    assertEquals(
        "Multiple accepted A-rank germ tests exist for this seedlot/family lot",
        ex.getReason()
    );
  }

  @Test
  @DisplayName("validateAddGermTest should throw BAD_REQUEST"
      + " when both seedlotNumber and familyLotNumber are provided")
  void validateAddGermTest_shouldThrowBadRequestWhenBothSeedlotAndFamilyLot() {
    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> activityService.validateAddGermTest("G11", "00098", "F20082140146")
    );
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals(
        "Exactly one of seedlotNumber or familyLotNumber must be provided",
        ex.getReason()
    );
  }

}
