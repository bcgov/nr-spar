package ca.bc.gov.backendstartapi.exception;

/** This class represents a Method of Payment not found in the database. */
public class MethodOfPaymentNotFoundException extends NotFoundGenericException {

  public MethodOfPaymentNotFoundException() {
    super("Method of Payment");
  }
}
