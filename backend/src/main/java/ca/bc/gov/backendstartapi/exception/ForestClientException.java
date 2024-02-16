package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatusCode;
import org.springframework.web.server.ResponseStatusException;

/** This class holds any possibl exception that may occur when fething from Forest Client. */
public class ForestClientException extends ResponseStatusException {

  public ForestClientException(int statusCode) {
    super(HttpStatusCode.valueOf(statusCode), "Exception while fetching from Forest Client API!");
  }
}
