package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents an exception when finding the testes pt area of use. */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class TestedPtAreaOfUseException extends ResponseStatusException {

  /** Creates a TestedPtAreaOfUseException instance. */
  public TestedPtAreaOfUseException() {
    super(
        HttpStatus.BAD_REQUEST,
        "Broken relationship between TESTED_PT_AREA_OF_USE_SPU and TESTED_PT_AREA_OF_USE");
  }
}
