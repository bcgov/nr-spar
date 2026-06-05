package ca.bc.gov.backendstartapi.exception;

import ca.bc.gov.backendstartapi.dto.SeedlotValidationError;
import java.util.List;
import lombok.Getter;

/** Thrown when the seedlot submission form fails one or more server-side validations. */
@Getter
public class SeedlotSubmissionValidationException extends RuntimeException {

  private final List<SeedlotValidationError> errors;

  /**
   * Creates a new instance with the given list of field-level validation errors.
   *
   * @param errors the validation errors found during submission
   */
  public SeedlotSubmissionValidationException(List<SeedlotValidationError> errors) {
    super(errors.size() + " field(s) with validation problems!");
    this.errors = errors;
  }
}
