package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents an error when creating or updating a seedlot. */
@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class InvalidSeedlotRequestException extends ResponseStatusException {

  public InvalidSeedlotRequestException() {
    super(HttpStatus.BAD_REQUEST, "Invalid Seedlot request");
  }
}
