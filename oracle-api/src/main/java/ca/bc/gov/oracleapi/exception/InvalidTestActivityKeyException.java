package ca.bc.gov.oracleapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents an invalid MCC. */
@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class InvalidTestActivityKeyException extends ResponseStatusException {

  public InvalidTestActivityKeyException() {
    super(HttpStatus.NOT_FOUND, "Invalid or not found ria key for test data!");
  }
}
