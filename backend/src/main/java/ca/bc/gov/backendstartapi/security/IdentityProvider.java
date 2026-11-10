package ca.bc.gov.backendstartapi.security;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/** Enumeration of the identity providers our application works with. */
enum IdentityProvider {
  // IDIR-MFA reports itself as azureidir; both are the same IDIR account.
  IDIR("idir", "azureidir"),
  BUSINESS_BCEID("bceidbusiness");

  private final List<String> claimNames;

  IdentityProvider(String... claimNames) {
    this.claimNames = List.of(claimNames);
  }

  /** The canonical name, used to build user ids such as {@code IDIR@USERNAME}. */
  String getClaimName() {
    return claimNames.get(0);
  }

  /**
   * Extract the identity provider from a Jwt.
   *
   * @param provider the JWT {@code identity_provider} claim
   * @return the identity provider, if one is found
   */
  public static Optional<IdentityProvider> fromClaim(String provider) {
    return Arrays.stream(values())
        .filter(value -> value.claimNames.stream().anyMatch(provider::equalsIgnoreCase))
        .findFirst();
  }
}
