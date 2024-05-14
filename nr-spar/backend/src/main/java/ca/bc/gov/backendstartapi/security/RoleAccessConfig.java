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
   * Defines an array with one or more roles.
   *
   * @return An array containing the roles
   */
  String[] value();
}
