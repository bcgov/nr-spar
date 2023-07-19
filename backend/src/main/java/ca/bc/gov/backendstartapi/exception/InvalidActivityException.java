package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** This class represents an invalid activity, that means an empty or null value. */
@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Invalid activity or page name!")
public class InvalidActivityException extends RuntimeException {}
