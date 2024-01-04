package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * This class represents a seedlot reg form progress not found and will trigger a RuntimeException.
 */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class JsonParsingException extends ResponseStatusException {

  public JsonParsingException() {
    super(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Failed to process requested JSON value.");
  }
}
