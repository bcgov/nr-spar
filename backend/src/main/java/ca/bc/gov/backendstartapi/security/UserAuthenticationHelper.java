package ca.bc.gov.backendstartapi.security;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/** This class contains helper methods to retrieved authenticated user. */
@Slf4j
@Component
public class UserAuthenticationHelper {

  /**
   * Get the logged user information.
   *
   * @return An Optional of {@link UserInfo} with all information from JWT token, if logged in or
   *     empty Optional otherwise.
   */
  public Optional<UserInfo> getUserInfo() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication.isAuthenticated()) {
      if (authentication.getPrincipal() instanceof String userPrincipal) {
        // Fake user until we get the back end working with Cognito on task #481
        UserInfo userInfo =
            new UserInfo(
                userPrincipal,
                "fake-given_name",
                "fake-family_name",
                "fake-email",
                "fake-display_name",
                "fake-idir_username",
                "fake-bceid_business_name",
                IdentityProvider.IDIR,
                Set.of(),
                "fake-token");

        return Optional.of(userInfo);
      } else if (authentication.getPrincipal() instanceof Jwt jwtPrincipal) {
        Set<String> roles = new HashSet<>();
        if (jwtPrincipal.getClaims().containsKey("client_roles")) {
          roles.addAll(jwtPrincipal.getClaimAsStringList("client_roles"));
        }

        UserInfo userInfo =
            new UserInfo(
                jwtPrincipal.getClaimAsString("sub"),
                jwtPrincipal.getClaimAsString("given_name"),
                jwtPrincipal.getClaimAsString("family_name"),
                jwtPrincipal.getClaimAsString("email"),
                jwtPrincipal.getClaimAsString("display_name"),
                jwtPrincipal.getClaimAsString("idir_username"),
                jwtPrincipal.getClaimAsString("bceid_business_name"),
                IdentityProvider.fromClaim(jwtPrincipal).orElseThrow(),
                roles,
                jwtPrincipal.getTokenValue());

        return Optional.of(userInfo);
      }
    }

    log.info("User not authenticated!");
    return Optional.empty();
  }
}
