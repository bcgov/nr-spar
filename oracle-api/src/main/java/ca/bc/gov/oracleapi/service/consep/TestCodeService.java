package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.dto.consep.TestCodeDto;
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
   * Get all valid codes for a given column name,
   * where effective date <= today and expiry date >= today or null.
   *
   * @param activity the column name to filter codes
   * @return list of codes as strings
   */
  public List<String> getCodesByColumnActivity(String activity) {
    return testCodeRepository.findCodesByActivity(activity)
        .stream()
        .map(obj -> (String) obj[0])
        .toList();
  }
}
