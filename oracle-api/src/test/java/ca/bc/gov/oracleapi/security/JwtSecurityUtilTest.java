package ca.bc.gov.oracleapi.security;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

class JwtSecurityUtilTest {

  @Test
  @DisplayName("Get user roles from JWT happy path should succeed")
  void getUserRolesFromJwt_happyPath_shouldSucceed() {
    Jwt.Builder builder = Jwt.withTokenValue("myTokenValue");
    builder.subject("BAGGINGS");
    builder.header("alg", "HS256");
    builder.header("typ", "JWT");
    builder.claim("email", "bilbo.baggings@gov.bc.ca");
    builder.claim("custom:idp_display_name", "Baggings, Bilbo LWRS:EX");
    builder.claim("custom:idp_username", "BAGGINGS");
    builder.claim("custom:idp_name", "idir");
    builder.claim("cognito:groups", List.of("ROLE1", "ROLE2"));

    Set<String> rolesSet = JwtSecurityUtil.getUserRolesFromJwt(builder.build());

    Assertions.assertFalse(rolesSet.isEmpty());
    Assertions.assertEquals(2, rolesSet.size());
    Assertions.assertTrue(rolesSet.contains("ROLE1"));
    Assertions.assertTrue(rolesSet.contains("ROLE2"));
  }

  @Test
  @DisplayName("Get user roles from JWT no roles should succeed")
  void getUserRolesFromJwt_noRoles_shouldSucceed() {
    Jwt.Builder builder = Jwt.withTokenValue("myTokenValue");
    builder.subject("BAGGINGS");
    builder.header("alg", "HS256");
    builder.header("typ", "JWT");
    builder.claim("email", "bilbo.baggings@gov.bc.ca");
    builder.claim("custom:idp_display_name", "Baggings, Bilbo LWRS:EX");
    builder.claim("custom:idp_username", "BAGGINGS");
    builder.claim("custom:idp_name", "idir");

    Set<String> rolesSet = JwtSecurityUtil.getUserRolesFromJwt(builder.build());

    Assertions.assertTrue(rolesSet.isEmpty());
  }

  @Test
  @DisplayName("Get user roles from JWT no roles should succeed")
  void getUserRolesFromJwt_bigRoles_shouldSucceed() {
    Jwt.Builder builder = Jwt.withTokenValue("myTokenValue");
    builder.subject("BAGGINGS");
    builder.header("alg", "HS256");
    builder.header("typ", "JWT");
    builder.claim("email", "bilbo.baggings@gov.bc.ca");
    builder.claim("custom:idp_display_name", "Baggings, Bilbo LWRS:EX");
    builder.claim("custom:idp_username", "BAGGINGS");
    builder.claim("custom:idp_name", "idir");
    builder.claim("cognito:groups", List.of("ROLE1_ADMIN_00112233", "ROLE2_USER_00112234"));

    Set<String> rolesSet = JwtSecurityUtil.getUserRolesFromJwt(builder.build());

    Assertions.assertFalse(rolesSet.isEmpty());
    Assertions.assertEquals(2, rolesSet.size());
    Assertions.assertTrue(rolesSet.contains("ROLE1_ADMIN"));
    Assertions.assertTrue(rolesSet.contains("ROLE2_USER"));
  }

  @Test
  @DisplayName("Get user roles from JWT empty roles should succeed")
  void getUserRolesFromJwt_emptyRoles_shouldSucceed() {
    Jwt.Builder builder = Jwt.withTokenValue("myTokenValue");
    builder.subject("BAGGINGS");
    builder.header("alg", "HS256");
    builder.header("typ", "JWT");
    builder.claim("email", "bilbo.baggings@gov.bc.ca");
    builder.claim("custom:idp_display_name", "Baggings, Bilbo LWRS:EX");
    builder.claim("custom:idp_username", "BAGGINGS");
    builder.claim("custom:idp_name", "idir");
    builder.claim("cognito:groups", new String[] {});

    Set<String> rolesSet = JwtSecurityUtil.getUserRolesFromJwt(builder.build());

    Assertions.assertTrue(rolesSet.isEmpty());
  }

  @Test
  @DisplayName("Get userId from JWT returns the custom:idp_username claim")
  void getUserIdFromJwt_happyPath_shouldReturnIdirUsername() {
    Jwt.Builder builder = Jwt.withTokenValue("myTokenValue");
    builder.header("alg", "HS256");
    builder.header("typ", "JWT");
    builder.subject("BAGGINGS");
    builder.claim("custom:idp_username", "BAGGINGS");

    String userId = JwtSecurityUtil.getUserIdFromJwt(builder.build());

    Assertions.assertEquals("BAGGINGS", userId);
  }

  @Test
  @DisplayName("Get userId from JWT throws 401 when the claim is missing")
  void getUserIdFromJwt_missingClaim_shouldThrow401() {
    Jwt.Builder builder = Jwt.withTokenValue("myTokenValue");
    builder.header("alg", "HS256");
    builder.header("typ", "JWT");
    builder.subject("BAGGINGS");
    // no custom:idp_username claim

    ResponseStatusException ex = Assertions.assertThrows(
        ResponseStatusException.class,
        () -> JwtSecurityUtil.getUserIdFromJwt(builder.build()));

    Assertions.assertEquals(401, ex.getStatusCode().value());
  }

  @Test
  @DisplayName("Get userId from JWT throws 401 when the claim is blank")
  void getUserIdFromJwt_blankClaim_shouldThrow401() {
    Jwt.Builder builder = Jwt.withTokenValue("myTokenValue");
    builder.header("alg", "HS256");
    builder.header("typ", "JWT");
    builder.subject("BAGGINGS");
    builder.claim("custom:idp_username", "   ");

    ResponseStatusException ex = Assertions.assertThrows(
        ResponseStatusException.class,
        () -> JwtSecurityUtil.getUserIdFromJwt(builder.build()));

    Assertions.assertEquals(401, ex.getStatusCode().value());
  }
}
