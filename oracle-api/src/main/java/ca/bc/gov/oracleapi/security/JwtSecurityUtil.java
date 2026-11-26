package ca.bc.gov.oracleapi.security;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * This class contains methods for handling JWT requests.
 *
 * <p>FAM grants roles through BC Gov SSO (Keycloak). A scoped grant has its scope in the role name
 * only, e.g. {@code SPAR_NONMINISTRY_ORCHARD_FOREST_CLIENT-00012345}.
 */
public final class JwtSecurityUtil {

  /** FAM writes scope suffixes in the order district, region, forest client. */
  private static final List<String> scopeTypes = List.of("_FOREST_CLIENT", "_DISTRICT", "_REGION");

  /**
   * Gets user roles from user JWT token.
   *
   * @param jwtPrincipal The token to be read.
   * @return A Set of String with found roles.
   */
  public static Set<String> getUserRolesFromJwt(Jwt jwtPrincipal) {
    Set<String> roles = new HashSet<>();
    // CSS emits client_roles; stock Keycloak uses resource_access.<azp>.roles, so read both.
    addRoles(roles, jwtPrincipal.getClaims().get("client_roles"));
    if (jwtPrincipal.getClaims().get("resource_access") instanceof Map<?, ?> resourceAccess
        && resourceAccess.get(jwtPrincipal.getClaimAsString("azp")) instanceof Map<?, ?> client) {
      addRoles(roles, client.get("roles"));
    }
    return roles;
  }

  private static void addRoles(Set<String> roles, Object claim) {
    if (claim instanceof List<?> list) {
      for (Object item : list) {
        String role = String.valueOf(item);
        // FAM: roles are FAM bookkeeping (e.g. grant expiry), not permissions.
        if (!role.startsWith("FAM:")) {
          roles.add(stripScopes(role));
        }
      }
    }
  }

  /**
   * Strips scope suffixes from the right: the value is what follows the last {@code -}, and the
   * text before it must end in a known scope type. Never split on underscores, region values
   * contain them. Mirrors {@code CssRoleNaming.parse} in nr-fam.
   */
  private static String stripScopes(String role) {
    int dash;
    while ((dash = role.lastIndexOf('-')) > 0) {
      String head = role.substring(0, dash);
      String scope = scopeTypes.stream().filter(head::endsWith).findFirst().orElse(null);
      if (scope == null) {
        break;
      }
      role = head.substring(0, head.length() - scope.length());
    }
    return role;
  }
}
