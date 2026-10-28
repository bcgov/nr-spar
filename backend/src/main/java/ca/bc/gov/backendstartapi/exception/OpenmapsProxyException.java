package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Thrown when an OpenMaps proxy request is rejected or the upstream call fails. */
public class OpenmapsProxyException extends ResponseStatusException {

  public OpenmapsProxyException(HttpStatus status, String reason) {
    super(status, reason);
  }
}
