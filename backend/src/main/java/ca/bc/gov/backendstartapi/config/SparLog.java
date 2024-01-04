package ca.bc.gov.backendstartapi.config;

import ca.bc.gov.backendstartapi.filter.RequestCorrelation;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** This class represents the Logging class for SPAR. */
public class SparLog {

  private static final Logger logger = LoggerFactory.getLogger(getClassName());

  private static String getClassName() {
    return Thread.currentThread().getStackTrace()[2].getClassName();
  }

  private static String prepareMessage(String message) {
    String correlationId = RequestCorrelation.getId();
    if (Objects.isNull(correlationId)) {
      return message;
    }
    return correlationId + " " + message;
  }

  private static boolean isThrowable(Object... args) {
    return args != null && args.length > 0 && args[0] instanceof Throwable;
  }

  /**
   * Logs a message in the info level.
   *
   * @param message The message to be logged.
   * @param args Optional arguments to be replaced in the message.
   */
  public static void info(String message, Object... args) {
    if (isThrowable(args)) {
      logger.info(prepareMessage(message), args[0]);
    }
    logger.info(prepareMessage(message), args);
  }

  /**
   * Logs a message in the warn level.
   *
   * @param message The message to be logged.
   * @param args Optional arguments to be replaced in the message.
   */
  public static void warn(String message, Object... args) {
    if (isThrowable(args)) {
      logger.warn(prepareMessage(message), args[0]);
    }
    logger.warn(prepareMessage(message), args);
  }

  /**
   * Logs a message in the error level.
   *
   * @param message The message to be logged.
   * @param args Optional arguments to be replaced in the message.
   */
  public static void error(String message, Object... args) {
    if (isThrowable(args)) {
      logger.error(prepareMessage(message), args[0]);
    }
    logger.error(prepareMessage(message), args);
  }

  /**
   * Logs a message in the debug level.
   *
   * @param message The message to be logged.
   * @param args Optional arguments to be replaced in the message.
   */
  public static void debug(String message, Object... args) {
    if (isThrowable(args)) {
      logger.debug(prepareMessage(message), args[0]);
    }
    logger.debug(prepareMessage(message), args);
  }
}
