package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents a missing information about the primary orchard for a seedlot. */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class NoPrimaryOrchardException extends ResponseStatusException {

  public NoPrimaryOrchardException() {
    super(HttpStatus.BAD_REQUEST, "No Primary Orchard");
  }
}
