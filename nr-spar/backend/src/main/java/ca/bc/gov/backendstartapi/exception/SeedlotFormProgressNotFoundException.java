package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * This class represents a seedlot reg form progress not found and will trigger a RuntimeException.
 */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class SeedlotFormProgressNotFoundException extends ResponseStatusException {

  /** Constructor. */
  public SeedlotFormProgressNotFoundException() {
    super(
        HttpStatus.NOT_FOUND,
        "Cannot find the saved seedlot reg form progress with the provided number.");
  }
}
