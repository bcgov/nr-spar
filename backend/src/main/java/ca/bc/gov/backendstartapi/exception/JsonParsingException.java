package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents a failed json parsing exception and will trigger a RuntimeException. */
@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class JsonParsingException extends ResponseStatusException {

  /** Constructor. */
  public JsonParsingException() {
    super(HttpStatus.BAD_REQUEST, "Failed to process requested JSON value.");
  }
}
