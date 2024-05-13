package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents an exception when no genetic class is found. */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class GeneticClassNotFoundException extends ResponseStatusException {

  public GeneticClassNotFoundException() {
    super(HttpStatus.NOT_FOUND, "No genetic class is found for the given id!");
  }
}
