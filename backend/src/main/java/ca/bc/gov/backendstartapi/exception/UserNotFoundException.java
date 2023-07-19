package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** This class represents a user not found and will trigger a RuntimeException. */
@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "User not registered!")
public class UserNotFoundException extends RuntimeException {}
