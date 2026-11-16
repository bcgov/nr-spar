package ca.bc.gov.backendstartapi.security;

import ca.bc.gov.backendstartapi.config.Constants;
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
    Jwt jwt = jwtWithClaim("client_roles", List.of("SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD"));

    Set<String> rolesSet = JwtSecurityUtil.getUserRolesFromJwt(jwt);

    Assertions.assertEquals(Set.of("SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD"), rolesSet);
  }

  @Test
  @DisplayName("Forest client scoped roles resolve to their base role and client")
  void getUserRolesFromJwt_forestClientScoped_shouldStripScope() {
    Jwt jwt =
        jwtWithClaim(
            "client_roles",
            List.of(
                "SPAR_NONMINISTRY_ORCHARD_FOREST_CLIENT-00030064",
                "SPAR_NONMINISTRY_ORCHARD_FOREST_CLIENT-00012345"));

    Assertions.assertEquals(
        Set.of("SPAR_NONMINISTRY_ORCHARD"), JwtSecurityUtil.getUserRolesFromJwt(jwt));
    Assertions.assertEquals(
        List.of("00030064", "00012345"), JwtSecurityUtil.getClientIdsFromJwt(jwt));
  }

  @Test
  @DisplayName("Multi-scope and region values with underscores parse from the right")
  void getUserRolesFromJwt_multiScope_shouldStripEveryScope() {
    Jwt jwt =
        jwtWithClaim(
            "client_roles",
            List.of(
                "SPAR_NONMINISTRY_ORCHARD_DISTRICT-DCC_FOREST_CLIENT-00030064",
                "SPAR_TSC_SUBMITTER_REGION-KOOTENAY_BOUNDARY"));

    Assertions.assertEquals(
        Set.of("SPAR_NONMINISTRY_ORCHARD", "SPAR_TSC_SUBMITTER"),
        JwtSecurityUtil.getUserRolesFromJwt(jwt));
    Assertions.assertEquals(List.of("00030064"), JwtSecurityUtil.getClientIdsFromJwt(jwt));
  }

  @Test
  @DisplayName("A hyphen that is not a scope separator is part of the role name")
  void getUserRolesFromJwt_hyphenNotScope_shouldKeepName() {
    Jwt jwt = jwtWithClaim("client_roles", List.of("SOME-ROLE"));

    Assertions.assertEquals(Set.of("SOME-ROLE"), JwtSecurityUtil.getUserRolesFromJwt(jwt));
    Assertions.assertTrue(JwtSecurityUtil.getClientIdsFromJwt(jwt).isEmpty());
  }

  @Test
  @DisplayName("FAM sidecar roles are ignored")
  void getUserRolesFromJwt_famSidecar_shouldBeIgnored() {
    Jwt jwt =
        jwtWithClaim(
            "client_roles",
            List.of(
                "SPAR_NONMINISTRY_ORCHARD_FOREST_CLIENT-00030064",
                "FAM:EXPIRES:2026-12-31:SPAR_NONMINISTRY_ORCHARD_FOREST_CLIENT-00030064"));

    Assertions.assertEquals(
        Set.of("SPAR_NONMINISTRY_ORCHARD"), JwtSecurityUtil.getUserRolesFromJwt(jwt));
    Assertions.assertEquals(List.of("00030064"), JwtSecurityUtil.getClientIdsFromJwt(jwt));
  }

  @Test
  @DisplayName("Roles are read from resource_access when client_roles is absent")
  void getUserRolesFromJwt_resourceAccess_shouldSucceed() {
    Jwt jwt =
        jwtWithClaim(
            "resource_access", Map.of("spar-client", Map.of("roles", List.of("SPAR_TSC_ADMIN"))));

    Assertions.assertEquals(Set.of("SPAR_TSC_ADMIN"), JwtSecurityUtil.getUserRolesFromJwt(jwt));
  }

  @Test
  @DisplayName("Roles of another client in resource_access are ignored")
  void getUserRolesFromJwt_otherClientResourceAccess_shouldBeIgnored() {
    Jwt jwt =
        jwtWithClaim(
            "resource_access", Map.of("other-client", Map.of("roles", List.of("SPAR_TSC_ADMIN"))));

    Assertions.assertTrue(JwtSecurityUtil.getUserRolesFromJwt(jwt).isEmpty());
  }

  @Test
  @DisplayName("No roles claim should give no roles")
  void getUserRolesFromJwt_noRoles_shouldSucceed() {
    Jwt jwt = jwtWithClaim("email", "bilbo.baggings@gov.bc.ca");

    Assertions.assertTrue(JwtSecurityUtil.getUserRolesFromJwt(jwt).isEmpty());
    Assertions.assertTrue(JwtSecurityUtil.getClientIdsFromJwt(jwt).isEmpty());
  }

  @Test
  @DisplayName("Ministry roles add the Ministry of Forests client id")
  void getClientIdsFromJwt_ministryRole_shouldAddMofClient() {
    Jwt jwt = jwtWithClaim("client_roles", List.of("SPAR_TSC_ADMIN"));

    Assertions.assertEquals(
        List.of(Constants.MINISTRY_OF_FORESTS_ID), JwtSecurityUtil.getClientIdsFromJwt(jwt));
  }
}
