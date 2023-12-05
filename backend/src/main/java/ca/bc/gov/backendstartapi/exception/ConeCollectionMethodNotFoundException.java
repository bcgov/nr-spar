package ca.bc.gov.backendstartapi.exception;

/** This class represents a Cone Collection Method not found. */
public class ConeCollectionMethodNotFoundException extends NotFoundGenericException {

  public ConeCollectionMethodNotFoundException() {
    super("Cone Collection Method");
  }
}
