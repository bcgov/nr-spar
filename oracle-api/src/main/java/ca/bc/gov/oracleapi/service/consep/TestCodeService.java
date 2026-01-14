package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.dto.consep.TestCodeDto;
import ca.bc.gov.oracleapi.entity.consep.TestCodeEntity;
import ca.bc.gov.oracleapi.repository.consep.CodeSubsetRepository;
import ca.bc.gov.oracleapi.repository.consep.TestCodeRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service for retrieving test codes from CONSEP code list table.
 */
@Service
@RequiredArgsConstructor
public class TestCodeService {

  private final TestCodeRepository testCodeRepository;
  private final CodeSubsetRepository codeSubsetRepository;

  /**
   * Get all valid test type codes
   * where effective date <= today and expiry date >= today or null.
   *
   * @return list of TestCodeDto
   */
  public List<TestCodeDto> getTestTypeCodes() {
    return testCodeRepository.findTestTypeCodes()
        .stream()
        .map(obj -> new TestCodeDto(
            (String) obj[0],
            (String) obj[1]
        ))
        .toList();
  }

  /**
   * Get all valid test category codes,
   * where effective date <= today and expiry date >= today or null.
   *
   * @return list of TestCodeDto
   */
  public List<TestCodeDto> getTestCategoryCodes() {
    return testCodeRepository.findTestCategoryCodes()
        .stream()
        .map(obj -> new TestCodeDto(
            (String) obj[0],
            (String) obj[1]))
        .toList();
  }
  
  /**
   * Retrieves all valid code values for a specific test-code activity.
   *
   * The {@code activity} parameter represents a value of the
   * {@code columnName} field in {@link TestCodeEntity}, such as
   * {@code "DEBRIS_TYPE_CD"}, rather than an arbitrary database column name.
   * Only codes that are currently effective (effectiveDate <= today and
   * expiryDate >= today or null) are returned.
   *
   * @param activity the test code activity identifier (e.g. "DEBRIS_TYPE_CD")
   *                 used to filter codes by {@code TestCodeEntity.columnName}
   * @return list of valid code values as strings, sorted for consistent display
   */
  public List<String> getCodesByColumnActivity(String activity) {
    return testCodeRepository.findCodesByActivity(activity)
        .stream()
        .map(obj -> (String) obj[0])
        .toList();
  }

  /**
   * Get all valid request types,
   * where effective date <= today and expiry date >= today or null.
   *
   * @return list of TestCodeDto
   */
  public List<TestCodeDto> getRequestTypes() {
    return testCodeRepository.findRequestTypes()
        .stream()
        .map(obj -> new TestCodeDto(
            (String) obj[0], // code
            (String) obj[1]  // description
        ))
        .toList();
  }

  /**
   * Get all valid activity duration time unit codes,
   * where in-effect date <= today and expiry date >= today or null.
   *
   * @return list of code values as strings (e.g. "HR", "DY")
   */
  public List<String> getActivityDurationTimeUnits() {
    return codeSubsetRepository.findActivityDurationTimeUnit();
  }
}
