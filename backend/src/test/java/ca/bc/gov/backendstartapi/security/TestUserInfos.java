package ca.bc.gov.backendstartapi.security;

import java.util.List;
import java.util.Set;

/** Builds {@link UserInfo} instances for tests outside this package. */
public final class TestUserInfos {

  private TestUserInfos() {}

  /** An IDIR user with the given roles and client numbers. */
  public static UserInfo idirUser(Set<String> roles, List<String> clientIds) {
    return new UserInfo(
        "123456789@idir",
        "First",
        "Last",
        "user@gov.bc.ca",
        "Last, First",
        "USER",
        null,
        IdentityProvider.IDIR,
        roles,
        clientIds,
        "token");
  }
}
