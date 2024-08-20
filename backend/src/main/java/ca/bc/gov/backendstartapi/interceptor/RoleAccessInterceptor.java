package ca.bc.gov.backendstartapi.interceptor;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.security.JwtSecurityUtil;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** This class represents a request interceptor resposible for ensuring RBAC. */
@Component
public class RoleAccessInterceptor implements HandlerInterceptor {

  @Override
  public boolean preHandle(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull Object handler)
      throws Exception {
    String requestUri = request.getRequestURI();

    // Bypass other handlers - internal spring boot handlers
    if (!handler.toString().contains("ca.bc.gov.backendstartapi")) {
      return true;
    }

    // Gets the resource handler (class name and method name)
    String[] resourceHandler = handler.toString().split("#");

    // Bypass status page endpoint
    if (resourceHandler[0].contains("StatusPageEndpoint")) {
      return true;
    }

    // Gets the allowed roles (declared) and its allowed operations for the resource
    List<String> rolesRequired = getResourceRolesRequired(resourceHandler, requestUri);

    // Get the current user roles (from the request bearer token)
    List<String> userRoles = getUserRoles(request);

    boolean allowed = matchUserRoleWithResourceRoles(rolesRequired, userRoles);
    if (!allowed) {
      response.setStatus(HttpStatus.UNAUTHORIZED.value());
    }

    return allowed;
  }

  /**
   * Matches the required roles with user roles.
   *
   * @param requiredRolesList List of roles quired for this resource.
   * @param userRoles List of user roles.
   * @return True if allowed, if found a matching user role, false otherwise.
   */
  private boolean matchUserRoleWithResourceRoles(
      List<String> rolesRequired, List<String> userRoles) {
    for (String requiredRole : rolesRequired) {
      if (userRoles.contains(requiredRole)) {
        SparLog.debug("Request allowed by user role: {}", requiredRole);
        return true;
      }
    }
    SparLog.debug("Request denied. No enough access levels!");
    return false;
  }

  /**
   * Get user roles from the request.
   *
   * @param request The HTTP Request.
   * @return An {@link ArrayList} of Strings with the roles, or an empty list.
   */
  private List<String> getUserRoles(HttpServletRequest request) {
    if (request.getUserPrincipal() instanceof JwtAuthenticationToken jwtToken) {
      Set<String> roles = JwtSecurityUtil.getUserRolesFromJwt(jwtToken.getToken());
      SparLog.debug("User roles: {}", roles);
      return new ArrayList<>(roles);
    }

    // Fix for unit testing
    SecurityContext context = SecurityContextHolder.getContext();
    if (context.getAuthentication().getName().equals("SPARTest")) {
      List<String> grantedList = new ArrayList<>();
      if (context.getAuthentication().getAuthorities().size() > 0) {
        Object[] grants = context.getAuthentication().getAuthorities().toArray();
        for (int i = 0; i < context.getAuthentication().getAuthorities().size(); i++) {
          String grant = String.valueOf(grants[i]);
          grantedList.add(grant.substring(5));
        }
      }
      SparLog.debug("SPAR Test User roles: {}", grantedList);
      return grantedList;
    }

    return List.of();
  }

  /**
   * Gets the matrix with all declared roles and permissions to each role.
   *
   * @param classNameWithMethod String Array containing handlers
   * @param uri Request URI.
   * @return A List containing the declared roles, or an empty list.
   */
  private List<String> getResourceRolesRequired(String[] classNameWithMethod, String uri) {
    List<String> combination = getClassAndMethodNames(classNameWithMethod);

    if (combination.isEmpty()) {
      return List.of();
    }

    String className = combination.get(0);
    String methodName = combination.get(1);

    try {
      Class<?> handlerClass = Class.forName(className);
      if (!Objects.isNull(handlerClass)) {
        Method[] methods = handlerClass.getMethods();
        Method method = null;
        for (Method m : methods) {
          if (m.getName().equals(methodName)) {
            method = m;
            break;
          }
        }
        if (method == null) {
          SparLog.warn("Not found method for name {} at {}!", methodName, className);
          return List.of();
        }
        RoleAccessConfig annotation = method.getAnnotation(RoleAccessConfig.class);
        if (Objects.isNull(annotation)) {
          SparLog.warn("API missing CrudMatrixFilterConfigs {}#{}", className, methodName);
          return List.of();
        }

        List<String> roles = Arrays.asList(annotation.value());
        SparLog.debug("Access level required for {}: {}", uri, roles);
        return roles;
      }
    } catch (Exception e) {
      SparLog.warn(
          "Exception when getting roles matrix operations for {}#{}", className, methodName);
    }
    return List.of();
  }

  /**
   * Gets the handler class and method name from the request.
   *
   * @param classNameWithMethod String Array containing handlers
   * @return String arrays fixed with size 2 if found, or zero if not found
   */
  private List<String> getClassAndMethodNames(String[] classNameWithMethod) {
    String className = null;
    if (classNameWithMethod.length > 0) {
      className = classNameWithMethod[0];
    }
    String methodName = null;
    if (classNameWithMethod.length > 1) {
      int indexOfParent = classNameWithMethod[1].indexOf("(");
      methodName = classNameWithMethod[1].substring(0, indexOfParent);
    }

    if (Objects.isNull(className) || !className.startsWith("ca.bc.gov.backendstartapi")) {
      return List.of();
    }

    return List.of(className, methodName);
  }
}
