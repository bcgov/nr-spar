package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents no Parent Tree data information to a given Orchard. */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class NoParentTreeDataException extends ResponseStatusException {

  public NoParentTreeDataException() {
    super(HttpStatus.NOT_FOUND, "No Parent Tree data for the given Orchard!");
  }
}
