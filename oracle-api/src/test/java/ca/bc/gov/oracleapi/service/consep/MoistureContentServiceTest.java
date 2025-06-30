package ca.bc.gov.oracleapi.service.consep;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.MccReplicateDto;
import ca.bc.gov.oracleapi.dto.consep.MccReplicateFormDto;
import ca.bc.gov.oracleapi.dto.consep.MoistureContentConesDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.MccReplicateEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.exception.InvalidTestActivityKeyException;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.MccReplicatesRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;

/**
 * The test class for Moisture Content Service.
 */
@ExtendWith(MockitoExtension.class)
class MoistureContentServiceTest {

  @Mock
  private ActivityRepository activityRepository;

  @Mock
  private TestResultRepository testResultRepository;

  @Mock
  private MccReplicatesRepository replicateRepository;

  @Autowired
  @InjectMocks
  private MoistureContentService moistureContentService;

  private BigDecimal riaKey;
  private ActivityEntity activityEntity;
  private TestResultEntity testResultEntity;

  @BeforeEach
  void setUp() {
    riaKey = new BigDecimal("123");

    activityEntity = new ActivityEntity();
    activityEntity.setTestCategoryCode("TEST");
    activityEntity.setActualBeginDateTime(LocalDateTime.now().minusDays(2));
    activityEntity.setActualEndDateTime(LocalDateTime.now().minusDays(1));
    activityEntity.setRiaComment("Test comment");

    testResultEntity = new TestResultEntity();
    testResultEntity.setTestCompleteInd(1);
    testResultEntity.setSampleDesc("Sample");
    testResultEntity.setMoistureStatus("Status");
    testResultEntity.setMoisturePct(new BigDecimal("50.5"));
    testResultEntity.setAcceptResult(1);
  }

  private MccReplicateDto validDto() {
    return new MccReplicateDto(
        BigDecimal.ONE,
        1,
        "1234",
        BigDecimal.valueOf(10.5),
        BigDecimal.valueOf(20.5),
        BigDecimal.valueOf(30.5),
        BigDecimal.valueOf(40.5),
        1,
        "Test comment",
        "Override reason");
  }

  @Test
  void shouldPassWithValidData() {
    assertDoesNotThrow(() ->
        moistureContentService.validateMoistureConeContentData(List.of(validDto()))
    );
  }

  @Test
  void shouldFailWhenRiaKeyMissing() {
    var dto = new MccReplicateDto(
        null,
        1,
        "1234",
        BigDecimal.ONE,
        BigDecimal.ONE,
        BigDecimal.ONE,
        BigDecimal.ONE,
        null,
        null,
        null
    );

    assertThatThrownBy(() ->
        moistureContentService.validateMoistureConeContentData(List.of(dto))
    ).isInstanceOf(ResponseStatusException.class)
      .hasMessageContaining("RIA key is missing");
  }

  @Test
  void shouldFailWhenReplicateNumberMissing() {
    var dto = new MccReplicateDto(
        BigDecimal.ONE,
        (Integer) null,
        "1234",
        BigDecimal.ONE,
        BigDecimal.ONE,
        BigDecimal.ONE,
        BigDecimal.ONE,
        null,
        null,
        null
    );

    assertThatThrownBy(() ->
        moistureContentService.validateMoistureConeContentData(List.of(dto))
    ).isInstanceOf(ResponseStatusException.class)
      .hasMessageContaining("Replicate number is missing");
  }

  @Test
  void shouldFailWhenContainerIdTooLong() {
    var dto = new MccReplicateDto(
        BigDecimal.ONE,
        1,
        "12345",
        BigDecimal.ONE,
        BigDecimal.ONE,
        BigDecimal.ONE,
        BigDecimal.ONE,
        null,
        null,
        null
    );

    assertThatThrownBy(() ->
        moistureContentService.validateMoistureConeContentData(List.of(dto))
    ).isInstanceOf(ResponseStatusException.class)
      .hasMessageContaining("Container ID is too long");
  }

  @Test
  void shouldFailWhenContainerWeightInvalid() {
    var dto = new MccReplicateDto(
        BigDecimal.ONE,
        1,
        "1234",
        BigDecimal.valueOf(-1),
        BigDecimal.ONE,
        BigDecimal.ONE,
        BigDecimal.ONE,
        null,
        null,
        null
    );

    assertThatThrownBy(() ->
        moistureContentService.validateMoistureConeContentData(List.of(dto))
    ).isInstanceOf(ResponseStatusException.class)
      .hasMessageContaining("Container weight is missing or invalid");
  }

  @Test
  void shouldFailWhenFreshSeedInvalid() {
    var dto = new MccReplicateDto(
        BigDecimal.ONE,
        1,
        "1234",
        BigDecimal.ONE,
        BigDecimal.valueOf(1000),
        BigDecimal.ONE,
        BigDecimal.ONE,
        null,
        null,
        null
    );

    assertThatThrownBy(() ->
        moistureContentService.validateMoistureConeContentData(List.of(dto))
    ).isInstanceOf(ResponseStatusException.class)
      .hasMessageContaining("Fresh seed weight is missing or invalid");
  }

  @Test
  void shouldFailWhenDryWeightInvalid() {
    var dto = new MccReplicateDto(
        BigDecimal.ONE,
        1,
        "1234",
        BigDecimal.ONE,
        BigDecimal.ONE,
        BigDecimal.ONE,
        null,
        null,
        null,
        null
    );

    assertThatThrownBy(() ->
        moistureContentService.validateMoistureConeContentData(List.of(dto))
    ).isInstanceOf(ResponseStatusException.class)
      .hasMessageContaining("Dry weight is missing or invalid");
  }

  @Test
  void shouldFailWhenContainerAndDryWeightInvalid() {
    var dto = new MccReplicateDto(
        BigDecimal.ONE,
        1,
        "1234",
        BigDecimal.ONE,
        BigDecimal.ONE,
        BigDecimal.valueOf(1001),
        BigDecimal.ONE,
        null,
        null,
        null
    );

    assertThatThrownBy(() ->
        moistureContentService.validateMoistureConeContentData(List.of(dto))
    ).isInstanceOf(ResponseStatusException.class)
      .hasMessageContaining("Container and dry weight is missing or invalid");
  }

  @Test
  @DisplayName("Delete multiple replicates - success case")
  void deleteMccReplicates_shouldSucceed() {
    // Arrange
    BigDecimal riaKey = new BigDecimal("1234567890");
    List<Integer> replicateNumbers = Arrays.asList(1, 2, 3);

    MccReplicateEntity replicate1 = new MccReplicateEntity();
    replicate1.setId(new ReplicateId(riaKey, 1));

    MccReplicateEntity replicate2 = new MccReplicateEntity();
    replicate2.setId(new ReplicateId(riaKey, 2));

    List<MccReplicateEntity> existingReplicates = Arrays.asList(replicate1, replicate2);

    when(replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers))
        .thenReturn(existingReplicates);

    doNothing().when(replicateRepository)
        .deleteByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers);

    // Act & Assert
    assertDoesNotThrow(() -> moistureContentService.deleteMccReplicates(riaKey, replicateNumbers));

    verify(replicateRepository).findByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers);
    verify(replicateRepository).deleteByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers);
  }

  @Test
  @DisplayName("Delete multiple replicates - no replicates found")
  void deleteMccReplicates_shouldThrowWhenNoReplicatesFound() {
    // Arrange
    BigDecimal riaKey = new BigDecimal("1234567890");
    List<Integer> replicateNumbers = Arrays.asList(1, 2, 3);

    when(replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers))
        .thenReturn(Collections.emptyList());

    // Act & Assert
    assertThrows(InvalidTestActivityKeyException.class,
        () -> moistureContentService.deleteMccReplicates(riaKey, replicateNumbers));

    verify(replicateRepository).findByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers);
    verify(replicateRepository, never()).deleteByRiaKeyAndReplicateNumbers(any(), any());
  }

  @Test
  @DisplayName("Delete multiple replicates - empty replicateNumbers")
  void deleteMccReplicates_shouldThrowWhenReplicateNumbersIsEmpty() {
    // Arrange
    BigDecimal riaKey = new BigDecimal("1234567890");
    List<Integer> replicateNumbers = Collections.emptyList();

    // Act & Assert
    assertThrows(InvalidTestActivityKeyException.class,
        () -> moistureContentService.deleteMccReplicates(riaKey, replicateNumbers));
  }

  @Test
  @DisplayName("Get moisture cone content should succeed")
  void getMoistureConeContent_shouldSucceed() {
    BigDecimal riaKey = new BigDecimal(1234567890);
    ReplicateId replicateId = new ReplicateId(riaKey, 1);

    MccReplicateEntity replicate1 = new MccReplicateEntity();
    replicate1.setId(replicateId);
    replicate1.setContainerId("A123");
    replicate1.setFreshSeed(new BigDecimal(12.345));
    replicate1.setContainerAndDryWeight(new BigDecimal(45.678));
    replicate1.setContainerWeight(new BigDecimal(58.901));
    replicate1.setDryWeight(new BigDecimal(46.784));
    replicate1.setReplicateAccInd(1);
    replicate1.setOverrideReason("Replicate was re-tested due to abnormal moisture content.");
    replicate1.setReplicateComment("Equipment calibration issue.");

    List<MccReplicateEntity> replicatesList = List.of(replicate1);
    List<Integer> replicateIds = IntStream.rangeClosed(1, 8)
        .boxed()
        .collect(Collectors.toList());

    when(replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateIds))
        .thenReturn(replicatesList);

    LocalDateTime now = LocalDateTime.now();

    ActivityEntity activityData = new ActivityEntity();
    activityData.setRequestId("ABC123456");
    activityData.setSeedlotNumber("60000");
    activityData.setActivityTypeCode("MC");
    activityData.setTestCategoryCode("CNN");
    activityData.setRiaComment("Activity finished.");
    activityData.setActualEndDateTime(now.plusDays(30L));
    activityData.setActualBeginDateTime(now.minusDays(1L));

    when(activityRepository.findById(riaKey))
        .thenReturn(Optional.of(activityData));

    TestResultEntity testData = new TestResultEntity();
    testData.setTestCompleteInd(1);
    testData.setSampleDesc("Sample description.");
    testData.setMoistureStatus("MOI");
    testData.setMoisturePct(new BigDecimal(12.345));
    testData.setAcceptResult(1);

    when(testResultRepository.findById(riaKey))
        .thenReturn(Optional.of(testData));

    Optional<MoistureContentConesDto> mccData = moistureContentService
        .getMoistureConeContentData(riaKey);

    assertEquals(mccData.get().testCompleteInd(), testData.getTestCompleteInd());
    assertEquals(mccData.get().sampleDesc(), testData.getSampleDesc());
    assertEquals(mccData.get().moistureStatus(), testData.getMoistureStatus());
    assertEquals(mccData.get().moisturePct(), testData.getMoisturePct());
    assertEquals(mccData.get().acceptResult(), testData.getAcceptResult());
    assertEquals(mccData.get().requestId(), activityData.getRequestId());
    assertEquals(mccData.get().seedlotNumber(), activityData.getSeedlotNumber());
    assertEquals(mccData.get().activityType(), activityData.getActivityTypeCode());
    assertEquals(mccData.get().testCategoryCode(), activityData.getTestCategoryCode());
    assertEquals(mccData.get().riaComment(), activityData.getRiaComment());
    assertEquals(mccData.get().actualBeginDateTime(), activityData.getActualBeginDateTime());
    assertEquals(mccData.get().actualEndDateTime(), activityData.getActualEndDateTime());
    mccData.get().replicatesList().forEach(
        rep -> {
          assertEquals(rep.riaKey(), replicate1.getId().getRiaKey());
          assertEquals(rep.replicateNumber(), replicate1.getId().getReplicateNumber());
          assertEquals(rep.containerId(), replicate1.getContainerId());
          assertEquals(rep.freshSeed(), replicate1.getFreshSeed());
          assertEquals(rep.containerAndDryWeight(), replicate1.getContainerAndDryWeight());
          assertEquals(rep.containerWeight(), replicate1.getContainerWeight());
          assertEquals(rep.dryWeight(), replicate1.getDryWeight());
          assertEquals(rep.replicateAccInd(), replicate1.getReplicateAccInd());
          assertEquals(rep.overrideReason(), replicate1.getOverrideReason());
          assertEquals(rep.replicateComment(), replicate1.getReplicateComment());
        });
  }

  @Test
  @DisplayName("getMoistureConeContent_errorTest")
  void getMoistureConeContent_errorTest() {
    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.getMoistureConeContentData(any());
        });
  }

  @Test
  @DisplayName("updateReplicateField - should return updated replicates")
  void updateReplicateField_shouldReturnUpdatedReplicates() {
    BigDecimal riaKey = new BigDecimal("1234567890");

    final MccReplicateFormDto formDto = new MccReplicateFormDto(
        1,
        "CID-123",
        new BigDecimal("1.0"),
        new BigDecimal("2.0"),
        new BigDecimal("3.0"),
        new BigDecimal("4.0"),
        1,
        "some comment",
        "override reason");

    MccReplicateEntity entity = new MccReplicateEntity();
    ReplicateId replicateId = new ReplicateId(riaKey, 1);
    entity.setId(replicateId);
    entity.setContainerId("CID-123");
    entity.setContainerWeight(new BigDecimal("1.0"));
    entity.setFreshSeed(new BigDecimal("2.0"));
    entity.setContainerAndDryWeight(new BigDecimal("3.0"));
    entity.setDryWeight(new BigDecimal("4.0"));
    entity.setReplicateAccInd(1);
    entity.setReplicateComment("some comment");
    entity.setOverrideReason("override reason");

    final List<MccReplicateFormDto> requestList = List.of(formDto);

    List<MccReplicateEntity> existingReplicates = List.of(entity);
    List<MccReplicateEntity> savedReplicates = List.of(entity);

    when(replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, List.of(1)))
        .thenReturn(existingReplicates);
    when(replicateRepository.saveAll(anyList()))
        .thenReturn(savedReplicates);

    List<MccReplicateEntity> result = moistureContentService.updateReplicateField(
        riaKey, requestList);

    assertEquals(1, result.size());
    assertEquals("CID-123", result.get(0).getContainerId());
    assertEquals(new BigDecimal("1.0"), result.get(0).getContainerWeight());

    verify(replicateRepository).findByRiaKeyAndReplicateNumbers(riaKey, List.of(1));
    verify(replicateRepository).saveAll(anyList());
  }

  @Test
  void validateMoistureConeContentData_validData() {
    MccReplicateDto replicateDto = new MccReplicateDto(
        riaKey,
        1,
        "ABC",
        new BigDecimal("12.345"),
        new BigDecimal("45.678"),
        new BigDecimal("58.901"),
        new BigDecimal("46.789"),
        1,
        "Comment",
        "Reason");

    List<MccReplicateDto> replicates = List.of(replicateDto);

    assertDoesNotThrow(() -> moistureContentService.validateMoistureConeContentData(replicates));
  }

  @Test
  void validateMoistureConeContentData_missingRiaKey() {
    MccReplicateDto replicateDto = new MccReplicateDto(
        null,
        1,
        "ABC",
        new BigDecimal("12.345"),
        new BigDecimal("45.678"),
        new BigDecimal("58.901"),
        new BigDecimal("46.789"),
        1,
        "Comment",
        "Reason"
    );
    List<MccReplicateDto> replicates = List.of(replicateDto);

    assertThrows(ResponseStatusException.class,
        () -> moistureContentService.validateMoistureConeContentData(replicates));
  }

  @Test
  void validateMoistureConeContentData_invalidContainerWeight() {
    MccReplicateDto replicateDto = new MccReplicateDto(
        riaKey,
        1,
        "ABC",
        new BigDecimal("1000"),
        new BigDecimal("45.678"),
        new BigDecimal("58.901"),
        new BigDecimal("46.789"),
        1,
        "Comment",
        "Reason"
    );
    List<MccReplicateDto> replicates = List.of(replicateDto);

    assertThrows(ResponseStatusException.class,
        () -> moistureContentService.validateMoistureConeContentData(replicates));
  }

  @Test
  @DisplayName("Delete a single replicate should succeed")
  void deleteMccReplicate_shouldSucceed() {
    BigDecimal riaKey = new BigDecimal(1234567890);
    Integer replicateNumber = 1;
    MccReplicateEntity mockReplicate = new MccReplicateEntity();

    when(replicateRepository.findSingleReplicate(riaKey, replicateNumber)).thenReturn(
        Optional.of(mockReplicate));

    doNothing().when(replicateRepository).deleteByRiaKeyAndReplicateNumber(riaKey, replicateNumber);
    assertDoesNotThrow(() -> moistureContentService.deleteMccReplicate(riaKey, replicateNumber));

    verify(replicateRepository, times(1)).deleteByRiaKeyAndReplicateNumber(riaKey, replicateNumber);
  }

  @Test
  @DisplayName("Delete a single replicate should throw exception when not found")
  void deleteMccReplicate_shouldThrowExceptionIfNotFound() {
    BigDecimal riaKey = new BigDecimal(1234567890);
    Integer replicateNumber = 1;

    when(replicateRepository.findSingleReplicate(riaKey, replicateNumber)).thenReturn(
        Optional.empty());

    assertThrows(InvalidTestActivityKeyException.class,
        () -> moistureContentService.deleteMccReplicate(riaKey, replicateNumber));

    verify(replicateRepository, never()).deleteByRiaKeyAndReplicateNumber(any(), any());
  }

  @Test
  @DisplayName("Calculate average should return correct average value")
  void calculateAverage_validList_shouldReturnCorrectAverage() {
    // Arrange
    List<Double> mcArray = Arrays.asList(1.0, 2.0, 3.0, 4.0, 5.0);
    BigDecimal riaKey = new BigDecimal(1234567890);

    // Act
    double result = moistureContentService.calculateAverage(riaKey, mcArray);

    // Assert
    assertEquals(3.0, result, 0.001, "The average should be 3.0");
    verify(testResultRepository).updateTestResultAvgValue(eq(riaKey), eq(3.0));
  }

  @Test
  @DisplayName("Calculate average should throw exception for empty list")
  void calculateAverage_emptyList_shouldThrowException() {
    // Arrange
    List<Double> mcArray = Collections.emptyList();
    BigDecimal riaKey = new BigDecimal(1234567890);

    assertThrows(IllegalArgumentException.class, () -> {
      moistureContentService.calculateAverage(riaKey, mcArray);
    });
  }

  @Test
  @DisplayName("Calculate average should throw exception for null list")
  void calculateAverage_nullList_shouldThrowException() {
    BigDecimal riaKey = new BigDecimal(1234567890);

    assertThrows(IllegalArgumentException.class, () -> {
      moistureContentService.calculateAverage(riaKey, null);
    });
  }
}
