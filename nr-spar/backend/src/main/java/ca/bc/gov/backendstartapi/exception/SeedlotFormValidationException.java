package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents an invalid seedlot form payload. */
@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class SeedlotFormValidationException extends ResponseStatusException {

  public SeedlotFormValidationException(String reason) {
    super(HttpStatus.BAD_REQUEST, reason);
  }
}
