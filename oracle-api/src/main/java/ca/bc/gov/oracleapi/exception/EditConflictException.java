package ca.bc.gov.oracleapi.exception;

import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Thrown when an update is rejected because the record changed since the caller read it
 * (optimistic locking). Mapped to a 409 with a structured body so the client can offer a reload.
 */
public class EditConflictException extends ResponseStatusException {

  /** Stable machine-readable code the front end can branch on. */
  public static final String CODE = "EDIT_CONFLICT";

  /** Default message used by every optimistic-lock conflict. */
  public static final String DEFAULT_MESSAGE =
      "Record changed since last read; please reload and retry";

  private final transient LocalDateTime currentUpdateTimestamp;

  /** Conflict without a known current timestamp (e.g. lock tokens that are not timestamps). */
  public EditConflictException(String message) {
    this(message, null);
  }

  /**
   * Conflict carrying the record's current update timestamp.
   *
   * @param message the reason shown to the user
   * @param currentUpdateTimestamp the record's timestamp now, or null when unknown
   */
  public EditConflictException(String message, LocalDateTime currentUpdateTimestamp) {
    super(HttpStatus.CONFLICT, message);
    this.currentUpdateTimestamp = currentUpdateTimestamp;
  }

  public LocalDateTime getCurrentUpdateTimestamp() {
    return currentUpdateTimestamp;
  }
}
