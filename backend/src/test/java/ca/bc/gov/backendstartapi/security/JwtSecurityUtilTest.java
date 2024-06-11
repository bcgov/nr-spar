package ca.bc.gov.backendstartapi.security;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

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
  @DisplayName("Get user roles from JWT with big role names should succeed")
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
    builder.claim("cognito:groups", new String[]{});

    Set<String> rolesSet = JwtSecurityUtil.getUserRolesFromJwt(builder.build());

    Assertions.assertTrue(rolesSet.isEmpty());
  }

  @Test
  @DisplayName("Get user client ids from JWT happy path should succeed")
  void getClientIdsFromJwt_happyPath_shouldSucceed() {
    Jwt.Builder builder = Jwt.withTokenValue("myTokenValue");
    builder.subject("BAGGINGS");
    builder.header("alg", "HS256");
    builder.header("typ", "JWT");
    builder.claim("cognito:groups", List.of("ROLE1_ADMIN_00112233", "ROLE2_USER_00112234"));

    List<String> clientIds = JwtSecurityUtil.getClientIdsFromJwt(builder.build());

    Assertions.assertFalse(clientIds.isEmpty());
    Assertions.assertEquals(2, clientIds.size());
    Assertions.assertTrue(clientIds.contains("00112233"));
    Assertions.assertTrue(clientIds.contains("00112234"));
  }
}
