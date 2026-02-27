package ca.bc.gov.backendstartapi.config;

import ca.bc.gov.backendstartapi.security.JwtSecurityUtil;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

/** This class contains all configurations related to security and authentication. */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
  String jwkSetUri;

  /**
   * Filters a request to add security checks and configurations.
   *
   * @param http instance of HttpSecurity containing the request.
   * @return SecurityFilterChain with allowed endpoints and all configuration.
   * @throws Exception due to bad configuration possibilities.
   */
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults())
        .csrf(
            customize ->
                customize.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
        .authorizeHttpRequests(
            customize ->
                customize
                    .requestMatchers("/api/**")
                    .authenticated()
                    // Explicitly permit OpenAPI and Swagger UI endpoints
                    .requestMatchers(
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html"
                    )
                    .permitAll()
                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .anyRequest()
                    .permitAll())
        .httpBasic(AbstractHttpConfigurer::disable)
        .formLogin(AbstractHttpConfigurer::disable)
        .oauth2ResourceServer(
            customize ->
                customize.jwt(
                    jwt -> jwt.jwtAuthenticationConverter(converter()).jwkSetUri(jwkSetUri)));

    return http.build();
  }

  private Converter<Jwt, AbstractAuthenticationToken> converter() {
    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(roleConverter);
    return converter;
  }

  private final Converter<Jwt, Collection<GrantedAuthority>> roleConverter =
      jwt -> {
        if (!jwt.getClaims().containsKey("cognito:groups")) {
          return List.of();
        }
        Set<String> roleSet = JwtSecurityUtil.getUserRolesFromJwt(jwt);
        return roleSet.stream()
            .map(roleName -> "ROLE_" + roleName)
            .map(roleName -> (GrantedAuthority) new SimpleGrantedAuthority(roleName))
            .toList();
      };
}
