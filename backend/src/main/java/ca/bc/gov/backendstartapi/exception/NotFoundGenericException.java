package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents a generic not found entity and will trigger a RuntimeException. */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class NotFoundGenericException extends ResponseStatusException {
  
  public NotFoundGenericException(String entityName) {
    super(HttpStatus.NOT_FOUND, String.format("%s was not found!", entityName));
  }
}
