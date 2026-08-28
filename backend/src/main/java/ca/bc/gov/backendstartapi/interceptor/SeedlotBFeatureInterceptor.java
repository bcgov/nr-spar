package ca.bc.gov.backendstartapi.interceptor;

import ca.bc.gov.backendstartapi.config.FeatureFlagConfig;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.security.RequiresSeedlotB;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/** Blocks endpoints annotated with {@link RequiresSeedlotB} while the feature is turned off. */
@Component
@RequiredArgsConstructor
public class SeedlotBFeatureInterceptor implements HandlerInterceptor {

  private final FeatureFlagConfig featureFlagConfig;

  @Override
  public boolean preHandle(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull Object handler)
      throws Exception {

    if (featureFlagConfig.isSeedlotBEnabled()) {
      return true;
    }

    if (!(handler instanceof HandlerMethod handlerMethod)
        || !handlerMethod.hasMethodAnnotation(RequiresSeedlotB.class)) {
      return true;
    }

    SparLog.info("Request denied, B-class is disabled: {}", request.getRequestURI());
    response.sendError(
        HttpStatus.FORBIDDEN.value(), FeatureFlagConfig.SEEDLOT_B_DISABLED_MESSAGE);
    return false;
  }
}
