package ca.bc.gov.backendstartapi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityScheme.Type;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * General information to be displayed in the documentation of our API, following the <a
 * href="https://spec.openapis.org/oas/latest.html">OpenAPI specification</a>.
 *
 * <p>The generated documentation is to be rendered by <a href="https://swagger.io/">Swagger</a>.
 */
@Configuration
public class SwaggerConfig {

  private static final String BEARER_SECURITY_SCHEME_NAME = "bearerAuth";

  /** General information about our API. */
  @Bean
  public OpenAPI theRestApi() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Oracle THE database REST API")
                .description("A REST API to fetch information from the THE database.")
                .version("v0.0.1")
                .termsOfService(
                    "https://www2.gov.bc.ca/gov/content/data/open-data/api-terms-of-use-for-ogl-information")
                .license(
                    new License()
                        .name("OGL-BC")
                        .url(
                            "https://www2.gov.bc.ca/gov/content/data/open-data/open-government-licence-bc")))
        .externalDocs(
            new ExternalDocumentation()
                .description("Our GitHub Repo")
                .url("https://github.com/bcgov/nr-spar"))
        .components(
            new Components()
                .addSecuritySchemes(
                    BEARER_SECURITY_SCHEME_NAME,
                    new SecurityScheme()
                        .name(BEARER_SECURITY_SCHEME_NAME)
                        .type(Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")))
        .addSecurityItem(new SecurityRequirement().addList(BEARER_SECURITY_SCHEME_NAME));
  }
}
