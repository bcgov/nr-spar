package ca.bc.gov.oracleapi.service.consep;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.TestCodeDto;
import ca.bc.gov.oracleapi.repository.consep.TestCodeRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class TestCodeServiceTest {

  @Mock
  private TestCodeRepository testCodeRepository;

  @InjectMocks
  private TestCodeService testCodeService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void getTestTypeCodes_shouldReturnMappedDtos() {
    // Arrange
    when(testCodeRepository.findTestTypeCodes()).thenReturn(List.of(
      new Object[]{"TT1", "Test type 1"},
      new Object[]{"TT2", "Test type 2"}
    ));

    // Act
    List<TestCodeDto> result = testCodeService.getTestTypeCodes();

    // Assert
    assertThat(result).hasSize(2);
    assertThat(result.get(0).code()).isEqualTo("TT1");
    assertThat(result.get(0).description()).isEqualTo("Test type 1");
    assertThat(result.get(1).code()).isEqualTo("TT2");
    assertThat(result.get(1).description()).isEqualTo("Test type 2");
  }

  @Test
  void getTestCategoryCodes_shouldReturnMappedDtos() {
    // Arrange
    when(testCodeRepository.findTestCategoryCodes()).thenReturn(List.of(
      new Object[]{"CAT1", "Category 1"},
      new Object[]{"CAT2", "Category 2"}
    ));

    // Act
    List<TestCodeDto> result = testCodeService.getTestCategoryCodes();

    // Assert
    assertThat(result).hasSize(2);
    assertThat(result.get(0).code()).isEqualTo("CAT1");
    assertThat(result.get(0).description()).isEqualTo("Category 1");
    assertThat(result.get(1).code()).isEqualTo("CAT2");
    assertThat(result.get(1).description()).isEqualTo("Category 2");
  }

  @Test
  void getTestTypeCodes_shouldReturnEmptyListIfNoData() {
    // Arrange
    when(testCodeRepository.findTestTypeCodes()).thenReturn(List.of());

    // Act
    List<TestCodeDto> result = testCodeService.getTestTypeCodes();

    // Assert
    assertThat(result).isEmpty();
  }

  @Test
  void getTestCategoryCodes_shouldReturnEmptyListIfNoData() {
    // Arrange
    when(testCodeRepository.findTestCategoryCodes()).thenReturn(List.of());

    // Act
    List<TestCodeDto> result = testCodeService.getTestCategoryCodes();

    // Assert
    assertThat(result).isEmpty();
  }

  @Test
  void getCodesByColumnActivity_shouldReturnListOfCodes() {
    // Arrange
    String activity = "TEST_ACTIVITY";
    when(testCodeRepository.findCodesByActivity(activity)).thenReturn(List.of(
        new Object[] { "CODE1" },
        new Object[] { "CODE2" }));
    // Act
    List<String> result = testCodeService.getCodesByColumnActivity(activity);
    // Assert
    assertThat(result).hasSize(2);
    assertThat(result).containsExactly("CODE1", "CODE2");
  }
  
  @Test
  void getCodesByColumnActivity_shouldReturnEmptyListIfNoData() {
    // Arrange
    String activity = "TEST_ACTIVITY";
    when(testCodeRepository.findCodesByActivity(activity)).thenReturn(List.of());
    // Act
    List<String> result = testCodeService.getCodesByColumnActivity(activity);
    // Assert
    assertThat(result).isEmpty(); 
  }
}
