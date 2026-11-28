package ca.bc.gov.oracleapi.endpoint.consep;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Parses the required activity-version query parameter, including a legacy null version. */
final class ActivityVersionParameter {

  private ActivityVersionParameter() {}

  static LocalDateTime parse(String value) {
    if (value.isEmpty()) {
      return null;
    }
    try {
      return LocalDateTime.parse(value);
    } catch (DateTimeParseException ex) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Activity timestamp must be an ISO local date-time", ex);
    }
  }
}
