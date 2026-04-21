package ca.bc.gov.oracleapi.security;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

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

  /**
   * Gets the user ID (IDIR username) from the JWT's {@code custom:idp_username}
   * claim. Throws 401 if the claim is missing or blank — the JWT is malformed
   * for our purposes.
   *
   * @param jwtPrincipal the validated JWT
   * @return the IDIR username
   * @throws ResponseStatusException 401 when the claim is absent or blank
   */
  public static String getUserIdFromJwt(Jwt jwtPrincipal) {
    Object claim = jwtPrincipal.getClaims().get("custom:idp_username");
    if (claim == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Missing custom:idp_username claim in JWT");
    }
    String value = String.valueOf(claim).trim();
    if (value.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Blank custom:idp_username claim in JWT");
    }
    return value;
  }
}
