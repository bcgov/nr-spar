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
   * Get all valid activity type codes
   * where effective date <= today and expiry date >= today or null.
   *
   * @return list of TestCodeDto
   */
  public List<TestCodeDto> getTestTypeCodes() {
    return testCodeRepository.findTestTypeCodes()
        .stream()
        .map(obj -> new TestCodeDto(
            (String) obj[0], // codeArgument
            (String) obj[1]  // expandedResult
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
            (String) obj[0], // codeArgument
            (String) obj[1]  // expandedResult
        ))
        .toList();
  }
}
