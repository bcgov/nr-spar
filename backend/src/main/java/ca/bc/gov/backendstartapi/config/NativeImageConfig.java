package ca.bc.gov.backendstartapi.config;

import ca.bc.gov.backendstartapi.dto.DescribedEnumDto;
import ca.bc.gov.backendstartapi.dto.FavouriteActivityCreateDto;
import ca.bc.gov.backendstartapi.dto.FavouriteActivityUpdateDto;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.vo.parser.ConeAndPollenCount;
import ca.bc.gov.backendstartapi.vo.parser.SmpMixVolume;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
import org.springframework.boot.autoconfigure.flyway.FlywayConfigurationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** This class holds configurations for building Cloud Native images. */
@Configuration
@RegisterReflectionForBinding({
  DescribedEnumDto.class,
  FavouriteActivityCreateDto.class,
  FavouriteActivityUpdateDto.class,
  ForestClientDto.class,
  ConeAndPollenCount.class,
  SmpMixVolume.class,
})
public class NativeImageConfig {

  @Bean
  FlywayConfigurationCustomizer flywayLoggersCustomizer() {
    return (configuration) -> configuration.loggers("slf4j");
  }
}
