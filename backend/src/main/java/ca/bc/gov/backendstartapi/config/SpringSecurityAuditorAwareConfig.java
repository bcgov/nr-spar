package ca.bc.gov.backendstartapi.config;

import ca.bc.gov.backendstartapi.security.JwtSecurityUtil;
import java.util.Optional;
import org.springframework.data.domain.AuditorAware;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

/** This class handle the audit information automatically. */
public class SpringSecurityAuditorAwareConfig implements AuditorAware<String> {

  @Override
  public @NonNull Optional<String> getCurrentAuditor() {
    return Optional.ofNullable(SecurityContextHolder.getContext())
            .map(SecurityContext::getAuthentication)
            .filter(Authentication::isAuthenticated)
            .map(Authentication::getPrincipal)
            .map(this::getCurrentUserName);
  }

  private String getCurrentUserName(Object principal) {
    if (principal instanceof Jwt jwtPrincipal) {
      return JwtSecurityUtil.getUserIdFromJwt(jwtPrincipal);
    }
    return null;
  }
}
