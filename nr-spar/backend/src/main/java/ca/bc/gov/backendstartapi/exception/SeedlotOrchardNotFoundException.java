package ca.bc.gov.backendstartapi.exception;

/** This class represents the error thrown when no seedlot orchard was found. */
public class SeedlotOrchardNotFoundException extends NotFoundGenericException {

  public SeedlotOrchardNotFoundException() {
    super("SeedlotOrchard");
  }
}
