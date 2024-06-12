package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents an exception when finding the seed plan zone. */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class SpzNotFoundException extends ResponseStatusException {

  /** Creates a SpzNotFOund instance. */
  public SpzNotFoundException() {
    super(HttpStatus.NOT_FOUND, "Cannot find the spz with the given id.");
  }
}
