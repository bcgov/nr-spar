package ca.bc.gov.backendstartapi.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** This interface holds a list of roles and its allowed operations, access levels. */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RoleAccessConfig {

  /**
   * Defines an array with one or more {@link AccessLevel}.
   *
   * @return An array of {@link AccessLevel}
   */
  String[] value();
}
