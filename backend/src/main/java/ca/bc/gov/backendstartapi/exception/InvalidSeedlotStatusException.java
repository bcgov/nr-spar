package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** This exception should be thrown when the seedlot status is not allowed for an endpoint. */
public class InvalidSeedlotStatusException extends ResponseStatusException {
  /**
   * This exception should be thrown when the seedlot status is not allowed for an endpoint.
   *
   * @param invalidStatus the status
   */
  public InvalidSeedlotStatusException(String invalidStatus) {
    super(
        HttpStatus.BAD_REQUEST,
        String.format("The status %s is invalid for this request.", invalidStatus));
  }
}
