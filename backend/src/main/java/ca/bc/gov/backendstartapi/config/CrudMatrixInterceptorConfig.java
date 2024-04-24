package ca.bc.gov.backendstartapi.config;

import ca.bc.gov.backendstartapi.interceptor.CrudMatrixInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CrudMatrixInterceptorConfig implements WebMvcConfigurer {

  @Override
  public void addInterceptors(@NonNull InterceptorRegistry registry) {
    registry.addInterceptor(new CrudMatrixInterceptor());
  }
}
