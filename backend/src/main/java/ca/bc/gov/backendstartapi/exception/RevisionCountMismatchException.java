package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents a revision count mismatch exception. */
@ResponseStatus(value = HttpStatus.CONFLICT)
public class RevisionCountMismatchException extends ResponseStatusException {

  /** This class represents a revision count mismatch exception. */
  public RevisionCountMismatchException() {
    super(HttpStatus.CONFLICT, String.format("Request rejected due to revision count mismatch"));
  }
}
