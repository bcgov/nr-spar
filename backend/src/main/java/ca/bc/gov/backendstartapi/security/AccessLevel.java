package ca.bc.gov.backendstartapi.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** This interface holds each role and its allowed operations, access levels. */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AccessLevel {

  /**
   * Defines the role name.
   *
   * @return The role.
   */
  String role();

  /**
   * Defined the operations allowed, the access level for the role.
   *
   * @return An array containing the access level.
   */
  String[] crudAccess();
}
