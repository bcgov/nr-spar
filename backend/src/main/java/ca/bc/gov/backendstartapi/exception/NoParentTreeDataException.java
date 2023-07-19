package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** This class represents no Parent Tree data information to a given Orchard. */
@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "No Parent Tree data for the given Orchard!")
public class NoParentTreeDataException extends RuntimeException {}
