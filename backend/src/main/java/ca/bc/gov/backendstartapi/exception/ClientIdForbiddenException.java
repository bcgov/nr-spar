package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents a requested client id that's forbidden for the user. */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ClientIdForbiddenException extends ResponseStatusException {

  public ClientIdForbiddenException() {
    super(HttpStatus.FORBIDDEN, "No access due to client ID");
  }
}
