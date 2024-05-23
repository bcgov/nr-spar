package ca.bc.gov.backendstartapi.security;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.NonNull;

/**
 * This record represents a user logged and his information from a decoded JWT. Be aware that very
 * soon this class will get updated with FAM properties.
 *
 * @param id the user's identifier. Decoded from the JWT token. E.g.: {@code idir@username} or
 *     {@code bceidbusiness@username}
 * @param firstName the user's first name. Read from the JWT {@code given_name} claim. Present only
 *     when the identity is provided by {@link IdentityProvider#IDIR IDIR}
 * @param lastName The user's last name. Read from the JWT {@code family_name} claim. Present only
 *     when the identity is provided by {@code IDIR}
 * @param email the user's email. Read from the JWT {@code email} claim
 * @param displayName the name that should be displayed in the client for this user. Read from JWT
 *     {@code display_name} claim
 * @param idirUsername The user's IDIR username containing eight characters. This prop comes from
 *     the JWT {@code idir_username} claim. Present only when the identity is provided by {@code
 *     IDIR}. E.g.: {@code HAPOTTER}
 * @param businessName the business' name. This prop comes from the JWT {@code bceid_business_name}
 *     claim. Present only when the identity is provided by {@link IdentityProvider#BUSINESS_BCEID
 *     Business BCeID}
 * @param identityProvider the identity provider used to authenticate this user. This prop comes
 *     from the JWT {@code identity_provider} claim
 * @param roles The user's roles. This prop comes from the JWT {@code cognito:groups} claim
 * @param clientIds The user client ids. This prop comes from the JWT {@code cognito:groups} claim
 * @param jwtToken The user's JWT token
 */
public record UserInfo(
    @NonNull String id,
    String firstName,
    String lastName,
    @NonNull String email,
    @NonNull String displayName,
    String idirUsername,
    String businessName,
    @NonNull IdentityProvider identityProvider,
    @NonNull Set<String> roles,
    @NonNull List<String> clientIds,
    @NonNull String jwtToken) {

  /** Ensure immutability for the user's roles. */
  public UserInfo {
    if (identityProvider.equals(IdentityProvider.IDIR)) {
      Objects.requireNonNull(firstName);
      Objects.requireNonNull(lastName);
      Objects.requireNonNull(idirUsername);
    }
    if (identityProvider.equals(IdentityProvider.BUSINESS_BCEID)) {
      Objects.requireNonNull(businessName);
    }
    roles = Collections.unmodifiableSet(roles);
    clientIds = Collections.unmodifiableList(clientIds);
  }

  /** Mocks a dev user for testing purposes */
  public static UserInfo createDevUser() {
    return new UserInfo(
        "FSTACK",
        "FullStack",
        "Developer",
        "fullstack-dev@email.com",
        "Developer, FullStack LRWS:EX",
        "DEV-IDIR",
        null,
        IdentityProvider.IDIR,
        Set.of(),
        List.of(),
        "abcdef123456");
  }
}
