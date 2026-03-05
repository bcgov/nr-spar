package ca.bc.gov.oracleapi.exception;

import ca.bc.gov.oracleapi.config.SparLog;
import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

  /**
   * Handles ConstraintViolationException thrown by Jakarta validation.
   *
   * @param ex the ConstraintViolationException
   * @return a map with error details
   */
  @ExceptionHandler(ConstraintViolationException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, String> handleConstraintViolation(ConstraintViolationException ex) {
    SparLog.error("Validation constraint violation occurred", ex);
    Map<String, String> errors = new HashMap<>();
    errors.put("error", "Validation failed");
    errors.put("message", "One or more request fields failed validation");
    return errors;
  }

  /**
   * Handles UserExistsException without exposing PII.
   *
   * @param ex the UserExistsException
   * @return a map with sanitized error details
   */
  @ExceptionHandler(UserExistsException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public Map<String, String> handleUserExists(UserExistsException ex) {
    SparLog.error("User registration failed: user already exists", ex);
    Map<String, String> errors = new HashMap<>();
    errors.put("error", "User already exists");
    errors.put("message", "This user account is already registered");
    return errors;
  }
}
