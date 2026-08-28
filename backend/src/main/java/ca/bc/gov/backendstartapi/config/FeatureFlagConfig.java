package ca.bc.gov.backendstartapi.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Holds toggles for functionality that can be switched off per environment. Values come from the
 * {@code nr-spar-<zone>-features} ConfigMap in OpenShift and are read once at startup, so a change
 * only takes effect after a rollout restart.
 *
 * <p>Unset means off. Only an explicit {@code true} enables a flag.
 */
@Getter
@Configuration
public class FeatureFlagConfig {

  public static final String SEEDLOT_B_DISABLED_MESSAGE =
      "B-class seedlot functionality is disabled for this environment.";

  /** When false, B-class seedlot registration, review and reporting are unavailable. */
  private final boolean seedlotBEnabled;

  public FeatureFlagConfig(
      @Value("${features.seedlot-b.enabled:false}") boolean seedlotBEnabled) {
    this.seedlotBEnabled = seedlotBEnabled;
  }
}
