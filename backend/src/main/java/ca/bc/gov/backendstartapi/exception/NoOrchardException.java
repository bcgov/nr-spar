package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents an error of orchard not found with a given VegCode. */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class NoOrchardException extends ResponseStatusException {

  public NoOrchardException() {
    super(HttpStatus.NOT_FOUND, "No orchard was found with the given VegCode!");
  }
}
