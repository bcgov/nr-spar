package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents a situation where an activity is already registered to a user. */
@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
public class BadConfigurationException extends ResponseStatusException {

  public BadConfigurationException() {
    super(HttpStatus.INTERNAL_SERVER_ERROR, "Bad configuration, please review!");
  }
}
