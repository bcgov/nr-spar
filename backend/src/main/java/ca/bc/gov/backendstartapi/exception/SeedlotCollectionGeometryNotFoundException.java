package ca.bc.gov.backendstartapi.exception;

/** Thrown when a Class B seedlot has no collection geometry row. */
public class SeedlotCollectionGeometryNotFoundException extends NotFoundGenericException {

  public SeedlotCollectionGeometryNotFoundException() {
    super("Seedlot collection geometry");
  }
}
