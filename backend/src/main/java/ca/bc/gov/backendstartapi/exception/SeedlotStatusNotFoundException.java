package ca.bc.gov.backendstartapi.exception;

/** This class represents a SeedlotStatus not found in the database. */
public class SeedlotStatusNotFoundException extends NotFoundGenericException {

  public SeedlotStatusNotFoundException() {
    super("SeedlotStatus");
  }
}
