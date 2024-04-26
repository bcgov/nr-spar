package ca.bc.gov.backendstartapi.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** This interface holds the CRUD access level required to a resource endpoint. */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AccessLevelRequired {

  /**
   * Defines the values for the CRUD access level. One of: C, R, U, D.
   *
   * @return An array containing the levels.
   */
  String[] value();
}
