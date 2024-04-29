package ca.bc.gov.backendstartapi.interceptor;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.security.AccessLevel;
import ca.bc.gov.backendstartapi.security.AccessLevelRequired;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
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

    // Gets the operations declared for the resource
    List<Character> resourceOperations = getResourceOperations(resourceHandler);

    // Gets the allowed roles (declared) and its allowed operations for the resource
    Map<String, char[]> rolesConfigMap =
        getResourceRolesMatrix(resourceHandler, requestUri, resourceOperations);

    /*
     * Gets roles from the resource that can operate given the resource operation. Allow me to
     * hightlight that only roles that are allowed to do the operation (C,R,U,D) will be returned.
     * So, only roles that have full access on that endpoint will be returned.
     */
    List<String> requiredRolesList =
        getResourceRequiredRoles(resourceHandler, rolesConfigMap, resourceOperations);

    // Get the current user roles (from the request bearer token)
    List<String> userRoles = getUserRoles(request);

    boolean allowed = matchUserRoleWithResourceRoles(requiredRolesList, userRoles);
    if (!allowed) {
      response.setStatus(HttpStatus.UNAUTHORIZED.value());
    }

    return allowed;
  }

  /**
   * Gets the access level to the requested resource.
   *
   * @param resourceHandler Array with both class and method names.
   * @param rolesConfigMap Matrix with roles and theirs access levels.
   * @param resourceOperations Access level requried for the resource.
   * @return A list of roles authorized for this resource.
   */
  private List<String> getResourceRequiredRoles(
      String[] resourceHandler,
      Map<String, char[]> rolesConfigMap,
      List<Character> resourceOperations) {
    List<String> resultList = new ArrayList<>();
    for (Map.Entry<String, char[]> entry : rolesConfigMap.entrySet()) {
      int rolesRequired = resourceOperations.size();
      int matchedSum = 0;
      for (char rolesOperation : entry.getValue()) {
        if (resourceOperations.contains(rolesOperation)) {
          matchedSum++;
        }
      }
      if (matchedSum == rolesRequired) {
        resultList.add(entry.getKey());
      }
    }

    SparLog.info("Roles allowed for this endpoint: {}", resultList);

    return resultList;
  }

  /**
   * Matches the required roles with user roles.
   *
   * @param requiredRolesList List of roles quired for this resource.
   * @param userRoles List of user roles.
   * @return True if allowed, if found a matching user role, false otherwise.
   */
  private boolean matchUserRoleWithResourceRoles(
      List<String> requiredRolesList, List<String> userRoles) {
    for (String requiredRole : requiredRolesList) {
      if (userRoles.contains(requiredRole)) {
        SparLog.info("Request allowed by user role: {}", requiredRole);
        return true;
      }
    }
    SparLog.info("Request denied. No enough access levels!");
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
      Jwt jwtPrincipal = jwtToken.getToken();
      Set<String> roles = new HashSet<>();
      if (jwtPrincipal.getClaims().containsKey("cognito:groups")) {
        Object clientRolesObj = jwtPrincipal.getClaims().get("cognito:groups");
        if (clientRolesObj instanceof List<?> list) {
          for (Object item : list) {
            String role = String.valueOf(item);
            // Removes Client Number
            String clientNumber = role.substring(role.length() - 8);
            if (clientNumber.replaceAll("[0-9]", "").isEmpty()) {
              role = role.substring(0, role.length() - 9); // Removes dangling underscore
            }
            roles.add(role);
          }
        }
      }

      SparLog.info("User roles: {}", roles);
      return new ArrayList<>(roles);
    }

    // Test fix!
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
      SparLog.info("SPAR Test User roles: {}", grantedList);
      return grantedList;
    }

    return List.of();
  }

  /**
   * Gets the CRUD resources from a class and method handlers annotated with {@link
   * AccessLevelRequired}. This config should container which CRUD operations that endpoint will be
   * doing.
   *
   * @param classNameWithMethod String Array containing handlers
   * @return String array containing all the operations declared. E.g.: [R], [C,R]
   */
  private List<Character> getResourceOperations(String[] classNameWithMethod) {
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
        AccessLevelRequired config = method.getAnnotation(AccessLevelRequired.class);
        if (Objects.isNull(config)) {
          SparLog.warn("API missing CrudOperationsConfig {}#{}", className, methodName);
          return List.of();
        }

        // char[] operations = config.value();
        List<Character> operations = new ArrayList<>();
        for (char op : config.value()) {
          operations.add(op);
        }
        SparLog.info("Operations for {}#{}: {}", className, methodName, operations);
        return operations;
      }
    } catch (Exception e) {
      SparLog.warn("Exception when getting resource operations for {}#{}", className, methodName);
    }
    return List.of();
  }

  /**
   * Gets the matrix with all declared roles and permissions to each role.
   *
   * @param classNameWithMethod String Array containing handlers
   * @param uri Request URI.
   * @return A Map containing the declared roles and resources, or empty map.
   */
  private Map<String, char[]> getResourceRolesMatrix(
      String[] classNameWithMethod, String uri, List<Character> resourceOperations) {
    List<String> combination = getClassAndMethodNames(classNameWithMethod);

    if (combination.isEmpty()) {
      return Map.of();
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
          return Map.of();
        }
        RoleAccessConfig annotation = method.getAnnotation(RoleAccessConfig.class);
        if (Objects.isNull(annotation)) {
          SparLog.warn("API missing CrudMatrixFilterConfigs {}#{}", className, methodName);
          return Map.of();
        }

        AccessLevel[] configs = annotation.value();
        SparLog.info("Access level required for {}: {}", uri, resourceOperations);
        SparLog.info("Roles declared and its permissions:");
        Map<String, char[]> roleMap = new HashMap<>();
        for (AccessLevel config : configs) {
          SparLog.info("Role={} accessLevel={}", config.role(), config.crudAccess());
          roleMap.put(config.role(), config.crudAccess());
        }

        return roleMap;
      }
    } catch (Exception e) {
      SparLog.warn(
          "Exception when getting roles matrix operations for {}#{}", className, methodName);
    }
    return Map.of();
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
