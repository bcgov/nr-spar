package ca.bc.gov.backendstartapi.config;

import static org.springframework.aot.hint.ExecutableMode.INVOKE;

import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

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
  }

  private static class RuntimeHintsException extends RuntimeException {
    RuntimeHintsException(Throwable cause) {
      super(cause);
    }
  }
}
