package ca.bc.gov.oracleapi.config;

import ca.bc.gov.oracleapi.interceptor.RoleAccessInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** This class simply add the Crud Matrix interceptor in the request chain. */
@Configuration
public class RoleAccessInterceptorConfig implements WebMvcConfigurer {

  @Override
  public void addInterceptors(@NonNull InterceptorRegistry registry) {
    registry.addInterceptor(new RoleAccessInterceptor());
  }
}
