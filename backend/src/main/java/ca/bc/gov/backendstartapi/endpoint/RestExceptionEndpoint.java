package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.exception.ReportGenerationException;
import ca.bc.gov.backendstartapi.exception.SeedlotSubmissionValidationException;
import ca.bc.gov.backendstartapi.response.ValidationExceptionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** This class is responsible for handling all kind of exceptions and validations. */
@RestControllerAdvice
public class RestExceptionEndpoint {

  /**
   * Handle all jakarta validation exceptions.
   *
   * @param ex MethodArgumentNotValidException instance
   * @return a Map of String containing all the invalid fields and messages
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ValidationExceptionResponse> validationException(
      MethodArgumentNotValidException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ValidationExceptionResponse(ex.getFieldErrors()));
  }

  /**
   * Handle seedlot submission validation errors.
   *
   * @param ex the exception carrying the list of field-level errors
   * @return a 400 response with all validation problems listed
   */
  @ExceptionHandler(SeedlotSubmissionValidationException.class)
  ResponseEntity<ValidationExceptionResponse> seedlotSubmissionValidation(
      SeedlotSubmissionValidationException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ValidationExceptionResponse.fromSeedlotErrors(ex.getErrors()));
  }

  /**
   * Handle Jasper report compilation or export failures.
   *
   * @param ex the report generation exception
   * @return a 500 response with the error message
   */
  @ExceptionHandler(ReportGenerationException.class)
  ResponseEntity<String> reportGeneration(ReportGenerationException ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
  }
}
