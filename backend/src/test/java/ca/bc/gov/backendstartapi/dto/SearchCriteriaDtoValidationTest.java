package ca.bc.gov.backendstartapi.dto;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.node.IntNode;
import com.fasterxml.jackson.databind.node.TextNode;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
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
  @DisplayName("null criteriaJson fails validation")
  void nullNodeInvalid() {
    assertFalse(validator.validate(new SearchCriteriaDto(null)).isEmpty());
  }

  @Test
  @DisplayName("blank JSON text fails validation")
  void blankTextNodeInvalid() {
    assertFalse(validator.validate(new SearchCriteriaDto(TextNode.valueOf(""))).isEmpty());
  }

  @Test
  @DisplayName("JSON number fails validation (must be object or array)")
  void numberNodeInvalid() {
    assertFalse(validator.validate(new SearchCriteriaDto(IntNode.valueOf(42))).isEmpty());
  }

  @Test
  @DisplayName("JSON array passes validation")
  void arrayNodeValid() {
    var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
    assertTrue(validator.validate(new SearchCriteriaDto(mapper.createArrayNode())).isEmpty());
  }

  @Test
  @DisplayName("object criteria passes validation")
  void objectNodeValid() throws Exception {
    var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
    SearchCriteriaDto dto = new SearchCriteriaDto(mapper.readTree("{\"status\":\"active\"}"));
    assertTrue(validator.validate(dto).isEmpty());
  }
}
