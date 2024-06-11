package ca.bc.gov.backendstartapi.security;

import ca.bc.gov.backendstartapi.config.SparLog;
import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/** This class contains helper methods to retrieved authenticated user. */
@Component
@RequiredArgsConstructor
public class UserAuthenticationHelper {

  @Autowired private Environment environment;

  /**
   * Get the logged user information.
   *
   * @return An Optional of {@link UserInfo} with all information from JWT token, if logged in or
   *     empty Optional otherwise.
   */
  public Optional<UserInfo> getUserInfo() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication.isAuthenticated()) {
      if (authentication.getPrincipal() instanceof Jwt jwtPrincipal) {
        // Provider IDIR or BCeID & username
        String provider = jwtPrincipal.getClaimAsString("custom:idp_name");
        boolean isIdirProvider = provider.equals("idir");
        String idpUsername = jwtPrincipal.getClaimAsString("custom:idp_username");

        // User name
        String displayName = jwtPrincipal.getClaimAsString("custom:idp_display_name");
        String firstName = "";
        String lastName = "";

        // Usually only IDIR contains comma.
        if (displayName.contains(",")) {
          String[] parts = displayName.split(",");
          firstName = parts[1].trim();

          // Remove WLRS:EX or any additional info
          if (firstName.contains(" ")) {
            firstName = firstName.split(" ")[0].trim();
          }

          lastName = parts[0].trim();
          // Remove 'de' or other starting characteres before space
          if (lastName.contains(" ")) {
            lastName = lastName.split(" ")[1].trim();
          }
        } else if (displayName.contains(" ")) {
          // Usually BCeID contains space. E.g.: NRS Load Test-3
          int indexFirstSpace = displayName.indexOf(' ');
          firstName = displayName.substring(0, indexFirstSpace);
          lastName = displayName.substring(indexFirstSpace).trim();
        }

        // User id {IDIR@USERNAME}
        String cappedUsername = idpUsername.toUpperCase();
        String cappedProvider = provider.toUpperCase();
        String userId = String.format("%s@%s", cappedProvider, cappedUsername);

        // Email will be empty, until next FAM release
        String email = jwtPrincipal.getClaimAsString("email");

        UserInfo userInfo =
            new UserInfo(
                userId,
                firstName,
                lastName,
                email,
                displayName,
                isIdirProvider ? idpUsername : null,
                isIdirProvider ? null : idpUsername,
                IdentityProvider.fromClaim(provider).orElseThrow(),
                JwtSecurityUtil.getUserRolesFromJwt(jwtPrincipal),
                JwtSecurityUtil.getClientIdsFromJwt(jwtPrincipal),
                jwtPrincipal.getTokenValue());

        return Optional.of(userInfo);
      }
    }

    SparLog.info("User not authenticated!");

    // Checks if it's the 'docker-compose' profile enabled (local dev env)
    boolean isDockerComposeProfile = false;
    if (!Objects.isNull(environment)) {
      String[] profiles = environment.getActiveProfiles();
      isDockerComposeProfile = Arrays.asList(profiles).contains("docker-compose");
    }

    if (isDockerComposeProfile) {
      SparLog.info("Local development environment found! Using dev user!");
      return Optional.of(UserInfo.createDevUser());
    }

    return Optional.empty();
  }
}
