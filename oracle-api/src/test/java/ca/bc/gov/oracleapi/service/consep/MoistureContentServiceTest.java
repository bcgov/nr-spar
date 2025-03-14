package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
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
class MoistureContentServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private TestResultRepository testResultRepository;

    @Mock
    private ReplicateRepository replicateRepository;

    @Autowired
    @InjectMocks
    private MoistureContentService moistureContentService;

    private BigDecimal riaKey;
    private ActivityEntity activityEntity;
    private TestResultEntity testResultEntity;
    private List<ReplicateEntity> replicateEntities;

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

        ReplicateEntity replicate = new ReplicateEntity();
        ReplicateId replicateId = new ReplicateId();
        replicateId.setRiaKey(riaKey);
        replicateId.setReplicateNumber(1);
        replicate.setId(replicateId);
        replicate.setContainerId("ABC");
        replicate.setContainerWeight(new BigDecimal("12.345"));
        replicate.setFreshSeed(new BigDecimal("45.678"));
        replicate.setContainerAndDryWeight(new BigDecimal("58.901"));
        replicate.setDryWeight(new BigDecimal("46.789"));
        replicate.setReplicateAccInd(1);
        replicate.setReplicateComment("Comment");
        replicate.setOverrideReason("Reason");
        replicateEntities = List.of(replicate);
    }

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
        testData.setMoistureStatus("MOI");
        ;
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
    void validateMoistureConeContentData_validData() {
        ReplicateDto replicateDto = new ReplicateDto(
                riaKey, 1, "ABC", new BigDecimal("12.345"),
                new BigDecimal("45.678"), new BigDecimal("58.901"),
                new BigDecimal("46.789"), 1, "Comment", "Reason");
        List<ReplicateDto> replicates = List.of(replicateDto);

        assertDoesNotThrow(() -> moistureContentService.validateMoistureConeContentData(replicates));
    }

    @Test
    void validateMoistureConeContentData_missingRiaKey() {
        ReplicateDto replicateDto = new ReplicateDto(
                null, 1, "ABC", new BigDecimal("12.345"),
                new BigDecimal("45.678"), new BigDecimal("58.901"),
                new BigDecimal("46.789"), 1, "Comment", "Reason"
        );
        List<ReplicateDto> replicates = List.of(replicateDto);

        assertThrows(ResponseStatusException.class, () ->
                moistureContentService.validateMoistureConeContentData(replicates));
    }

    @Test
    void validateMoistureConeContentData_invalidContainerWeight() {
        ReplicateDto replicateDto = new ReplicateDto(
                riaKey, 1, "ABC", new BigDecimal("1000"),
                new BigDecimal("45.678"), new BigDecimal("58.901"),
                new BigDecimal("46.789"), 1, "Comment", "Reason"
        );
        List<ReplicateDto> replicates = List.of(replicateDto);

        assertThrows(ResponseStatusException.class, () ->
                moistureContentService.validateMoistureConeContentData(replicates));
    }

    @Test
    void validateMoistureContentActivityData_validData() {
        assertDoesNotThrow(() ->
                moistureContentService.validateMoistureContentActivityData(activityEntity));
    }

    @Test
    void validateMoistureContentActivityData_missingTestCategory() {
        activityEntity.setTestCategoryCode(null);
        assertThrows(ResponseStatusException.class, () ->
                moistureContentService.validateMoistureContentActivityData(activityEntity));
    }

    @Test
    void validateMoistureContentActivityData_pastBeginDate() {
        activityEntity.setActualBeginDateTime(LocalDateTime.now().minusDays(1));
        assertThrows(ResponseStatusException.class, () ->
                moistureContentService.validateMoistureContentActivityData(activityEntity));
    }

    @Test
    void updateTestResultStatusToCompleted_success() {
        doNothing().when(testResultRepository).updateTestResultStatusToCompleted(riaKey);

        assertDoesNotThrow(() ->
                moistureContentService.updateTestResultStatusToCompleted(riaKey));
        verify(testResultRepository).updateTestResultStatusToCompleted(riaKey);
    }

    @Test
    void acceptMoistureContentData_success() {
        ReplicateEntity replicate = new ReplicateEntity();
        ReplicateId replicateId = new ReplicateId();
        replicateId.setRiaKey(riaKey);
        replicateId.setReplicateNumber(1);
        replicate.setId(replicateId);
        replicate.setContainerId("ABC");
        replicate.setContainerWeight(new BigDecimal("12.345"));
        replicate.setFreshSeed(new BigDecimal("45.678"));
        replicate.setContainerAndDryWeight(new BigDecimal("58.901"));
        replicate.setDryWeight(new BigDecimal("46.789"));
        replicate.setReplicateAccInd(1);
        replicate.setReplicateComment("Comment");
        replicate.setOverrideReason("Reason");
        replicateEntities = List.of(replicate);

        when(activityRepository.findById(riaKey)).thenReturn(Optional.of(activityEntity));
        when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(testResultEntity));
        when(replicateRepository.findByRiaKeyAndReplicateNumbers(any(), any())).thenReturn(replicateEntities);

        assertDoesNotThrow(() ->
                moistureContentService.acceptMoistureContentData(riaKey));
        verify(testResultRepository).updateTestResultStatusToAccepted(riaKey);
    }

    @Test
    void acceptMoistureContentData_testNotCompleted() {
        testResultEntity.setTestCompleteInd(0);
        testResultEntity.setSampleDesc("Sample");
        testResultEntity.setMoistureStatus("Status");
        testResultEntity.setMoisturePct(new BigDecimal("50.5"));
        testResultEntity.setAcceptResult(1);

        when(activityRepository.findById(riaKey)).thenReturn(Optional.of(activityEntity));
        when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(testResultEntity));
        when(replicateRepository.findByRiaKeyAndReplicateNumbers(any(), any())).thenReturn(replicateEntities);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                moistureContentService.acceptMoistureContentData(riaKey));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Test is not completed", exception.getReason());
    }
}
