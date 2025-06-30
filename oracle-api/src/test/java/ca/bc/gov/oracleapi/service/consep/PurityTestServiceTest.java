package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.PurityReplicateDto;
import ca.bc.gov.oracleapi.dto.consep.PurityReplicateFormDto;
import ca.bc.gov.oracleapi.dto.consep.PurityTestDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.PurityReplicateEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.exception.InvalidTestActivityKeyException;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.PurityReplicateRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
 * The test class for purity test service.
 */
@ExtendWith(MockitoExtension.class)
class PurityTestServiceTest {

  @Mock
  private ActivityRepository activityRepository;

  @Mock
  private TestResultRepository testResultRepository;

  @Mock
  private PurityReplicateRepository replicateRepository;

  @Autowired
  @InjectMocks
  private PurityTestService purityTestService;

  private BigDecimal riaKey;
  private ActivityEntity activityEntity;
  private TestResultEntity testResultEntity;

  @BeforeEach
  void setUp() {
    riaKey = new BigDecimal("123");

    activityEntity = new ActivityEntity();
    activityEntity.setTestCategoryCode("TEST");
    activityEntity.setActualBeginDateTime(LocalDateTime.now().plusDays(1));
    activityEntity.setActualEndDateTime(LocalDateTime.now().plusDays(2));
    activityEntity.setRiaComment("Test comment");

    testResultEntity = new TestResultEntity();
    testResultEntity.setTestCompleteInd(1);
    testResultEntity.setSampleDesc("Sample");
    testResultEntity.setMoistureStatus("Status");
    testResultEntity.setMoisturePct(new BigDecimal("50.5"));
    testResultEntity.setAcceptResult(1);
  }

  @Test
  @DisplayName("Get purity test content should succeed")
  void getPurityContent_shouldSucceed() {
    BigDecimal riaKey = new BigDecimal(1234567890);
    ReplicateId replicateId = new ReplicateId(riaKey, 1);

    PurityReplicateEntity replicate1 = new PurityReplicateEntity();
    replicate1.setId(replicateId);
    replicate1.setPureSeedWeight(new BigDecimal(12.345));
    replicate1.setOtherSeedWeight(new BigDecimal(45.678));
    replicate1.setInertMttrWeight(new BigDecimal(58.901));
    replicate1.setReplicateAccInd(1);
    replicate1.setOverrideReason("Replicate was re-tested due to abnormal moisture content.");

    List<PurityReplicateEntity> replicatesList = List.of(replicate1);
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

    Optional<PurityTestDto> purityData = purityTestService
            .getPurityTestData(riaKey);

    assertEquals(purityData.get().testCompleteInd(), testData.getTestCompleteInd());
    assertEquals(purityData.get().sampleDesc(), testData.getSampleDesc());
    assertEquals(purityData.get().moistureStatus(), testData.getMoistureStatus());
    assertEquals(purityData.get().moisturePct(), testData.getMoisturePct());
    assertEquals(purityData.get().acceptResult(), testData.getAcceptResult());
    assertEquals(purityData.get().requestId(), activityData.getRequestId());
    assertEquals(purityData.get().seedlotNumber(), activityData.getSeedlotNumber());
    assertEquals(purityData.get().activityType(), activityData.getActivityTypeCode());
    assertEquals(purityData.get().testCategoryCode(), activityData.getTestCategoryCode());
    assertEquals(purityData.get().riaComment(), activityData.getRiaComment());
    assertEquals(purityData.get().actualBeginDateTime(), activityData.getActualBeginDateTime());
    assertEquals(purityData.get().actualEndDateTime(), activityData.getActualEndDateTime());
    purityData.get().replicatesList().forEach(
        rep -> {
            assertEquals(rep.riaKey(), replicate1.getId().getRiaKey());
            assertEquals(rep.replicateNumber(), replicate1.getId().getReplicateNumber());
            assertEquals(rep.pureSeedWeight(), replicate1.getPureSeedWeight());
            assertEquals(rep.otherSeedWeight(), replicate1.getOtherSeedWeight());
            assertEquals(rep.inertMttrWeight(), replicate1.getInertMttrWeight());
            assertEquals(rep.replicateAccInd(), replicate1.getReplicateAccInd());
            assertEquals(rep.overrideReason(), replicate1.getOverrideReason());
        }
    );
  }

  @Test
  @DisplayName("getPurityTest_errorTest")
  void getPurityTest_errorTest() {
    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          purityTestService.getPurityTestData(any());
        });
  }

  @Test
  @DisplayName("updateReplicateField - should return updated replicates")
  void updateReplicateField_shouldReturnUpdatedReplicates() {
    BigDecimal riaKey = new BigDecimal("1234567890");

    final PurityReplicateFormDto formDto = new PurityReplicateFormDto(
        1,
        new BigDecimal("1.0"),
        new BigDecimal("2.0"),
        new BigDecimal("3.0"),
        1,
        "override reason"
    );

    PurityReplicateEntity entity = new PurityReplicateEntity();
    ReplicateId replicateId = new ReplicateId(riaKey, 1);
    entity.setId(replicateId);
    entity.setPureSeedWeight(new BigDecimal("1.0"));
    entity.setOtherSeedWeight(new BigDecimal("2.0"));
    entity.setInertMttrWeight(new BigDecimal("3.0"));
    entity.setReplicateAccInd(1);
    entity.setOverrideReason("override reason");

    final List<PurityReplicateFormDto> requestList = List.of(formDto);

    List<PurityReplicateEntity> existingReplicates = List.of(entity);
    List<PurityReplicateEntity> savedReplicates = List.of(entity);

    when(replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, List.of(1)))
        .thenReturn(existingReplicates);
    when(replicateRepository.saveAll(anyList()))
        .thenReturn(savedReplicates);

    List<PurityReplicateEntity> result = purityTestService.updateReplicateField(
        riaKey, requestList);

    assertEquals(1, result.size());
    assertEquals(new BigDecimal("3.0"), result.get(0).getInertMttrWeight());

    verify(replicateRepository).findByRiaKeyAndReplicateNumbers(riaKey, List.of(1));
    verify(replicateRepository).saveAll(anyList());
  }

  @Test
  void validatePurityTestData_validData() {
    PurityReplicateDto replicateDto = new PurityReplicateDto(
        riaKey,
        1,
        new BigDecimal("12.345"),
        new BigDecimal("45.678"),
        new BigDecimal("58.901"),
        1,
        "Reason"
    );

    List<PurityReplicateDto> replicates = List.of(replicateDto);

    assertDoesNotThrow(() -> purityTestService.validatePurityReplicateData(replicates));
  }

  @Test
  void validatePurityData_missingRiaKey() {
    PurityReplicateDto replicateDto = new PurityReplicateDto(
        null,
        1,
        new BigDecimal("12.345"),
        new BigDecimal("45.678"),
        new BigDecimal("58.901"),
        1,
        "Reason"
    );
    List<PurityReplicateDto> replicates = List.of(replicateDto);

    assertThrows(ResponseStatusException.class, () ->
        purityTestService.validatePurityReplicateData(replicates));
  }

  @Test
  void validatePurityData_invalidPureSeedWeight() {
    PurityReplicateDto replicateDto = new PurityReplicateDto(
        riaKey,
        1,
        new BigDecimal("1000"),
        new BigDecimal("45.678"),
        new BigDecimal("58.901"),
        1,
        "Reason"
    );
    List<PurityReplicateDto> replicates = List.of(replicateDto);

    assertThrows(ResponseStatusException.class, () ->
        purityTestService.validatePurityReplicateData(replicates));
  }

  @Test
  void validatePurityData_invalidOtherSeedWeight() {
    PurityReplicateDto replicateDto = new PurityReplicateDto(
        riaKey,
        1,
        new BigDecimal("45.678"),
        new BigDecimal("1000"),
        new BigDecimal("58.901"),
        1,
        "Reason"
    );
    List<PurityReplicateDto> replicates = List.of(replicateDto);

    assertThrows(ResponseStatusException.class, () ->
        purityTestService.validatePurityReplicateData(replicates));
  }

  @Test
  void validatePurityData_invalidInertMttrWeight() {
    PurityReplicateDto replicateDto = new PurityReplicateDto(
        riaKey,
        1,
        new BigDecimal("45.678"),
        new BigDecimal("58.901"),
        new BigDecimal("1000"),
        1,
        "Reason"
    );
    List<PurityReplicateDto> replicates = List.of(replicateDto);

    assertThrows(ResponseStatusException.class, () ->
        purityTestService.validatePurityReplicateData(replicates));
  }

  @Test
  @DisplayName("Delete a single replicate should succeed")
  void deletePurityReplicate_shouldSucceed() {
    BigDecimal riaKey = new BigDecimal(1234567890);
    Integer replicateNumber = 1;
    PurityReplicateEntity mockReplicate = new PurityReplicateEntity();

    when(replicateRepository.findSingleReplicate(riaKey, replicateNumber)).thenReturn(
        Optional.of(mockReplicate));

    doNothing().when(replicateRepository).deleteByRiaKeyAndReplicateNumber(riaKey, replicateNumber);
    assertDoesNotThrow(() -> purityTestService.deleteSinglePurityReplicate(
        riaKey, replicateNumber));

    verify(replicateRepository, times(1)).deleteByRiaKeyAndReplicateNumber(riaKey, replicateNumber);
  }

  @Test
  @DisplayName("Delete a single replicate should throw exception when not found")
  void deletePurityReplicate_shouldThrowExceptionIfNotFound() {
    Integer replicateNumber = 1;

    when(replicateRepository.findSingleReplicate(riaKey, replicateNumber)).thenReturn(
        Optional.empty());

    assertThrows(InvalidTestActivityKeyException.class,
        () -> purityTestService.deleteSinglePurityReplicate(riaKey, replicateNumber));

    verify(replicateRepository, never()).deleteByRiaKeyAndReplicateNumber(any(), any());
  }

  @Test
  void deletePurityReplicates_shouldSucceed() {
    List<Integer> replicateNumbers = List.of(1, 2, 3);

    List<PurityReplicateEntity> mockFoundReplicates = List.of(new PurityReplicateEntity());
    when(replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers))
        .thenReturn(mockFoundReplicates);

    doNothing().when(replicateRepository).deleteByRiaKeyAndReplicateNumbers(
        riaKey, replicateNumbers);
    assertDoesNotThrow(() -> purityTestService.deletePurityReplicates(
        riaKey, replicateNumbers));

    verify(replicateRepository, times(1))
        .deleteByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers);
  }

  @Test
  void deletePurityReplicates_shouldThrowExceptionIfNotFound() {
    List<Integer> replicateNumbers = List.of(4, 5, 6);

    when(replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers))
        .thenReturn(Collections.emptyList());

    assertThrows(InvalidTestActivityKeyException.class, () -> {
      purityTestService.deletePurityReplicates(riaKey, replicateNumbers);
    });

    verify(replicateRepository, never())
        .deleteByRiaKeyAndReplicateNumbers(any(), any());
  }
}
