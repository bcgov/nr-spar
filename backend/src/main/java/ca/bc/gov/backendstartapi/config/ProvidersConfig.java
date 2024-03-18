package ca.bc.gov.backendstartapi.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/** This class contains configurations for all external APIs like address and keys. */
@Getter
@Configuration
public class ProvidersConfig {

  // Oracle configurations
  @Value("${oracle-api.base-url}")
  private String oracleApiBaseUri;

  // ForestClient configurations
  @Value("${forest-client-api.address}")
  private String forestClientBaseUri;

  @Value("${forest-client-api.key}")
  private String forestClientApiKey;
}
