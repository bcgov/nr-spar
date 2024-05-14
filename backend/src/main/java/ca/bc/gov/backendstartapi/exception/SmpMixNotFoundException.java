package ca.bc.gov.backendstartapi.exception;

/** This class represents a SmpMix not found in the database. */
public class SmpMixNotFoundException extends NotFoundGenericException {
  
  public SmpMixNotFoundException() {
    super("SmpMix");
  }
}
