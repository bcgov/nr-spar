package ca.bc.gov.backendstartapi.validation;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validates {@link JsonNode} payloads for saved search criteria.
 *
 * <p>Accepts only JSON objects and arrays. {@code null}, scalars (string/number/boolean), and
 * missing nodes are all rejected.
 */
public class ValidSearchCriteriaJsonValidator
    implements ConstraintValidator<ValidSearchCriteriaJson, JsonNode> {

  @Override
  public boolean isValid(JsonNode value, ConstraintValidatorContext context) {
    if (value == null) {
      return false;
    }
    if (value.isNull() || value.isMissingNode()) {
      return false;
    }
    return value.isObject() || value.isArray();
  }
}
