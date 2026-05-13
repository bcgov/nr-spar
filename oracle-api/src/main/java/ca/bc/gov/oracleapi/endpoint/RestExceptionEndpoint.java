package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.exception.UserExistsException;
import ca.bc.gov.oracleapi.exception.UserNotFoundException;
import ca.bc.gov.oracleapi.response.ExceptionResponse;
import ca.bc.gov.oracleapi.response.ValidationExceptionResponse;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** This class is responsible for handling all kind of exceptions and validations. */
@RestControllerAdvice
public class RestExceptionEndpoint {

  /**
   * Handle all javax.validation exceptions.
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
   * Handle {@link ConstraintViolationException} raised when validation on
   * controller method parameters (e.g. {@code @PathVariable}) fails.
   *
   * @param ex ConstraintViolationException instance
   * @return a {@link ValidationExceptionResponse} listing the invalid fields
   */
  @ExceptionHandler(ConstraintViolationException.class)
  ResponseEntity<ValidationExceptionResponse> constraintViolation(
      ConstraintViolationException ex) {
    List<FieldError> fieldErrors = ex.getConstraintViolations().stream()
        .map(cv -> {
          String path = cv.getPropertyPath().toString();
          String fieldName = path.contains(".")
              ? path.substring(path.lastIndexOf('.') + 1)
              : path;
          return new FieldError(
              cv.getRootBeanClass().getSimpleName(),
              fieldName,
              cv.getMessage()
          );
        })
        .toList();

    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ValidationExceptionResponse(fieldErrors));
  }

  /**
   * Handle a user existing exception.
   *
   * @param ex UserExistsException instance
   * @return a JSON message
   */
  @ExceptionHandler(UserExistsException.class)
  ResponseEntity<ExceptionResponse> userExists(UserExistsException ex) {
    ExceptionResponse exResponse = new ExceptionResponse(ex.getMessage());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exResponse);
  }

  /**
   * Handle a user not found exception.
   *
   * @param ex UserNotFoundException instance
   * @return a JSON message
   */
  @ExceptionHandler(UserNotFoundException.class)
  ResponseEntity<ExceptionResponse> userNotFound(UserNotFoundException ex) {
    ExceptionResponse exResponse = new ExceptionResponse(ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exResponse);
  }
}
