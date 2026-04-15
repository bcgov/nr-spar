package ca.bc.gov.backendstartapi.dto;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.node.TextNode;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SearchCriteriaDtoValidationTest {

  private static ValidatorFactory factory;
  private static Validator validator;

  @BeforeAll
  static void setup() {
    factory = Validation.buildDefaultValidatorFactory();
    validator = factory.getValidator();
  }

  @AfterAll
  static void tearDown() {
    factory.close();
  }

  @Test
  @DisplayName("blank JSON text fails validation")
  void blankTextNodeInvalid() {
    Set<ConstraintViolation<SearchCriteriaDto>> violations =
        validator.validate(new SearchCriteriaDto(TextNode.valueOf("")));
    assertFalse(violations.isEmpty());
  }

  @Test
  @DisplayName("object criteria passes validation")
  void objectNodeValid() throws Exception {
    var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
    SearchCriteriaDto dto =
        new SearchCriteriaDto(mapper.readTree("{\"status\":\"active\"}"));
    assertTrue(validator.validate(dto).isEmpty());
  }
}
