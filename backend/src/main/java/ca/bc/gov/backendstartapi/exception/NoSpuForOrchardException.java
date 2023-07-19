package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** This class represents no SPU information to a given Orchard. */
@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "No active SPU for the given Orchard ID!")
public class NoSpuForOrchardException extends RuntimeException {}
