package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * This exception is thrown when an error occurs in a method under Oracle Provider, usually when a
 * null value is returned.
 */
public class OracleApiProviderException extends ResponseStatusException {

  /**
   * This exception is thrown when an error occurs in a method under Oracle Provider, usually when a
   * null value is returned.
   */
  public OracleApiProviderException() {
    super(HttpStatus.FAILED_DEPENDENCY, "Error occurred when calling Oracle api.");
  }
}
