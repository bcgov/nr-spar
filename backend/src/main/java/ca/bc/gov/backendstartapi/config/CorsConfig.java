package ca.bc.gov.backendstartapi.config;

import java.util.Arrays;
import java.util.stream.IntStream;

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

      String[] origins = new String[allowedOrigins.length];
      IntStream.range(0, allowedOrigins.length).forEach(idx -> {
        origins[idx] = allowedOrigins[idx];
      });

      registry
          .addMapping("/**")
          .allowedOriginPatterns(origins)
          .allowedMethods("GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS", "HEAD");
    }
    WebMvcConfigurer.super.addCorsMappings(registry);
  }
}
