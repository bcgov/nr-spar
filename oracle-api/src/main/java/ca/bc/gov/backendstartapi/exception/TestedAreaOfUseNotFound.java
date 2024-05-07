package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents an exception when finding the tested parent tree area of use. */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class TestedAreaOfUseNotFound extends ResponseStatusException {

  /** Creates a TestedAreaOfUseNotFound instance. */
  public TestedAreaOfUseNotFound() {
    super(HttpStatus.NOT_FOUND, "Cannot find the Tested Area of Use with the given spu id.");
  }
}
