package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * The test class for Test Result Service.
 */
@ExtendWith(MockitoExtension.class)
class TestResultServiceTest {

  @Mock
  private TestResultRepository testResultRepository;

  @Autowired
  @InjectMocks
  private TestResultService testResultService;

  private BigDecimal riaKey;
  private TestResultEntity testResultEntity;

  @BeforeEach
  void setUp() {
    riaKey = new BigDecimal("123");

    testResultEntity = new TestResultEntity();
    testResultEntity.setTestCompleteInd(1);
    testResultEntity.setSampleDesc("Sample");
    testResultEntity.setMoistureStatus("Status");
    testResultEntity.setMoisturePct(new BigDecimal("50.5"));
    testResultEntity.setAcceptResult(1);
  }


  @Test
  void updateTestResultStatusToCompleted_success() {
    doNothing().when(testResultRepository).updateTestResultStatusToCompleted(riaKey);

    assertDoesNotThrow(() ->
      testResultService.updateTestResultStatusToCompleted(riaKey));
    verify(testResultRepository).updateTestResultStatusToCompleted(riaKey);
  }

  @Test
  void acceptMoistureContentData_success() {
    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(testResultEntity));

    assertDoesNotThrow(() ->
      testResultService.acceptTestResult(riaKey));
    verify(testResultRepository).updateTestResultStatusToAccepted(riaKey);
  }

  @Test
  void acceptMoistureContentData_testNotCompleted() {
    testResultEntity.setTestCompleteInd(0);
    testResultEntity.setSampleDesc("Sample");
    testResultEntity.setMoistureStatus("Status");
    testResultEntity.setMoisturePct(new BigDecimal("50.5"));
    testResultEntity.setAcceptResult(1);

    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(testResultEntity));

    ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
      testResultService.acceptTestResult(riaKey));

    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    assertEquals("Test is not completed", exception.getReason());
  }
}
