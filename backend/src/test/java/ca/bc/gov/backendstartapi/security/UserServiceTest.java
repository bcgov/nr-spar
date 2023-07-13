package ca.bc.gov.backendstartapi.security;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.exception.UserNotFoundException;
import ca.bc.gov.backendstartapi.repository.UserProfileRepository;
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
class UserServiceTest {

  @Mock UserProfileRepository userProfileRepository;

  @Mock UserAuthenticationHelper userAuthenticationHelper;

  private LoggedUserService loggedUserService;

  private UserInfo userInfo;

  @BeforeEach
  void setup() {
    loggedUserService = new LoggedUserService(userAuthenticationHelper);
    userInfo =
        new UserInfo(
            "123456789@idir",
            "User",
            "Test",
            "user@test.com",
            "Test, User: LWRS:EX",
            "USERT",
            null,
            IdentityProvider.IDIR,
            Set.of(),
            "abcdef123456789");
  }

  @Test
  @DisplayName("getLoggedUserEmailTest")
  void getLoggedUserEmailTest() {
    when(userAuthenticationHelper.getUserInfo()).thenReturn(Optional.of(userInfo));

    String userEmail = loggedUserService.getLoggedUserEmail();

    Assertions.assertEquals("user@test.com", userEmail);
  }

  @Test
  @DisplayName("getLoggedUserEmailExceptionTest")
  void getLoggedUserEmailExceptionTest() {
    Exception e =
        Assertions.assertThrows(
            UserNotFoundException.class,
            () -> {
              loggedUserService.getLoggedUserEmail();
            });

    Assertions.assertEquals("404 NOT_FOUND \"User not registered!\"", e.getMessage());
  }

  @Test
  @DisplayName("getLoggerUserInfoTest")
  void getLoggerUserInfoTest() {
    when(userAuthenticationHelper.getUserInfo()).thenReturn(Optional.of(userInfo));

    Optional<UserInfo> userInfoOp = loggedUserService.getLoggedUserInfo();

    Assertions.assertTrue(userInfoOp.isPresent());
  }

  @Test
  void createUserService() {
    LoggedUserService loggedUserService1 = new LoggedUserService(userAuthenticationHelper);
    Assertions.assertNotNull(loggedUserService1);
  }

  @Test
  @DisplayName("getLoggedUserTokenTest")
  void getLoggedUserTokenTest() {
    when(userAuthenticationHelper.getUserInfo()).thenReturn(Optional.of(userInfo));

    Optional<UserInfo> userInfoOp = loggedUserService.getLoggedUserInfo();

    Assertions.assertTrue(userInfoOp.isPresent());
    Assertions.assertEquals("abcdef123456789", userInfoOp.get().jwtToken());
  }

  @Test
  @DisplayName("getLoggedUserTokenEmptyTest")
  void getLoggedUserTokenEmptyTest() {
    Exception e =
        Assertions.assertThrows(
            UserNotFoundException.class,
            () -> {
              loggedUserService.getLoggedUserToken();
            });

    Assertions.assertEquals("404 NOT_FOUND \"User not registered!\"", e.getMessage());
  }

  @Test
  @DisplayName("getLoggedUserIdEmptyTest")
  void getLoggedUserIdEmptyTest() {
    when(userAuthenticationHelper.getUserInfo()).thenReturn(Optional.empty());

    Exception e =
        Assertions.assertThrows(
            UserNotFoundException.class,
            () -> {
              loggedUserService.getLoggedUserId();
            });

    Assertions.assertEquals("404 NOT_FOUND \"User not registered!\"", e.getMessage());
  }

  @Test
  @DisplayName("getLoggedUserIdSuccessTest")
  void getLoggedUserIdSuccessTest() {
    when(userAuthenticationHelper.getUserInfo()).thenReturn(Optional.of(userInfo));

    Optional<UserInfo> userInfoOp = loggedUserService.getLoggedUserInfo();

    Assertions.assertTrue(userInfoOp.isPresent());
    Assertions.assertEquals("123456789@idir", userInfoOp.get().id());
  }
}
