package ca.bc.gov.backendstartapi.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Rejects null JSON nodes, missing nodes, scalar values, and non-object/array nodes. */
@Documented
@Constraint(validatedBy = ValidSearchCriteriaJsonValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidSearchCriteriaJson {

  /** Returns the validation error message. */
  String message() default "criteriaJson must be non-null JSON (object or array)";

  /** Returns the validation groups this constraint belongs to. */
  Class<?>[] groups() default {};

  /** Returns the payload associated with this constraint. */
  Class<? extends Payload>[] payload() default {};
}
