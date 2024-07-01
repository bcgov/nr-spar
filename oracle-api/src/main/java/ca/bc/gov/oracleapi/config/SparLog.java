package ca.bc.gov.oracleapi.config;

import ca.bc.gov.oracleapi.filter.RequestCorrelation;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** This class represents the Logging class for SPAR. */
public class SparLog {

  private static Logger getLogger() {
    String name = Thread.currentThread().getStackTrace()[3].getClassName();
    return LoggerFactory.getLogger(name);
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
      getLogger().info(prepareMessage(message), args[0]);
    } else {
      getLogger().info(prepareMessage(message), args);
    }
  }

  /**
   * Logs a message in the warn level.
   *
   * @param message The message to be logged.
   * @param args Optional arguments to be replaced in the message.
   */
  public static void warn(String message, Object... args) {
    if (isThrowable(args)) {
      getLogger().warn(prepareMessage(message), args[0]);
    } else {
      getLogger().warn(prepareMessage(message), args);
    }
  }

  /**
   * Logs a message in the error level.
   *
   * @param message The message to be logged.
   * @param args Optional arguments to be replaced in the message.
   */
  public static void error(String message, Object... args) {
    if (isThrowable(args)) {
      getLogger().error(prepareMessage(message), args[0]);
    } else {
      getLogger().error(prepareMessage(message), args);
    }
  }

  /**
   * Logs a message in the debug level.
   *
   * @param message The message to be logged.
   * @param args Optional arguments to be replaced in the message.
   */
  public static void debug(String message, Object... args) {
    if (isThrowable(args)) {
      getLogger().debug(prepareMessage(message), args[0]);
    } else {
      getLogger().debug(prepareMessage(message), args);
    }
  }
}
