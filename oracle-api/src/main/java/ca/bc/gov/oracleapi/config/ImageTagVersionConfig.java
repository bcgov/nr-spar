package ca.bc.gov.oracleapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/** This class contains a single component config with image tag version. */
@Component
public class ImageTagVersionConfig implements HealthIndicator {
  
  @Value("${nr-spar-oracle-api.version}")
  private String nrSparOracleApiVersion;

  @Override
  public Health health() {
    return Health.up().withDetail("imageTag", nrSparOracleApiVersion).build();
  }
}
