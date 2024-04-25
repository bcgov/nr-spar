package ca.bc.gov.backendstartapi.interceptor;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.filter.CrudMatrixFilterConfig;
import ca.bc.gov.backendstartapi.filter.CrudMatrixFilterConfigs;
import ca.bc.gov.backendstartapi.filter.CrudOperationsConfig;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class CrudMatrixInterceptor implements HandlerInterceptor {

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

    List<String> resourceOperations = getResourceOperations(resourceHandler);

    // Gets the allowed roles (declared) and its allowed operations for the resource
    Map<String, String[]> rolesConfigMap =
        getResourceRolesMatrix(resourceHandler, requestUri, resourceOperations);

    /*
     * Gets roles from the resource that can operate given the resource operation. Allow me to hightlight
     * that only roles that are allowed to do the operation (C,R,U,D) will be returned.
     * Returns something like:
     * R - [SPAR_TSC_ADMIN, SPAR_MINISTRY_ORCHARD, SPAR_NONMINISTRY_ORCHARD]
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

  private List<String> getResourceRequiredRoles(
      String[] resourceHandler,
      Map<String, String[]> rolesConfigMap,
      List<String> resourceOperations) {
    List<String> resultList = new ArrayList<>();
    for (Map.Entry<String, String[]> entry : rolesConfigMap.entrySet()) {
      int rolesRequired = resourceOperations.size();
      int matchedSum = 0;
      for (String rolesOperation : entry.getValue()) {
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
    return List.of();
  }

  /**
   * Gets the CRUD resources from a class and method handlers annotated with {@link
   * CrudOperationsConfig}. This config should container which CRUD operations that endpoint will be
   * doing.
   *
   * @param classNameWithMethod String Array containing handlers
   * @return String array containing all the operations declared. E.g.: [R], [C,R]
   */
  private List<String> getResourceOperations(String[] classNameWithMethod) {
    List<String> combination = getClassAndMethodNames(classNameWithMethod);

    if (combination.isEmpty()) {
      return List.of();
    }

    String className = combination.get(0);
    String methodName = combination.get(1);

    try {
      Class<?> handlerClass = Class.forName(className);
      if (!Objects.isNull(handlerClass)) {
        Method method = handlerClass.getMethod(methodName);
        CrudOperationsConfig config = method.getAnnotation(CrudOperationsConfig.class);
        if (Objects.isNull(config)) {
          SparLog.warn("API missing CrudOperationsConfig {}#{}", className, methodName);
          return List.of();
        }

        String[] operations = config.operations();
        SparLog.info(
            "Operations for {}#{}: {}", className, methodName, Arrays.toString(operations));
        return Arrays.asList(operations);
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
  private Map<String, String[]> getResourceRolesMatrix(
      String[] classNameWithMethod, String uri, List<String> resourceOperations) {
    List<String> combination = getClassAndMethodNames(classNameWithMethod);

    if (combination.isEmpty()) {
      return Map.of();
    }

    String className = combination.get(0);
    String methodName = combination.get(1);

    try {
      Class<?> handlerClass = Class.forName(className);
      if (!Objects.isNull(handlerClass)) {
        Method method = handlerClass.getMethod(methodName);
        CrudMatrixFilterConfigs annotation = method.getAnnotation(CrudMatrixFilterConfigs.class);
        if (Objects.isNull(annotation)) {
          SparLog.warn("API missing CrudMatrixFilterConfigs {}#{}", className, methodName);
          return Map.of();
        }

        CrudMatrixFilterConfig[] configs = annotation.config();
        SparLog.info("Access level required for {}: {}", uri, resourceOperations);
        SparLog.info("Roles declared and its permissions:");
        Map<String, String[]> roleMap = new HashMap<>();
        for (CrudMatrixFilterConfig config : configs) {
          SparLog.info("Role={} accessLevel={}", config.role(), config.operationsAllowed());
          roleMap.put(config.role(), config.operationsAllowed());
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
