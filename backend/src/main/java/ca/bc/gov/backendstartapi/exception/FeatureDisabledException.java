package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** Thrown when a request uses functionality that is turned off for this environment. */
@ResponseStatus(value = HttpStatus.FORBIDDEN)
public class FeatureDisabledException extends ResponseStatusException {

  public FeatureDisabledException(String reason) {
    super(HttpStatus.FORBIDDEN, reason);
  }
}
