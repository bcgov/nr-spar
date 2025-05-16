package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** The class for Moisture Content Cones Service. */
@Service
@RequiredArgsConstructor
public class TestResultService {

  private final TestResultRepository testResultRepository;

  /**
   * Update the test status to "completed".
   *
   * @param riaKey the identifier key for all table related to MCC
   */
  public void updateTestResultStatusToCompleted(BigDecimal riaKey) {
    SparLog.info("Updating test result status to completed for RIA_SKEY: {}", riaKey);

    testResultRepository.updateTestResultStatusToCompleted(riaKey);

    SparLog.info("Test result status updated to completed for RIA_SKEY: {}", riaKey);
  }

  /**
   * Accept the test results for the given riaKey.
   *
   * @param riaKey the identifier key for the test result table
   */
  public void acceptTestResult(BigDecimal riaKey) {
    SparLog.info("Accepting moisture content data for RIA_SKEY: {}", riaKey);

    Optional<TestResultEntity> testResultData = testResultRepository.findById(riaKey);

    if (testResultData.isEmpty()) {
      SparLog.warn("No data found for RIA_SKEY: {}", riaKey);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No data found for given RIA_KEY");
    }

    if (testResultData.get().getTestCompleteInd() == 0) {
      SparLog.error("Test is not completed for RIA_SKEY: {}", riaKey);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Test is not completed");
    }

    testResultRepository.updateTestResultStatusToAccepted(riaKey);
    SparLog.info("Test result accepted for RIA_SKEY: {}", riaKey);
  }

}
