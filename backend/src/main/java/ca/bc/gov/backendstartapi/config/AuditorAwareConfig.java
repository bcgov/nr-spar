package ca.bc.gov.backendstartapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/** This class enables the auditor configuration to be used. */
@Configuration
@EnableJpaAuditing
public class AuditorAwareConfig {

  @Bean
  public AuditorAware<String> auditorProvider() {
    return new SpringSecurityAuditorAwareConfig();
  }
}
