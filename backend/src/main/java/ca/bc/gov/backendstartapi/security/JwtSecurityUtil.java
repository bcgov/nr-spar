package ca.bc.gov.backendstartapi.security;

import ca.bc.gov.backendstartapi.config.Constants;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.security.oauth2.jwt.Jwt;

/** This class contains methods for handling JWT requests. */
public final class JwtSecurityUtil {

  private final static List<String> concreteRoles = List.of("SPAR_MINISTRY_ORCHARD", "SPAR_TSC_ADMIN");

  /**
   * Gets user roles from user JWT token.
   *
   * @param jwtPrincipal The token to be read.
   * @return A Set of String with found roles.
   */
  public static Set<String> getUserRolesFromJwt(Jwt jwtPrincipal) {
    Set<String> roles = new HashSet<>();
    getRolesWithClientIds(jwtPrincipal)
        .forEach(
            role -> {
              if (role.length() >= 9) {
                String clientNumber = role.substring(role.length() - 8);
                if (clientNumber.replaceAll("[0-9]", "").isEmpty()) {
                  role = role.substring(0, role.length() - 9); // Removes dangling underscore
                }
              }
              roles.add(role);
            });
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
    getRolesWithClientIds(jwtPrincipal)
        .forEach(
            role -> {
              if (role.length() >= 9) {
                String clientNumber = role.substring(role.length() - 8);
                if (clientNumber.replaceAll("[0-9]", "").isEmpty()) {
                  clientIds.add(clientNumber);
                }
              }
              // Handling concrete roles with no client id affixed
              if (concreteRoles.contains(role)
                  && !clientIds.contains(Constants.MINITRY_OF_FORESTS_ID)) {
                clientIds.add(Constants.MINITRY_OF_FORESTS_ID);
              }
            });
    return clientIds;
  }

  private static List<String> getRolesWithClientIds(Jwt jwtPrincipal) {
    List<String> fullList = new ArrayList<>();
    if (jwtPrincipal.getClaims().containsKey("cognito:groups")) {
      Object clientRolesObj = jwtPrincipal.getClaims().get("cognito:groups");
      if (clientRolesObj instanceof List<?> list) {
        for (Object item : list) {
          String role = String.valueOf(item);
          fullList.add(role);
        }
      }
    }
    return fullList;
  }
}
