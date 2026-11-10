package ca.bc.gov.oracleapi.security;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class JwtSecurityUtilTest {

  private static Jwt jwtWithClaim(String name, Object value) {
    return Jwt.withTokenValue("myTokenValue")
        .header("alg", "HS256")
        .subject("baggings@azureidir")
        .claim("azp", "spar-client")
        .claim(name, value)
        .build();
  }

  @Test
  @DisplayName("Unscoped roles come through as-is")
  void getUserRolesFromJwt_unscopedRoles_shouldSucceed() {
    Jwt jwt = jwtWithClaim("client_roles", List.of("SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"));

    Assertions.assertEquals(
        Set.of("SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"),
        JwtSecurityUtil.getUserRolesFromJwt(jwt));
  }

  @Test
  @DisplayName("Scoped roles resolve to their base role, parsed from the right")
  void getUserRolesFromJwt_scopedRoles_shouldStripScope() {
    Jwt jwt =
        jwtWithClaim(
            "client_roles",
            List.of(
                "SPAR_NONMINISTRY_ORCHARD_FOREST_CLIENT-00030064",
                "SPAR_TSC_ADMIN_DISTRICT-DCC_REGION-KOOTENAY_BOUNDARY",
                "SOME-ROLE"));

    Assertions.assertEquals(
        Set.of("SPAR_NONMINISTRY_ORCHARD", "SPAR_TSC_ADMIN", "SOME-ROLE"),
        JwtSecurityUtil.getUserRolesFromJwt(jwt));
  }

  @Test
  @DisplayName("FAM sidecar roles are ignored")
  void getUserRolesFromJwt_famSidecar_shouldBeIgnored() {
    Jwt jwt =
        jwtWithClaim(
            "client_roles",
            List.of("SPAR_TSC_SUBMITTER", "FAM:EXPIRES:2026-12-31:SPAR_TSC_SUBMITTER"));

    Assertions.assertEquals(
        Set.of("SPAR_TSC_SUBMITTER"), JwtSecurityUtil.getUserRolesFromJwt(jwt));
  }

  @Test
  @DisplayName("Roles are read from resource_access for our own client only")
  void getUserRolesFromJwt_resourceAccess_shouldSucceed() {
    Jwt jwt =
        jwtWithClaim(
            "resource_access",
            Map.of(
                "spar-client", Map.of("roles", List.of("SPAR_TSC_ADMIN")),
                "other-client", Map.of("roles", List.of("SPAR_TSC_SUPERVISOR"))));

    Assertions.assertEquals(Set.of("SPAR_TSC_ADMIN"), JwtSecurityUtil.getUserRolesFromJwt(jwt));
  }

  @Test
  @DisplayName("No roles claim should give no roles")
  void getUserRolesFromJwt_noRoles_shouldSucceed() {
    Jwt jwt = jwtWithClaim("email", "bilbo.baggings@gov.bc.ca");

    Assertions.assertTrue(JwtSecurityUtil.getUserRolesFromJwt(jwt).isEmpty());
  }
}
