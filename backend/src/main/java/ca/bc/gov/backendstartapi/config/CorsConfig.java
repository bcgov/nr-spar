package ca.bc.gov.backendstartapi.config;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** This class holds the configuration for CORS handling. */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

  @Value("${server.allowed.cors.origins}")
  private String[] allowedOrigins;

  /**
   * Adds CORS mappings and allowed origins.
   *
   * @param registry Spring Cors Registry
   */
  @Override
  public void addCorsMappings(@NonNull CorsRegistry registry) {
    if (allowedOrigins != null && allowedOrigins.length != 0) {
      SparLog.info("allowedOrigins: {}", Arrays.asList(allowedOrigins));

      registry
          .addMapping("/**")
          .allowedOriginPatterns(allowedOrigins)
          .allowedMethods("GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS", "HEAD");
    }
    WebMvcConfigurer.super.addCorsMappings(registry);
  }
}
