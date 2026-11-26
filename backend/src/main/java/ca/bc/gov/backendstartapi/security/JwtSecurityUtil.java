package ca.bc.gov.backendstartapi.security;

import ca.bc.gov.backendstartapi.config.Constants;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * This class contains methods for handling JWT requests.
 *
 * <p>FAM grants roles through BC Gov SSO (Keycloak). A scoped grant has its scope in the role name
 * only, e.g. {@code SPAR_NONMINISTRY_ORCHARD_FOREST_CLIENT-00012345}; the bare role code is not in
 * the token for scoped holders.
 */
public final class JwtSecurityUtil {

  private static final List<String> concreteRoles =
      List.of("SPAR_MINISTRY_ORCHARD", "SPAR_TSC_ADMIN");

  private static final String FOREST_CLIENT_SCOPE = "_FOREST_CLIENT";

  /** FAM writes scope suffixes in the order district, region, forest client. */
  private static final List<String> scopeTypes =
      List.of(FOREST_CLIENT_SCOPE, "_DISTRICT", "_REGION");

  /** A role code with its forest client scope, if it has one. */
  private record ParsedRole(String role, String clientNumber) {}

  /**
   * Gets user roles from user JWT token.
   *
   * @param jwtPrincipal The token to be read.
   * @return A Set of String with found roles.
   */
  public static Set<String> getUserRolesFromJwt(Jwt jwtPrincipal) {
    Set<String> roles = new HashSet<>();
    getRawRoles(jwtPrincipal).forEach(role -> roles.add(parseRole(role).role()));
    return roles;
  }

  /**
   * Gets user client ids from the JWT token.
   *
   * @param jwtPrincipal The token to be read.
   * @return A List of String with found client ids.
   */
  public static List<String> getClientIdsFromJwt(Jwt jwtPrincipal) {
    List<String> clientIds = new ArrayList<>();
    boolean foundRole = false;

    for (String rawRole : getRawRoles(jwtPrincipal)) {
      ParsedRole parsed = parseRole(rawRole);
      if (parsed.clientNumber() != null && !clientIds.contains(parsed.clientNumber())) {
        clientIds.add(parsed.clientNumber());
      }
      if (concreteRoles.contains(parsed.role())) {
        foundRole = true;
      }
    }

    // If has role SPAR_MINISTRY_ORCHARD or SPAR_TSC_ADMIN and has no client id
    // then add MOF client id
    if (foundRole && !clientIds.contains(Constants.MINISTRY_OF_FORESTS_ID)) {
      clientIds.add(Constants.MINISTRY_OF_FORESTS_ID);
    }

    return clientIds;
  }

  /**
   * Strips scope suffixes from the right: the value is what follows the last {@code -}, and the
   * text before it must end in a known scope type. Never split on underscores, region values
   * contain them. Mirrors {@code CssRoleNaming.parse} in nr-fam.
   */
  private static ParsedRole parseRole(String name) {
    String role = name;
    String clientNumber = null;
    int dash;
    while ((dash = role.lastIndexOf('-')) > 0) {
      String head = role.substring(0, dash);
      String scope = scopeTypes.stream().filter(head::endsWith).findFirst().orElse(null);
      if (scope == null) {
        break;
      }
      if (scope.equals(FOREST_CLIENT_SCOPE)) {
        clientNumber = role.substring(dash + 1);
      }
      role = head.substring(0, head.length() - scope.length());
    }
    return new ParsedRole(role, clientNumber);
  }

  /**
   * CSS emits {@code client_roles}; stock Keycloak uses {@code resource_access.<azp>.roles},
   * so read both. {@code FAM:} roles are FAM bookkeeping (e.g. grant expiry), not permissions.
   */
  private static List<String> getRawRoles(Jwt jwtPrincipal) {
    List<String> fullList = new ArrayList<>();
    addAll(fullList, jwtPrincipal.getClaims().get("client_roles"));
    if (jwtPrincipal.getClaims().get("resource_access") instanceof Map<?, ?> resourceAccess
        && resourceAccess.get(jwtPrincipal.getClaimAsString("azp")) instanceof Map<?, ?> client) {
      addAll(fullList, client.get("roles"));
    }
    fullList.removeIf(role -> role.startsWith("FAM:"));
    return fullList;
  }

  private static void addAll(List<String> target, Object roles) {
    if (roles instanceof List<?> list) {
      list.forEach(item -> target.add(String.valueOf(item)));
    }
  }
}
