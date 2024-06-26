package ca.bc.gov.oracleapi.exception;

/** This class represents a user not found and will trigger a RuntimeException. */
public class UserNotFoundException extends RuntimeException {

  public UserNotFoundException() {
    super("User not registered!");
  }
}
