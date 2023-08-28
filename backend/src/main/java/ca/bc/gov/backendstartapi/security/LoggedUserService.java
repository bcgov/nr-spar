package ca.bc.gov.backendstartapi.security;

import ca.bc.gov.backendstartapi.exception.UserNotFoundException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class contains all user related methods and artifacts. */
@Service
@RequiredArgsConstructor
public class LoggedUserService {

  private final UserAuthenticationHelper userAuthenticationHelper;

  /**
   * Get all user info included in the JWT decoded token.
   *
   * @return an optional of {@link UserInfo}. It'll be empty then not logged in
   */
  public Optional<UserInfo> getLoggedUserInfo() {
    return userAuthenticationHelper.getUserInfo();
  }

  /**
   * Get the email address from the logged user.
   *
   * @return a String containing the email address if logged in
   * @throws UserNotFoundException when not logged in
   */
  public String getLoggedUserEmail() {
    Optional<UserInfo> userInfo = userAuthenticationHelper.getUserInfo();
    if (userInfo.isEmpty()) {
      throw new UserNotFoundException();
    }

    return userInfo.get().email();
  }

  /**
   * Get the ID from the logged user.
   *
   * @return a String containing the id if logged in. Or an empty string otherwise
   * @throws UserNotFoundException when not logged in
   */
  public String getLoggedUserId() {
    Optional<UserInfo> userInfo = userAuthenticationHelper.getUserInfo();
    if (userInfo.isEmpty()) {
      throw new UserNotFoundException();
    }

    return userInfo.get().id();
  }

  /**
   * Get the JWT Token from the logged user.
   *
   * @return a String containing the token if logged in. Or an empty string otherwise
   * @throws UserNotFoundException when not logged in
   */
  public String getLoggedUserToken() {
    Optional<UserInfo> userInfo = userAuthenticationHelper.getUserInfo();
    if (userInfo.isEmpty()) {
      throw new UserNotFoundException();
    }

    return userInfo.get().jwtToken();
  }

  /**
   * Get the logged user IDIR username or Business BCeID username.
   *
   * @return A String containing one of the above, according to provider.
   */
  public String getLoggedUserIdirOrBceId() {
    Optional<UserInfo> userInfoOp = userAuthenticationHelper.getUserInfo();
    if (userInfoOp.isEmpty()) {
      throw new UserNotFoundException();
    }

    UserInfo userInfo = userInfoOp.get();
    switch (userInfo.identityProvider()) {
      case IDIR: {
        return userInfo.idirUsername();
      }
      case BUSINESS_BCEID: {
        return userInfo.businessName();
      }
      default: {
        return "";
      }
    }
  }
}
