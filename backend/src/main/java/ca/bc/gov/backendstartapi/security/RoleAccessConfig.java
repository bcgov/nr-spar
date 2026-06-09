package ca.bc.gov.backendstartapi.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** This interface holds a list of roles to be used for each endpoint access level. */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RoleAccessConfig {

  /**
   * Sentinel role that grants access to any authenticated user, regardless of their roles.
   * Authentication itself is still enforced by the security filter chain on {@code /api/**}. Use
   * this for endpoints intended to be consumed by external applications whose users authenticate
   * through the shared Cognito/IDIR pool but do not carry SPAR roles.
   */
  String ANY_AUTHENTICATED = "ANY_AUTHENTICATED";

  /**
   * Defines an array with one or more roles.
   *
   * @return An array containing the roles
   */
  String[] value();
}
