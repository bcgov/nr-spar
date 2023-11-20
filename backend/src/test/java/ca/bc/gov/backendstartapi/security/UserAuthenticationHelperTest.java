package ca.bc.gov.backendstartapi.security;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class UserAuthenticationHelperTest {

  private UserAuthenticationHelper userAuthenticationHelper;

  @BeforeEach
  void setup() {
    userAuthenticationHelper = new UserAuthenticationHelper();
  }

  @Test
  @DisplayName("getUserInfoIdirTest")
  void getUserInfoIdirTest() {
    Authentication authentication = mock(Authentication.class);
    SecurityContext securityContext = mock(SecurityContext.class);
    SecurityContextHolder.setContext(securityContext);

    when(securityContext.getAuthentication()).thenReturn(authentication);
    when(authentication.isAuthenticated()).thenReturn(true);

    Jwt.Builder builder = Jwt.withTokenValue("myTokenValue");
    builder.subject("BAGGINGS");
    builder.header("alg", "HS256");
    builder.header("typ", "JWT");
    builder.claim("email", "bilbo.baggings@gov.bc.ca");
    builder.claim("custom:idp_display_name", "Baggings, Bilbo LWRS:EX");
    builder.claim("custom:idp_username", "BAGGINGS");
    builder.claim("custom:idp_name", "idir");
    builder.claim("cognito:username", "IDIR@BAGGINGS");

    when(authentication.getPrincipal()).thenReturn(builder.build());

    Optional<UserInfo> userInfoOptional = userAuthenticationHelper.getUserInfo();
    Assertions.assertTrue(userInfoOptional.isPresent());

    UserInfo userInfo = userInfoOptional.get();
    Assertions.assertEquals("IDIR@BAGGINGS", userInfo.id());
    Assertions.assertEquals("Bilbo", userInfo.firstName());
    Assertions.assertEquals("Baggings", userInfo.lastName());
    Assertions.assertEquals("bilbo.baggings@gov.bc.ca", userInfo.email());
    Assertions.assertEquals("Baggings, Bilbo LWRS:EX", userInfo.displayName());
    Assertions.assertEquals("BAGGINGS", userInfo.idirUsername());
    Assertions.assertEquals(IdentityProvider.IDIR, userInfo.identityProvider());
  }

  @Test
  @DisplayName("getUserInfoBusinessBceidTest")
  void getUserInfoBusinessBceidTest() {
    Authentication authentication = mock(Authentication.class);
    SecurityContext securityContext = mock(SecurityContext.class);
    SecurityContextHolder.setContext(securityContext);

    when(securityContext.getAuthentication()).thenReturn(authentication);
    when(authentication.isAuthenticated()).thenReturn(true);

    Jwt.Builder builder = Jwt.withTokenValue("myTokenValue");
    builder.subject("MORDOR-BCEID");
    builder.header("alg", "HS256");
    builder.header("typ", "JWT");
    builder.claim("email", "lord.sauron@mordor.middleearth");
    builder.claim("custom:idp_display_name", "Lord Sauron of Mordor");
    builder.claim("custom:idp_username", "MORDOR-BCEID");
    builder.claim("custom:idp_name", "bceidbusiness");
    builder.claim("cognito:username", "BCEIDBUSINESS@MORDOR-BCEID");

    when(authentication.getPrincipal()).thenReturn(builder.build());

    Optional<UserInfo> userInfoOptional = userAuthenticationHelper.getUserInfo();
    Assertions.assertTrue(userInfoOptional.isPresent());

    UserInfo userInfo = userInfoOptional.get();
    Assertions.assertEquals("BCEIDBUSINESS@MORDOR-BCEID", userInfo.id());
    Assertions.assertEquals("Lord", userInfo.firstName());
    Assertions.assertEquals("Sauron of Mordor", userInfo.lastName());
    Assertions.assertEquals("lord.sauron@mordor.middleearth", userInfo.email());
    Assertions.assertEquals("Lord Sauron of Mordor", userInfo.displayName());
    Assertions.assertEquals("MORDOR-BCEID", userInfo.businessName());
    Assertions.assertEquals(IdentityProvider.BUSINESS_BCEID, userInfo.identityProvider());
  }

  @Test
  @DisplayName("getUserInfoTestNotAuthenticated")
  void getUserInfoTestNotAuthenticated() {
    Authentication authentication = mock(Authentication.class);
    SecurityContext securityContext = mock(SecurityContext.class);
    SecurityContextHolder.setContext(securityContext);

    when(securityContext.getAuthentication()).thenReturn(authentication);

    Optional<UserInfo> userInfoOptional = userAuthenticationHelper.getUserInfo();
    Assertions.assertFalse(userInfoOptional.isPresent());
  }
}
