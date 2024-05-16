package ca.bc.gov.backendstartapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

/** This class represents a generic not found entity and will trigger a RuntimeException. */
@ResponseStatus(value = HttpStatus.CONFLICT)
public class SeedlotConflictDataException extends ResponseStatusException {

  /**
   * This class represents a generic not found entity and will trigger a RuntimeException.
   *
   * @param seedlotNumber that has conflicted data
   */
  public SeedlotConflictDataException(String seedlotNumber) {
    super(
        HttpStatus.CONFLICT,
        String.format("Failed to update seedlot %s due to conflicted data", seedlotNumber));
  }
}
