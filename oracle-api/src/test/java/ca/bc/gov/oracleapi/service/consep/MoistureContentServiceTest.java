package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.MoistureContentConesDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.ReplicateEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.dto.consep.ReplicateDto;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.ReplicateRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;

/** The test class for Moisture Content Service. */
@ExtendWith(MockitoExtension.class)
class MoistureContentServiceTest {

  @Mock private ActivityRepository activityRepository;

  @Mock private TestResultRepository testResultRepository;

  @Mock private ReplicateRepository replicateRepository;

  @Autowired @InjectMocks private MoistureContentService moistureContentService;

  @Test
  @DisplayName("Get moiture cone content should succeed")
  void getMoistureConeContent_shouldSucceed() {
    BigDecimal riaKey = new BigDecimal(1234567890);
    ReplicateId replicateId = new ReplicateId(riaKey, 1);

    ReplicateEntity replicate1 = new ReplicateEntity();
    replicate1.setId(replicateId);
    replicate1.setContainerId("A123");
    replicate1.setFreshSeed(new BigDecimal(12.345));
    replicate1.setContainerAndDryWeight(new BigDecimal(45.678));
    replicate1.setContainerWeight(new BigDecimal(58.901));
    replicate1.setDryWeight(new BigDecimal(46.784));
    replicate1.setReplicateAccInd(1);
    replicate1.setOverrideReason("Replicate was re-tested due to abnormal moisture content.");
    replicate1.setReplicateComment("Equipment calibration issue.");

    List<ReplicateEntity> replicatesList = List.of(replicate1);
    List<Integer> replicateIds = IntStream.rangeClosed(1, 8)
                                      .boxed()
                                      .collect(Collectors.toList());

    when(replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateIds))
        .thenReturn(replicatesList);

    LocalDateTime now = LocalDateTime.now();

    ActivityEntity activityData = new ActivityEntity();
    activityData.setTestCategoryCode("CNN");
    activityData.setRiaComment("Activity finished.");
    activityData.setActualEndDateTime(now.plusDays(30L));
    activityData.setActualBeginDateTime(now.minusDays(1L));

    when(activityRepository.findById(riaKey))
        .thenReturn(Optional.of(activityData));

    TestResultEntity testData = new TestResultEntity();
    testData.setTestCompleteInd(1);
    testData.setSampleDesc("Sample description.");
    testData.setMoistureStatus("MOI");;
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
        }
    );
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
  @DisplayName("validateMoistureConeContentData_shouldSucceed")
  void validateMoistureConeContentData_shouldSucceed() {
    ReplicateEntity replicate1 = new ReplicateEntity();
    replicate1.setId(new ReplicateId(new BigDecimal(1234567890), 1));
    replicate1.setContainerId("A123");
    replicate1.setFreshSeed(new BigDecimal(12.345));
    replicate1.setContainerAndDryWeight(new BigDecimal(45.678));
    replicate1.setContainerWeight(new BigDecimal(58.901));
    replicate1.setDryWeight(new BigDecimal(46.784));
    replicate1.setReplicateAccInd(1);
    replicate1.setOverrideReason("Replicate was re-tested due to abnormal moisture content.");
    replicate1.setReplicateComment("Equipment calibration issue.");

    List<ReplicateEntity> replicatesList = List.of(replicate1);

    Assertions.assertDoesNotThrow(() -> {
      moistureContentService.validateMoistureConeContentData(replicatesList.stream()
          .map(rep -> new ReplicateDto(rep.getId().getRiaKey(),
              rep.getId().getReplicateNumber(),
              rep.getContainerId(),
              rep.getContainerWeight(),
              rep.getFreshSeed(),
              rep.getContainerAndDryWeight(),
              rep.getDryWeight(),
              rep.getReplicateAccInd(),
              rep.getReplicateComment(),
              rep.getOverrideReason()))
          .collect(Collectors.toList()));
    });
  }

  @Test
  @DisplayName("validateMoistureConeContentData_errorTest")
  void validateMoistureConeContentData_errorTest() {
    ReplicateEntity replicate1 = new ReplicateEntity();
    replicate1.setId(new ReplicateId(new BigDecimal(1234567890), 1));
    replicate1.setContainerId("A123");
    replicate1.setFreshSeed(new BigDecimal(12.345));
    replicate1.setContainerAndDryWeight(new BigDecimal(45.678));
    replicate1.setContainerWeight(new BigDecimal(58.901));
    replicate1.setDryWeight(new BigDecimal(46.784));
    replicate1.setReplicateAccInd(1);
    replicate1.setOverrideReason("Replicate was re-tested due to abnormal moisture content.");
    replicate1.setReplicateComment("Equipment calibration issue.");

    List<ReplicateEntity> replicatesList = List.of(replicate1);

    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.validateMoistureConeContentData(replicatesList.stream()
              .map(rep -> new ReplicateDto(rep.getId().getRiaKey(),
                  rep.getId().getReplicateNumber(),
                  rep.getContainerId(),
                  rep.getContainerWeight(),
                  rep.getFreshSeed(),
                  rep.getContainerAndDryWeight(),
                  rep.getDryWeight(),
                  rep.getReplicateAccInd(),
                  rep.getReplicateComment(),
                  rep.getOverrideReason()))
              .collect(Collectors.toList()));
        });
  }

  @Test
  @DisplayName("validateMoistureConeContentData_errorTest")
  void validateMoistureConeContentData_errorTest2() {
    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.validateMoistureConeContentData(List.of());
        });
  }

  @Test
  @DisplayName("validateMoistureConeContentData_errorTest")
  void validateMoistureConeContentData_errorTest3() {
    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.validateMoistureConeContentData(null);
        });
  }

  @Test
  @DisplayName("validateMoistureConeContentData_errorTest")
  void validateMoistureConeContentData_errorTest4() {
    ReplicateEntity replicate1 = new ReplicateEntity();
    replicate1.setId(new ReplicateId(new BigDecimal(1234567890), 1));
    replicate1.setContainerId("A123");
    replicate1.setFreshSeed(new BigDecimal(12.345));
    replicate1.setContainerAndDryWeight(new BigDecimal(45.678));
    replicate1.setContainerWeight(new BigDecimal(58.901));
    replicate1.setDryWeight(new BigDecimal(46.784));
    replicate1.setReplicateAccInd(1);
    replicate1.setOverrideReason("Replicate was re-tested due to abnormal moisture content.");
    replicate1.setReplicateComment("Equipment calibration issue.");

    List<ReplicateEntity> replicatesList = List.of(replicate1);

    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.validateMoistureConeContentData(replicatesList.stream()
              .map(rep -> new ReplicateDto(rep.getId().getRiaKey(),
                  rep.getId().getReplicateNumber(),
                  rep.getContainerId(),
                  rep.getContainerWeight(),
                  rep.getFreshSeed(),
                  rep.getContainerAndDryWeight(),
                  rep.getDryWeight(),
                  rep.getReplicateAccInd(),
                  rep.getReplicateComment(),
                  rep.getOverrideReason()))
              .collect(Collectors.toList()));
        });
  }

  @Test
  @DisplayName("validateMoistureConeActivityData_shouldSucceed")
  void validateMoistureConeActivityData_shouldSucceed() {
    ActivityEntity activityData = new ActivityEntity();
    activityData.setTestCategoryCode("CNN");
    activityData.setRiaComment("Activity finished.");
    activityData.setActualEndDateTime(LocalDateTime.now().plusDays(30L));
    activityData.setActualBeginDateTime(LocalDateTime.now().minusDays(1L));

    Assertions.assertDoesNotThrow(() -> {
      moistureContentService.validateMoistureContentActivityData(activityData);
    });
  }

  @Test
  @DisplayName("validateMoistureConeActivityData_errorTest")
  void validateMoistureConeActivityData_errorTest() {
    ActivityEntity activityData = new ActivityEntity();
    activityData.setTestCategoryCode("CNN");
    activityData.setRiaComment("Activity finished.");
    activityData.setActualEndDateTime(LocalDateTime.now().plusDays(30L));

    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.validateMoistureContentActivityData(activityData);
        });
  }

  @Test
  @DisplayName("validateMoistureConeActivityData_errorTest")
  void validateMoistureConeActivityData_errorTest2() {
    ActivityEntity activityData = new ActivityEntity();
    activityData.setTestCategoryCode("CNN");
    activityData.setRiaComment("Activity finished.");
    activityData.setActualBeginDateTime(LocalDateTime.now().minusDays(1L));

    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.validateMoistureContentActivityData(activityData);
        });
  }

  @Test
  @DisplayName("validateMoistureConeActivityData_errorTest")
  void validateMoistureConeActivityData_errorTest3() {
    ActivityEntity activityData = new ActivityEntity();
    activityData.setTestCategoryCode("CNN");
    activityData.setActualEndDateTime(LocalDateTime.now().plusDays(30L));
    activityData.setActualBeginDateTime(LocalDateTime.now().minusDays(1L));

    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.validateMoistureContentActivityData(activityData);
        });
  }

  @Test
  @DisplayName("validateMoistureConeActivityData_errorTest")
  void validateMoistureConeActivityData_errorTest4() {
    ActivityEntity activityData = new ActivityEntity();
    activityData.setRiaComment("Activity finished.");
    activityData.setActualEndDateTime(LocalDateTime.now().plusDays(30L));
    activityData.setActualBeginDateTime(LocalDateTime.now().minusDays(1L));

    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.validateMoistureContentActivityData(activityData);
        });
  }

  @Test
  @DisplayName("validateMoistureConeActivityData_errorTest")
  void validateMoistureConeActivityData_errorTest5() {
    ActivityEntity activityData = new ActivityEntity();
    activityData.setTestCategoryCode("CNN");
    activityData.setRiaComment("Activity finished.");
    activityData.setActualEndDateTime(LocalDateTime.now().plusDays(30L));
    activityData.setActualBeginDateTime(LocalDateTime.now().minusDays(1L));

    Assertions.assertDoesNotThrow(() -> {
      moistureContentService.validateMoistureContentActivityData(activityData);
    });
  }

  @Test
  @DisplayName("updateTestResultStatusToCompleted_shouldSucceed")
  void updateTestResultStatusToCompleted_shouldSucceed() {
    Assertions.assertDoesNotThrow(() -> {
      moistureContentService.updateTestResultStatusToCompleted(new BigDecimal(1234567890));
    });
  }

  @Test
  @DisplayName("updateTestResultStatusToAccepted_shouldSucceed")
  void updateTestResultStatusToAccepted_shouldSucceed() {
    Assertions.assertDoesNotThrow(() -> {
      moistureContentService.acceptMoistureContentData(new BigDecimal(1234567890));
    });
  }

  @Test
  @DisplayName("updateTestResultStatusToAccepted_errorTest")
  void updateTestResultStatusToAccepted_errorTest() {
    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.acceptMoistureContentData(new BigDecimal(1234567890));
        });
  }

  @Test
  @DisplayName("updateTestResultStatusToAccepted_errorTest")
  void updateTestResultStatusToAccepted_errorTest2() {
    when(testResultRepository.findById(any()))
        .thenReturn(Optional.empty());

    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.acceptMoistureContentData(new BigDecimal(1234567890));
        });
  }

  @Test
  @DisplayName("updateTestResultStatusToAccepted_errorTest")
  void updateTestResultStatusToAccepted_errorTest3() {
    TestResultEntity testData = new TestResultEntity();
    testData.setTestCompleteInd(0);
    testData.setSampleDesc("Sample description.");
    testData.setMoistureStatus("MOI");
    ;
    testData.setMoisturePct(new BigDecimal(12.345));
    testData.setAcceptResult(1);

    when(testResultRepository.findById(any()))
        .thenReturn(Optional.of(testData));

    Assertions.assertThrows(ResponseStatusException.class,
        () -> {
          moistureContentService.acceptMoistureContentData(new BigDecimal(1234567890));
        });
  }
  
  @Test
  @DisplayName("updateTestResultStatusToAccepted_errorTest")
  void updateTestResultStatusToAccepted_errorTest4() {
    TestResultEntity testData = new TestResultEntity();
    testData.setTestCompleteInd(1);
    testData.setSampleDesc("Sample description.");
    testData.setMoistureStatus("MOI");
    ;
    testData.setMoisturePct(new BigDecimal(12.345));
    testData.setAcceptResult(1);

    when(testResultRepository.findById(any()))
        .thenReturn(Optional.of(testData));

    Assertions.assertDoesNotThrow(() -> {
      moistureContentService.acceptMoistureContentData(new BigDecimal(1234567890));
    });
  }

  @Test
  @DisplayName("updateTestResultStatusToAccepted_errorTest")
  void updateTestResultStatusToAccepted_errorTest5() {
    TestResultEntity testData = new TestResultEntity();
    testData.setTestCompleteInd(1);
    testData.setSampleDesc("Sample description.");
    testData.setMoistureStatus("MOI");
    ;
    testData.setMoisturePct(new BigDecimal(12.345));
    testData.setAcceptResult(1);

    when(testResultRepository.findById(any()))
        .thenReturn(Optional.of(testData));

    Assertions.assertDoesNotThrow(() -> {
      moistureContentService.acceptMoistureContentData(new BigDecimal(1234567890));
    });
  }
}
