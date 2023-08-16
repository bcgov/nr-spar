package ca.bc.gov.backendstartapi.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** This class contains general configurations for Spring. */
@Configuration
public class SpringConfig {
  /** Add model mapper. */
  @Bean
  public ModelMapper modelMapper() {
    return new ModelMapper();
  }
}
