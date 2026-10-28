package ca.bc.gov.backendstartapi.config;

import ca.bc.gov.backendstartapi.interceptor.RoleAccessInterceptor;
import ca.bc.gov.backendstartapi.interceptor.SeedlotBclassFeatureInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** This class simply add the Crud Matrix interceptor in the request chain. */
@Configuration
@RequiredArgsConstructor
public class RoleAccessInterceptorConfig implements WebMvcConfigurer {

  private final SeedlotBclassFeatureInterceptor seedlotBclassFeatureInterceptor;

  @Override
  public void addInterceptors(@NonNull InterceptorRegistry registry) {
    registry.addInterceptor(new RoleAccessInterceptor());
    registry.addInterceptor(seedlotBclassFeatureInterceptor);
  }
}
