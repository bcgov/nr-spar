package ca.bc.gov.backendstartapi.security;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.exception.ClientIdForbiddenException;
import ca.bc.gov.backendstartapi.exception.UserNotFoundException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class LoggedUserServiceTest {

  @Mock UserAuthenticationHelper userAuthenticationHelper;

  private LoggedUserService loggedUserService;

  @BeforeEach
  void setup() {
    loggedUserService = new LoggedUserService(userAuthenticationHelper);
  }

  private UserInfo mockUserInfo(Set<String> roles, List<String> clients) {
    return new UserInfo(
        "123456789@idir",
        "Bilbo",
        "Baggings",
        "bilbo.baggings@gov.bc.ca",
        "Baggings, Bilbo LWRS:EX",
        "BAGGINGS",
        null,
        IdentityProvider.IDIR,
        roles != null ? roles : Set.of(),
        clients != null ? clients : List.of(),
        "abcdef123456789");
  }

  @Test
  @DisplayName("Verify seedlot access privilege happy path should succeed")
  void verifySeedlotAccessPrivilege_happyPath_shouldSucceed() {
    String clientId = "00012345";

    when(userAuthenticationHelper.getUserInfo())
        .thenReturn(
            Optional.of(mockUserInfo(Set.of("FAKE_ROLE_TEST_00012345"), List.of("00012345"))));

    Assertions.assertDoesNotThrow(
        () -> {
          loggedUserService.verifySeedlotAccessPrivilege(clientId);
        });
  }

  @Test
  @DisplayName("Verify seedlot access privilege no user should succeed")
  void verifySeedlotAccessPrivilege_noUser_shouldSucceed() {
    String clientId = "00012345";

    when(userAuthenticationHelper.getUserInfo()).thenReturn(Optional.empty());

    Assertions.assertThrows(
        UserNotFoundException.class,
        () -> {
          loggedUserService.verifySeedlotAccessPrivilege(clientId);
        });
  }

  @Test
  @DisplayName("Verify seedlot access privilege tsc admin should succeed")
  void verifySeedlotAccessPrivilege_tscAdmin_shouldSucceed() {
    String clientId = "00012345";

    when(userAuthenticationHelper.getUserInfo())
        .thenReturn(Optional.of(mockUserInfo(Set.of("SPAR_TSC_ADMIN"), null)));

    Assertions.assertDoesNotThrow(
        () -> {
          loggedUserService.verifySeedlotAccessPrivilege(clientId);
        });
  }

  @Test
  @DisplayName("Verify seedlot access privilege regular user should fail")
  void verifySeedlotAccessPrivilege_regularUser_shouldSucceed() {
    String clientId = "00012345";

    when(userAuthenticationHelper.getUserInfo())
        .thenReturn(
            Optional.of(mockUserInfo(Set.of("FAKE_ROLE_TEST_00012345"), List.of("00012346"))));

    Assertions.assertThrows(
        ClientIdForbiddenException.class,
        () -> {
          loggedUserService.verifySeedlotAccessPrivilege(clientId);
        });
  }
}
