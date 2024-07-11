package ca.bc.gov.backendstartapi.config;

import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.config.MeterFilter;
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** This class holds configurations for Prometheus metrics. */
@Configuration
public class SparMetricsConfig {

  @Value("${info.app.version}")
  private String appVersion;

  @Value("${info.app.name}")
  private String appName;

  @Value("${info.app.zone}")
  private String appZone;

  @Bean
  public TimedAspect timedAspect(MeterRegistry registry) {
    return new TimedAspect(registry);
  }

  /**
   * Creates a bean for the metrics common tags.
   *
   * @return MeterRegistryCustomizer
   */
  @Bean
  public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
    return registry ->
        registry
            .config()
            .commonTags(
                "version", appVersion,
                "app", appName,
                "zone", appZone)
            .meterFilter(ignoreTag());
  }

  @Bean
  public MeterRegistryCustomizer<PrometheusMeterRegistry> prometheusConfiguration() {
    return MeterRegistry::config;
  }

  public MeterFilter ignoreTag() {
    return MeterFilter.ignoreTags("type");
  }
}
