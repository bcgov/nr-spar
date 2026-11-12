package ca.bc.gov.backendstartapi.config;

import static org.springframework.aot.hint.ExecutableMode.INVOKE;

import java.util.UUID;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

/**
 * Native-image hints for Hibernate: the Hibernate Spatial logger, and arrays of entity ID types
 * that Hibernate creates reflectively (e.g. for batch and multi-ID loading).
 */
@Configuration
@ImportRuntimeHints(HibernateSpatialCloudNativeConfig.class)
public class HibernateSpatialCloudNativeConfig implements RuntimeHintsRegistrar {

  @Override
  public void registerHints(@NonNull RuntimeHints hints, @Nullable ClassLoader classLoader) {
    try {
      hints
          .reflection()
          .registerConstructor(
              org.hibernate.spatial.HSMessageLogger_$logger.class.getConstructor(
                  org.jboss.logging.Logger.class),
              INVOKE);
    } catch (NoSuchMethodException e) {
      throw new RuntimeHintsException(e);
    }

    // SeedlotCollectionGeometry has a UUID id; without this, startup fails building the
    // SessionFactory with "Class java.util.UUID[] is instantiated reflectively".
    hints.reflection().registerType(UUID[].class, MemberCategory.UNSAFE_ALLOCATED);
  }

  private static class RuntimeHintsException extends RuntimeException {
    RuntimeHintsException(Throwable cause) {
      super(cause);
    }
  }
}
