package ca.bc.gov.oracleapi.exception;

import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
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
    Map<String, String> errors = new HashMap<>();
    errors.put("error", "Validation failed");
    errors.put("message", ex.getMessage());
    return errors;
  }

  /**
   * Handles UserExistsException.
   *
   * @param ex the UserExistsException
   * @return a map with error details
   */
  @ExceptionHandler(UserExistsException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public Map<String, String> handleUserExists(UserExistsException ex) {
    Map<String, String> errors = new HashMap<>();
    errors.put("error", "User already exists");
    errors.put("message", ex.getMessage());
    return errors;
  }
}
