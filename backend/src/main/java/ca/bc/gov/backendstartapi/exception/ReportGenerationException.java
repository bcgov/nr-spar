package ca.bc.gov.backendstartapi.exception;

/** Thrown when a report cannot be rendered. */
public class ReportGenerationException extends RuntimeException {

  public ReportGenerationException(String message, Throwable cause) {
    super(message, cause);
  }
}
