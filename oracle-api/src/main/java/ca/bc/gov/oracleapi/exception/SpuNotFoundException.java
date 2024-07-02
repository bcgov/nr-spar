package ca.bc.gov.oracleapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents an exception when finding the seed plan unit. */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class SpuNotFoundException extends ResponseStatusException {

  /** Creates a SpuNotFOund instance. */
  public SpuNotFoundException() {
    super(HttpStatus.NOT_FOUND, "Cannot find the spu with the given id.");
  }
}
