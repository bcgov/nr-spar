package ca.bc.gov.backendstartapi.validation;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/** Validates {@link JsonNode} payloads for saved search criteria. */
public class ValidSearchCriteriaJsonValidator
    implements ConstraintValidator<ValidSearchCriteriaJson, JsonNode> {

  @Override
  public boolean isValid(JsonNode value, ConstraintValidatorContext context) {
    if (value == null) {
      return true;
    }
    if (value.isNull() || value.isMissingNode()) {
      return false;
    }
    return !(value.isTextual() && value.asText().isBlank());
  }
}
