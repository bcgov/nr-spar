package ca.bc.gov.oracleapi.extensions;

import java.time.Duration;
import java.util.UUID;
import org.testcontainers.containers.OracleContainer;

/**
 * CustomOracleContainer is a specialized container for Oracle databases
 * using Testcontainers. It extends the OracleContainer class and provides
 * custom configurations for the container.
 * This is because oracle takes a long time to start up and we set it to
 * 10 minutes. The image is huge, around a few gigs depending on the tag.
 */
public class CustomOracleContainer extends OracleContainer {

  /**
   * Constructs a CustomOracleContainer with predefined settings.
   * The container uses the "gvenzl/oracle-xe:21.3.0-slim-faststart" image,
   * sets the database name to "legacyfsa", and generates a random password.
   */
  public CustomOracleContainer() {
    super("gvenzl/oracle-xe:21.3.0-slim-faststart");

    this.withDatabaseName("legacyfsa")
        .withUsername("THE")
        .withPassword(UUID.randomUUID().toString().substring(24));
  }

  /**
   * Overrides the waitUntilContainerStarted method to set a custom
   * startup timeout of 10 minutes.
   */
  @Override
  protected void waitUntilContainerStarted() {
    getWaitStrategy()
        .withStartupTimeout(Duration.ofMinutes(10))
        .waitUntilReady(this);
  }

}
