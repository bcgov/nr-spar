package ca.bc.gov.backendstartapi.security;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.exception.UserNotFoundException;
import ca.bc.gov.backendstartapi.repository.UserProfileRepository;
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
class UserServiceTest {

  @Mock UserProfileRepository userProfileRepository;

  @Mock UserAuthenticationHelper userAuthenticationHelper;

  private LoggedUserService loggedUserService;

  private UserInfo userInfo;

  private UserInfo createUserInfo(boolean isIdir) {
    IdentityProvider provider = isIdir ? IdentityProvider.IDIR : IdentityProvider.BUSINESS_BCEID;

    return new UserInfo(
        "123456789@idir",
        "User",
        "Test",
        "user@test.com",
        "Test, User: LWRS:EX",
        isIdir ? "USERT" : null,
        !isIdir ? "user-my-bceid" : null,
        provider,
        Set.of(),
        List.of(),
        "abcdef123456789");
  }

  @BeforeEach
  void setup() {
    loggedUserService = new LoggedUserService(userAuthenticationHelper);
    userInfo = createUserInfo(true);
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

  @Test
  @DisplayName("getLoggedUserIdirOrBceIdSuccessTest")
  void getLoggedUserIdirOrBceIdSuccessTest() {
    // IDIR
    UserInfo idirUser = createUserInfo(true);
    when(userAuthenticationHelper.getUserInfo()).thenReturn(Optional.of(idirUser));
    String userId = loggedUserService.getLoggedUserIdirOrBceId();

    Assertions.assertFalse(userId.isEmpty());
    Assertions.assertEquals("USERT", idirUser.idirUsername());
    Assertions.assertNull(idirUser.businessName());

    // BCeID
    UserInfo bceIdUser = createUserInfo(false);
    when(userAuthenticationHelper.getUserInfo()).thenReturn(Optional.of(bceIdUser));
    userId = loggedUserService.getLoggedUserIdirOrBceId();

    Assertions.assertFalse(userId.isEmpty());
    Assertions.assertEquals("user-my-bceid", bceIdUser.businessName());
    Assertions.assertNull(bceIdUser.idirUsername());
  }

  @Test
  @DisplayName("getLoggedUserIdirOrBceIdEmptyTest")
  void getLoggedUserIdirOrBceIdEmptyTest() {
    Exception e =
        Assertions.assertThrows(
            UserNotFoundException.class,
            () -> {
              loggedUserService.getLoggedUserIdirOrBceId();
            });

    Assertions.assertEquals("404 NOT_FOUND \"User not registered!\"", e.getMessage());
  }
}
