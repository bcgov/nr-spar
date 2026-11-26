package ca.bc.gov.backendstartapi.config;

import java.time.Instant;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class SecurityConfigTest {

  private static final String ISSUER = "https://dev.loginproxy.gov.bc.ca/auth/realms/standard";

  private SecurityConfig securityConfig;

  @BeforeEach
  void setup() {
    securityConfig = new SecurityConfig();
    securityConfig.issuerUri = ISSUER;
    securityConfig.clientId = "spar-client";
  }

  private static Jwt jwt(String issuer, String azp) {
    Jwt.Builder builder =
        Jwt.withTokenValue("token")
            .header("alg", "RS256")
            .issuer(issuer)
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(300));
    if (azp != null) {
      builder.claim("azp", azp);
    }
    return builder.build();
  }

  @Test
  @DisplayName("A token issued to SPAR by our realm is accepted")
  void jwtValidator_ourClient_shouldPass() {
    Assertions.assertFalse(
        securityConfig.jwtValidator().validate(jwt(ISSUER, "spar-client")).hasErrors());
  }

  @Test
  @DisplayName("A token issued to another app in the shared realm is rejected")
  void jwtValidator_otherClient_shouldFail() {
    Assertions.assertTrue(
        securityConfig.jwtValidator().validate(jwt(ISSUER, "another-app-1234")).hasErrors());
    Assertions.assertTrue(securityConfig.jwtValidator().validate(jwt(ISSUER, null)).hasErrors());
  }

  @Test
  @DisplayName("A token from another realm is rejected")
  void jwtValidator_otherIssuer_shouldFail() {
    Assertions.assertTrue(
        securityConfig
            .jwtValidator()
            .validate(jwt("https://test.loginproxy.gov.bc.ca/auth/realms/standard", "spar-client"))
            .hasErrors());
  }
}
