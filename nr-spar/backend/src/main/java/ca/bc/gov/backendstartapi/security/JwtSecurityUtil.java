package ca.bc.gov.backendstartapi.security;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.security.oauth2.jwt.Jwt;

/** This class contains methods for handling JWT requests. */
public final class JwtSecurityUtil {

  /**
   * Gets user roles from user JWT token.
   *
   * @param jwtPrincipal The token to be read.
   * @return A Set of String with found roles.
   */
  public static Set<String> getUserRolesFromJwt(Jwt jwtPrincipal) {
    Set<String> roles = new HashSet<>();
    if (jwtPrincipal.getClaims().containsKey("cognito:groups")) {
      Object clientRolesObj = jwtPrincipal.getClaims().get("cognito:groups");
      if (clientRolesObj instanceof List<?> list) {
        for (Object item : list) {
          String role = String.valueOf(item);
          // Removes Client Number
          if (role.length() >= 9) {
            String clientNumber = role.substring(role.length() - 8);
            if (clientNumber.replaceAll("[0-9]", "").isEmpty()) {
              role = role.substring(0, role.length() - 9); // Removes dangling underscore
            }
          }
          roles.add(role);
        }
      }
    }
    return roles;
  }
}
