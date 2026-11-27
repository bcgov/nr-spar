package ca.bc.gov.oracleapi.search;

/** Thrown when a search request references unknown fields, bad operators or bad values. */
public class InvalidSearchException extends RuntimeException {

  public InvalidSearchException(String message) {
    super(message);
  }
}
