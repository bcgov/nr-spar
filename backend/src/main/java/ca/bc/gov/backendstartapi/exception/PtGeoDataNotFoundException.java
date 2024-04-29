package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents an invalid activity, that means an empty or null value. */
@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class PtGeoDataNotFoundException extends ResponseStatusException {

  /** Self-explanatory exception. */
  public PtGeoDataNotFoundException() {
    super(
        HttpStatus.FAILED_DEPENDENCY,
        "Could not find one or more of the parent trees' geospatial data on Oracle DB.");
  }
}
