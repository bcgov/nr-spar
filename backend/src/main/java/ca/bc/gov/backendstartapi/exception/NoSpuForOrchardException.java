package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents no SPU information to a given Orchard. */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class NoSpuForOrchardException extends ResponseStatusException {

  public NoSpuForOrchardException() {
    super(HttpStatus.NOT_FOUND, "No active SPU for the given Orchard ID!");
  }
}
