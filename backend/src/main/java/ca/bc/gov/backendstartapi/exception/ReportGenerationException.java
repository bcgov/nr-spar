package ca.bc.gov.backendstartapi.exception;

/** Thrown when a Jasper report cannot be compiled or exported. */
public class ReportGenerationException extends RuntimeException {

  public ReportGenerationException(String message, Throwable cause) {
    super(message, cause);
  }
}
